require('dotenv').config();
const axios = require('axios');
const { geocodeAddress } = require('./gwinnett-geocode');

const BASE_URL = 'https://bryangis.bryan-county.org/arcgis/rest/services/LandUsePermits/MapServer/0';
const PAGE_SIZE = 2000;

const OUT_FIELDS = 'PERMITID,PERMITTYPE,PERMITDESC,FULLADDR,APPROVEDT,LASTUPDATE';

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

async function fetchNewPermits(lastTimestampMs = 0) {
  const since = lastTimestampMs
    ? new Date(lastTimestampMs).toISOString().split('T')[0]
    : 'beginning';
  console.log(`[Bryan County] Fetching permits since ${since}...`);

  const allFeatures = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      where: `LASTUPDATE > ${msToArcgisTimestamp(lastTimestampMs)}`,
      outFields: OUT_FIELDS,
      orderByFields: 'LASTUPDATE ASC',
      resultOffset: String(offset),
      resultRecordCount: String(PAGE_SIZE),
      f: 'json',
    });

    const { data } = await axios.get(`${BASE_URL}/query?${params}`, { timeout: 30000 });
    const features = data.features || [];
    allFeatures.push(...features);

    if (features.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  console.log(`[Bryan County] Found ${allFeatures.length} permits`);

  if (allFeatures.length === 0) return { permits: [], maxTimestamp: lastTimestampMs };

  const permits = allFeatures.map(f => {
    const a = f.attributes;
    return {
      permit_number: String(a.PERMITID),
      address:       a.FULLADDR ?? null,
      zip_code:      null,
      permit_type:   a.PERMITTYPE ?? null,
      description:   a.PERMITDESC ?? null,
      date_filed:    msToIsoDate(a.APPROVEDT),
      county:        'Bryan County',
      raw_data:      a,
    };
  });

  // All Bryan County addresses lack zip codes — geocode every permit
  let geocoded = 0;
  for (const permit of permits) {
    if (permit.address) {
      const fullAddress = `${permit.address}, Bryan County, GA`;
      permit.zip_code = await geocodeAddress(fullAddress);
      if (permit.zip_code) geocoded++;
    }
  }
  if (geocoded > 0) console.log(`  Geocoding: ${geocoded} zips resolved`);

  const maxTimestamp = allFeatures.reduce(
    (max, f) => Math.max(max, f.attributes.LASTUPDATE || 0),
    lastTimestampMs
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
