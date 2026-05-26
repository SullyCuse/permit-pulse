require('dotenv').config();
const axios = require('axios');
const { geocodeAddress } = require('./gwinnett-geocode');

const PERMITS_URL = 'https://pub.sagis.org/arcgis/rest/services/Savannah/BuildingPermit/MapServer/0/query';
const PAGE_SIZE = 2000;

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

async function fetchPermitsSince(lastTimestampMs) {
  const allFeatures = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      where: `IssuedDate_DATE > ${msToArcgisTimestamp(lastTimestampMs)}`,
      outFields: 'PermitNumber,PermitType,WorkClass,PermitStatus,Address,IssuedDate,IssuedDate_DATE,Permit_Value,Description,PIN,ApplicantName',
      orderByFields: 'IssuedDate_DATE ASC',
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

async function fetchNewPermits(lastTimestampMs = 0) {
  const since = lastTimestampMs
    ? new Date(lastTimestampMs).toISOString().split('T')[0]
    : 'beginning';
  console.log(`[Savannah] Fetching permits since ${since}...`);

  const features = await fetchPermitsSince(lastTimestampMs);
  console.log(`[Savannah] Found ${features.length} new permits`);

  if (features.length === 0) return { permits: [], maxTimestamp: lastTimestampMs };

  const permits = features.map(f => {
    const a = f.attributes;
    // Address field is street only — city appended for geocoding, zip resolved below
    const streetAddress = a.Address ? `${a.Address}, Savannah, GA` : null;

    return {
      permit_number:   a.PermitNumber,
      address:         streetAddress,
      zip_code:        null,
      permit_type:     a.PermitType ?? null,
      description:     a.Description ?? a.WorkClass ?? null,
      date_filed:      msToIsoDate(a.IssuedDate_DATE),
      applicant_name:  a.ApplicantName ?? null,
      county:          'Savannah',
      parcel_number:   a.PIN ?? null,
      raw_data:        a,
    };
  });

  // Geocode to get zip codes
  let geocoded = 0;
  for (const permit of permits) {
    if (permit.address) {
      permit.zip_code = await geocodeAddress(permit.address);
      if (permit.zip_code) geocoded++;
    }
    process.stdout.write(`  Geocoding: ${geocoded} done\r`);
  }
  console.log(`  Geocoding: ${geocoded}/${permits.length} resolved`);

  const maxTimestamp = features.reduce(
    (max, f) => Math.max(max, f.attributes.IssuedDate_DATE || 0),
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
