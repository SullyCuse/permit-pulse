require('dotenv').config();
const axios = require('axios');

// Augusta (Richmond County) — Cityview_Permit table (Table ID: 1)
const BASE_URL = 'https://gismap.augustaga.gov/arcgis/rest/services/EnterpriseApps/iasWorld_Permit/MapServer/1';
const PAGE_SIZE = 2000;

const OUT_FIELDS = 'PERMITNUMBER,JOBADDRESS,PERM_TYPE,DATE_ISSUE,PERMIT_STATUS,WORKCOST';

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

// JOBADDRESS already includes full address with zip ("805 Heard Ave, Augusta, GA 30904")
function extractZip(address) {
  if (!address) return null;
  const match = address.match(/\b(\d{5})\b/);
  return match ? match[1] : null;
}

async function fetchNewPermits(lastTimestampMs = 0) {
  const since = lastTimestampMs
    ? new Date(lastTimestampMs).toISOString().split('T')[0]
    : 'beginning';
  console.log(`[Augusta] Fetching permits since ${since}...`);

  const allFeatures = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      where: `DATE_ISSUE > ${msToArcgisTimestamp(lastTimestampMs)}`,
      outFields: OUT_FIELDS,
      returnGeometry: 'false',
      orderByFields: 'DATE_ISSUE ASC',
      resultOffset: String(offset),
      resultRecordCount: String(PAGE_SIZE),
      f: 'json',
    });

    const { data } = await axios.get(`${BASE_URL}/query?${params}`, { timeout: 30000 });

    if (data.error) {
      throw new Error(`ArcGIS error: ${JSON.stringify(data.error)}`);
    }

    const features = data.features || [];
    allFeatures.push(...features);

    if (features.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  console.log(`[Augusta] Found ${allFeatures.length} permits`);

  if (allFeatures.length === 0) return { permits: [], maxTimestamp: lastTimestampMs };

  const permits = allFeatures.map(f => {
    const a = f.attributes;
    return {
      permit_number: a.PERMITNUMBER ?? null,
      address:       a.JOBADDRESS ?? null,
      zip_code:      extractZip(a.JOBADDRESS),
      permit_type:   a.PERM_TYPE ?? null,
      description:   null,
      date_filed:    msToIsoDate(a.DATE_ISSUE),
      county:        'Augusta',
      raw_data:      a,
    };
  });

  const maxTimestamp = Math.min(
    allFeatures.reduce((max, f) => Math.max(max, f.attributes.DATE_ISSUE || 0), lastTimestampMs),
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
