require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://bryangis.bryan-county.org/arcgis/rest/services/LandUsePermits/MapServer/0';
const PAGE_SIZE = 2000;

const OUT_FIELDS = 'PERMITID,PERMITTYPE,PERMITDESC,FULLADDR,APPROVEDT,LASTUPDATE';

// Cache reverse geocode results to avoid duplicate API calls
const zipCache = new Map();

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

// Reverse geocode lat/lng → zip code using Google Maps API
async function reverseGeocodeZip(lat, lng) {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (zipCache.has(key)) return zipCache.get(key);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('  GOOGLE_MAPS_API_KEY not set — zip_code will be null');
    return null;
  }

  try {
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { latlng: `${lat},${lng}`, key: apiKey },
      timeout: 5000,
    });

    if (data.status !== 'OK' || !data.results?.length) {
      zipCache.set(key, null);
      return null;
    }

    const zipComponent = data.results[0].address_components.find(c =>
      c.types.includes('postal_code')
    );

    const zip = zipComponent?.short_name ?? null;
    zipCache.set(key, zip);
    return zip;
  } catch (err) {
    console.warn(`  Reverse geocode failed for (${lat}, ${lng}): ${err.message}`);
    zipCache.set(key, null);
    return null;
  }
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
      returnGeometry: 'true',
      outSR: '4326',
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
      _geometry:     f.geometry ?? null,
    };
  });

  // Reverse geocode lat/lng from ArcGIS geometry — more reliable than forward
  // geocoding a bare street address with no city name.
  let geocoded = 0;
  for (const permit of permits) {
    const geo = permit._geometry;
    if (geo?.x && geo?.y) {
      permit.zip_code = await reverseGeocodeZip(geo.y, geo.x);
      if (permit.zip_code) geocoded++;
    }
    delete permit._geometry;
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
