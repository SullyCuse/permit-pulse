require('dotenv').config();
const axios = require('axios');
const { geocodeAddress } = require('./gwinnett-geocode');

const PERMITS_URL = 'https://geo.forsythco.com/gis3/rest/services/Public_EnerGovPlans/Building_Permits/MapServer/0/query';
const ADDRESS_URL = 'https://geo.forsythco.com/gis/rest/services/EnerGov/EnerGovParcelAddressMapService/MapServer/0/query';

const PAGE_SIZE = 1000;
const ADDRESS_BATCH = 200;

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

// Normalize PIN/ParcelNumber for consistent comparison (collapse internal spaces)
function normalizePin(pin) {
  return pin?.trim().replace(/\s+/g, ' ') ?? '';
}

async function fetchPermitsSince(lastTimestampMs) {
  const allFeatures = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      where: `IssueDate > ${msToArcgisTimestamp(lastTimestampMs)}`,
      outFields: 'PermitNumber,PermitType,PermitClass,PermitClassDescription,PermitStatus,IssueDate,ApplyDate,ParcelNumber,Link',
      orderByFields: 'IssueDate ASC',
      resultOffset: String(offset),
      resultRecordCount: String(PAGE_SIZE),
      f: 'json',
    });

    const { data } = await axios.get(`${PERMITS_URL}?${params}`, { timeout: 30000 });
    const features = data.features || [];
    allFeatures.push(...features);

    if (features.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return allFeatures;
}

async function lookupAddressBatch(rawParcelNumbers) {
  // Query using raw values so they match DB exactly; normalize keys on return
  // Use POST to avoid URL length limits with large IN clauses
  const quoted = rawParcelNumbers.map(p => `'${p.replace(/'/g, "''")}'`).join(',');
  const params = new URLSearchParams({
    where: `PIN IN (${quoted})`,
    outFields: 'PIN,FULLADDR,ZIPCODE,MUNICIPALITY',
    f: 'json',
  });

  const { data } = await axios.post(ADDRESS_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000,
  });
  const features = data.features || [];

  const map = {};
  for (const f of features) {
    const { PIN, FULLADDR, ZIPCODE, MUNICIPALITY } = f.attributes;
    if (PIN) map[normalizePin(PIN)] = { address: FULLADDR || null, zip_code: ZIPCODE || null, city: MUNICIPALITY || null };
  }
  return map;
}

async function buildAddressMap(features) {
  // Keep raw parcel numbers for the SQL IN clause
  const rawParcelNumbers = [...new Set(
    features.map(f => f.attributes.ParcelNumber).filter(Boolean)
  )];

  if (rawParcelNumbers.length === 0) return {};

  const addressMap = {};
  for (let i = 0; i < rawParcelNumbers.length; i += ADDRESS_BATCH) {
    const batch = rawParcelNumbers.slice(i, i + ADDRESS_BATCH);
    const batchMap = await lookupAddressBatch(batch);
    Object.assign(addressMap, batchMap);
    if (i + ADDRESS_BATCH < rawParcelNumbers.length) {
      process.stdout.write(`  Address lookup: ${Math.min(i + ADDRESS_BATCH, rawParcelNumbers.length)}/${rawParcelNumbers.length}\r`);
    }
  }
  console.log(`  Address lookup: ${rawParcelNumbers.length}/${rawParcelNumbers.length} done`);

  return addressMap;
}

async function fetchNewPermits(lastTimestampMs = 0) {
  const since = lastTimestampMs
    ? new Date(lastTimestampMs).toISOString().split('T')[0]
    : 'beginning';
  console.log(`[Forsyth County] Fetching permits since ${since}...`);

  const features = await fetchPermitsSince(lastTimestampMs);
  console.log(`[Forsyth County] Found ${features.length} new permits`);

  if (features.length === 0) return { permits: [], maxTimestamp: lastTimestampMs };

  const addressMap = await buildAddressMap(features);

  const permits = features.map(f => {
    const a = f.attributes;
    const parcel = normalizePin(a.ParcelNumber);
    const addr = addressMap[parcel] ?? null;

    return {
      permit_number:  a.PermitNumber,
      address:        addr?.address ?? null,
      zip_code:       addr?.zip_code ?? null,
      permit_type:    a.PermitType ?? null,
      description:    a.PermitClassDescription || a.PermitClass || null,
      date_filed:     msToIsoDate(a.IssueDate),
      county:         'Forsyth',
      parcel_number:  parcel || null,
      raw_data:       a,
    };
  });

  // Fallback: geocode any permits that still have no zip code
  for (const permit of permits) {
    if (!permit.zip_code && permit.address) {
      permit.zip_code = await geocodeAddress(permit.address);
    }
  }

  const maxTimestamp = features.reduce((max, f) => Math.max(max, f.attributes.IssueDate || 0), lastTimestampMs);

  return { permits, maxTimestamp };
}

module.exports = { fetchNewPermits };

if (require.main === module) {
  // Default: last 30 days
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
