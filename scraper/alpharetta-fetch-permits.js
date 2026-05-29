require('dotenv').config();
const axios = require('axios');
const { geocodeAddress } = require('./gwinnett-geocode');

const BASE_URL = 'https://alphagis.alpharetta.ga.us/arcgis/rest/services/OpenData/OpenData_PCE_Full/FeatureServer';
const COMMERCIAL_LAYER = 1;
const RESIDENTIAL_LAYER = 3;
const PAGE_SIZE = 5000;

const OUT_FIELDS = 'CA_OBJECT_ID,CASE_NUMBER,CASE_TYPE_DESC,CASE_NAME,STATUS_CODE,DATE_ENTERED,Location';

function msToIsoDate(ms) {
  if (!ms) return null;
  return new Date(ms).toISOString().split('T')[0];
}

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

// Extract 5-digit zip code from an Alpharetta Location string, e.g.
// "100 Mansell Court East, Alpharetta, GA, 30076"  →  "30076"
function extractZip(location) {
  if (!location) return null;
  const match = location.match(/\b(3\d{4})\b/);
  return match ? match[1] : null;
}

async function fetchLayerSince(layer, lastTimestampMs) {
  const allFeatures = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      where: `DATE_ENTERED > ${msToArcgisTimestamp(lastTimestampMs)}`,
      outFields: OUT_FIELDS,
      orderByFields: 'DATE_ENTERED ASC',
      resultOffset: String(offset),
      resultRecordCount: String(PAGE_SIZE),
      f: 'json',
    });

    const { data } = await axios.get(`${BASE_URL}/${layer}/query?${params}`, { timeout: 30000 });
    const features = data.features || [];
    allFeatures.push(...features);

    if (features.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return allFeatures;
}

async function fetchNewPermits(lastTimestampMs = 0) {
  const since = lastTimestampMs
    ? new Date(lastTimestampMs).toISOString().split('T')[0]
    : 'beginning';
  console.log(`[Alpharetta] Fetching permits since ${since}...`);

  const [commercial, residential] = await Promise.all([
    fetchLayerSince(COMMERCIAL_LAYER, lastTimestampMs),
    fetchLayerSince(RESIDENTIAL_LAYER, lastTimestampMs),
  ]);

  const allFeatures = [...commercial, ...residential];
  console.log(`[Alpharetta] Found ${commercial.length} commercial + ${residential.length} residential = ${allFeatures.length} permits`);

  if (allFeatures.length === 0) return { permits: [], maxTimestamp: lastTimestampMs };

  const permits = allFeatures.map(f => {
    const a = f.attributes;
    const zip = extractZip(a.Location);

    return {
      permit_number: a.CASE_NUMBER,
      address:       a.Location ?? null,
      zip_code:      zip,
      permit_type:   a.CASE_TYPE_DESC ?? null,
      description:   a.CASE_NAME ?? null,
      date_filed:    msToIsoDate(a.DATE_ENTERED),
      county:        'Alpharetta',
      raw_data:      a,
    };
  });

  // Geocode any permits without a zip code
  let geocoded = 0;
  for (const permit of permits) {
    if (!permit.zip_code && permit.address) {
      permit.zip_code = await geocodeAddress(permit.address);
      if (permit.zip_code) geocoded++;
    }
  }
  if (geocoded > 0) console.log(`  Geocoding: ${geocoded} zips resolved`);

  const maxTimestamp = Math.min(
    allFeatures.reduce((max, f) => Math.max(max, f.attributes.DATE_ENTERED || 0), lastTimestampMs),
    Date.now()
  );

  return { permits, maxTimestamp };
}

module.exports = { fetchNewPermits };

if (require.main === module) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  fetchNewPermits(thirtyDaysAgo)
    .then(({ permits, maxTimestamp }) => {
      console.log('\n--- SAMPLE PERMIT ---');
      console.log(JSON.stringify(permits[0], null, 2));
      console.log(`\nTotal permits: ${permits.length}`);
      console.log(`Max timestamp: ${new Date(maxTimestamp).toISOString()}`);
    })
    .catch(console.error);
}
