require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://api-east.viewpointcloud.com/v2/austellga/records';
const PORTAL_BASE = 'https://austellga.portal.opengov.com/records';

const RECORD_TYPES = [
  { id: 6334, name: 'Residential Building Permit' },
  { id: 6433, name: 'Commercial Building Permit' },
  { id: 6438, name: 'Mechanical Permit' },
  { id: 6439, name: 'Plumbing Permit' },
  { id: 6352, name: 'Electrical Permit' },
  { id: 6441, name: 'Solar Panel Permit' },
  { id: 6398, name: 'Sign Permit' },
  { id: 6475, name: 'Misc Land Disturbance Permit' },
  { id: 6478, name: 'Clearing And/or Grading Permit' },
  { id: 6479, name: 'Right-Of-Way Driveway Permit' },
  { id: 6480, name: 'Right-Of-Way Utility Permit' },
  { id: 6359, name: 'Fire Alarm System Permit' },
  { id: 6360, name: 'Fire Suppression System' },
  { id: 6361, name: 'Sprinkler System Permit' },
];

const HEADERS = {
  'Accept': 'application/json',
  'Origin': 'https://austellga.portal.opengov.com',
  'Referer': 'https://austellga.portal.opengov.com/',
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
  console.log(`[Austell] Fetching permits since ${since}...`);

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

  console.log(`[Austell] ${unique.length} total active, ${newRecords.length} new since ${since}`);

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
      county:         'Austell',
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
