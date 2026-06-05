require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://api-east.viewpointcloud.com/v2/effinghamcountyga/records';
const PORTAL_BASE = 'https://effinghamcountyga.portal.opengov.com/records';

const RECORD_TYPES = [
  { id: 6429, name: 'Commercial / Industrial Building Permit' },
  { id: 6446, name: 'Residential Building Permit' },
  { id: 6453, name: 'Demolition Permit' },
  { id: 6439, name: 'Electrical Permit' },
  { id: 6440, name: 'Mechanical Permit' },
  { id: 6438, name: 'Plumbing Permit' },
  { id: 6456, name: 'Land Disturbance Activity Permit' },
  { id: 6436, name: 'Pool Permit' },
  { id: 6450, name: 'Sign Permit' },
  { id: 6434, name: 'Residential Accessory Structure' },
  { id: 6508, name: 'Commercial/Industrial Accessory Structure' },
  { id: 6435, name: 'Mobile Home Permit' },
  { id: 6452, name: 'Slab Permit' },
  { id: 6464, name: 'Racking Permit' },
  { id: 6449, name: 'Tower Permit' },
  { id: 6461, name: 'Encroachment Permit' },
];

const HEADERS = {
  'Accept': 'application/json',
  'Origin': 'https://effinghamcountyga.portal.opengov.com',
  'Referer': 'https://effinghamcountyga.portal.opengov.com/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

function parseVpcDate(str) {
  if (!str) return 0;
  return new Date(str).getTime() || 0;
}

function toIsoDate(str) {
  if (!str) return null;
  return str.split('T')[0];
}

async function fetchRecordType(typeId) {
  const { data } = await axios.get(BASE_URL, {
    headers: HEADERS,
    params: { recordTypeID: typeId, limit: 200 },
    timeout: 30000,
  });
  return data.data || [];
}

async function fetchNewPermits(lastTimestampMs = 0) {
  const since = lastTimestampMs
    ? new Date(lastTimestampMs).toISOString().split('T')[0]
    : 'beginning';
  console.log(`[Effingham County] Fetching permits since ${since}...`);

  const allRecords = [];

  for (const type of RECORD_TYPES) {
    try {
      const records = await fetchRecordType(type.id);
      console.log(`  ${type.name}: ${records.length} records`);
      allRecords.push(...records);
    } catch (err) {
      console.error(`  ❌ Failed to fetch ${type.name}: ${err.message}`);
    }
  }

  const seen = new Set();
  const unique = allRecords.filter(r => {
    const id = r.attributes?.recordID;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const newRecords = unique.filter(r => {
    const ms = parseVpcDate(r.attributes?.dateSubmitted);
    return ms > lastTimestampMs;
  });

  console.log(`[Effingham County] ${unique.length} total active, ${newRecords.length} new since ${since}`);

  if (newRecords.length === 0) return { permits: [], maxTimestamp: lastTimestampMs };

  const permits = newRecords.map(r => {
    const a = r.attributes;
    return {
      permit_number:  a.recordNo,
      address:        a.fullAddress ?? null,
      zip_code:       a.postalCode ?? null,
      permit_type:    a.recordTypeName ?? null,
      description:    a.description ?? null,
      date_filed:     toIsoDate(a.dateSubmitted),
      county:         'Effingham County',
      applicant_name: a.applicantFullName ?? null,
      source_url:     `${PORTAL_BASE}/${a.recordID}`,
      raw_data:       a,
    };
  });

  const maxTimestamp = Math.min(
    newRecords.reduce((max, r) => Math.max(max, parseVpcDate(r.attributes?.dateSubmitted)), lastTimestampMs),
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
