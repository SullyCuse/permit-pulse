require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://services5.arcgis.com/5RxyIIJ9boPdptdo/arcgis/rest/services/building_permit_featureLayer/FeatureServer';
const PAGE_SIZE = 2000;

function msToIsoDate(ms) {
  if (!ms) return null;
  return new Date(ms).toISOString().split('T')[0];
}

// ArcGIS WHERE clause requires timestamp literal, not epoch ms
function msToArcgisTimestamp(ms) {
  if (!ms) return "timestamp '1970-01-01 00:00:00'";
  const d = new Date(ms);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `timestamp '${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}'`;
}

function extractZip(address) {
  if (!address) return null;
  const match = address.match(/\b(\d{5})(?:-\d{4})?\s*$/);
  return match ? match[1] : null;
}

const OUT_FIELDS = 'RecordID,Name,Address,TypeCombo,Use_,Subtype,Group_,Status_1,statusP,JOB_VALUE,PARCEL,QUADRANT,OrigOpened,StatusDate,ACA_Link';

async function fetchLayer(layerId, lastTimestampMs) {
  const allFeatures = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      where: `OrigOpened > ${msToArcgisTimestamp(lastTimestampMs)}`,
      outFields: OUT_FIELDS,
      orderByFields: 'OrigOpened ASC',
      resultOffset: String(offset),
      resultRecordCount: String(PAGE_SIZE),
      f: 'json',
    });

    const { data } = await axios.get(`${BASE_URL}/${layerId}/query?${params}`, { timeout: 30000 });
    const features = data.features || [];
    allFeatures.push(...features);

    if (features.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return allFeatures;
}

function normalizeFeature(f) {
  const a = f.attributes;
  const address = a.Address || null;

  return {
    permit_number: a.RecordID,
    address:       address,
    zip_code:      extractZip(address),
    permit_type:   a.TypeCombo ?? null,
    description:   [a.Use_, a.Subtype].filter(Boolean).join(' - ') || null,
    date_filed:    msToIsoDate(a.OrigOpened),
    source_url:    a.ACA_Link ?? null,
    county:        'Atlanta',
    parcel_number: a.PARCEL ?? null,
    raw_data:      a,
  };
}

async function fetchNewPermits(lastTimestampMs = 0) {
  const since = lastTimestampMs
    ? new Date(lastTimestampMs).toISOString().split('T')[0]
    : 'beginning';
  console.log(`[City of Atlanta] Fetching permits since ${since}...`);

  // Layer 0 = geocoded points, Layer 1 = non-geocoded objects; same schema, different records
  const [pointFeatures, objectFeatures] = await Promise.all([
    fetchLayer(0, lastTimestampMs),
    fetchLayer(1, lastTimestampMs),
  ]);

  // Deduplicate by RecordID in case of any overlap
  const seen = new Set();
  const allFeatures = [];
  for (const f of [...pointFeatures, ...objectFeatures]) {
    const id = f.attributes.RecordID;
    if (id && !seen.has(id)) {
      seen.add(id);
      allFeatures.push(f);
    }
  }

  console.log(`[City of Atlanta] Found ${allFeatures.length} new permits (${pointFeatures.length} geocoded, ${objectFeatures.length} non-geocoded)`);

  if (allFeatures.length === 0) return { permits: [], maxTimestamp: lastTimestampMs };

  const permits = allFeatures.map(normalizeFeature);

  const maxTimestamp = Math.min(
    allFeatures.reduce((max, f) => Math.max(max, f.attributes.OrigOpened || 0), lastTimestampMs),
    Date.now()
  );

  return { permits, maxTimestamp };
}

module.exports = { fetchNewPermits };

if (require.main === module) {
  const july1 = new Date('2025-07-01').getTime();
  fetchNewPermits(july1)
    .then(({ permits, maxTimestamp }) => {
      console.log('\n--- SAMPLE PERMIT ---');
      console.log(JSON.stringify(permits[0], null, 2));
      console.log(`\nTotal permits: ${permits.length}`);
      console.log(`Max timestamp: ${new Date(maxTimestamp).toISOString()}`);
    })
    .catch(console.error);
}
