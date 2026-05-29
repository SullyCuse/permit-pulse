require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://services1.arcgis.com/bqfNVPUK3HOnCFmA/arcgis/rest/services/Building_Permits_Issued/FeatureServer/0';
const PAGE_SIZE = 2000;

const OUT_FIELDS = 'JobID,JobAddress,JobTypeDescription,JobStatus,JobSquareFootage,ISSUE_DATE';

const geocodeCache = new Map();

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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

async function reverseGeocode(lat, lng) {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('  GOOGLE_MAPS_API_KEY not set — zip_code will be null');
    return null;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await sleep(1000 * attempt);

      const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { latlng: `${lat},${lng}`, key: apiKey },
        timeout: 5000,
      });

      if (data.status === 'OVER_QUERY_LIMIT') {
        console.warn(`  Rate limited by Google Maps API, retrying (attempt ${attempt + 1})...`);
        continue;
      }

      if (data.status !== 'OK' || !data.results?.length) {
        geocodeCache.set(key, null);
        return null;
      }

      const components = data.results[0].address_components;
      const zip = components.find(c => c.types.includes('postal_code'))?.short_name ?? null;
      const city = components.find(c => c.types.includes('locality'))?.long_name ?? null;

      const result = { zip, city };
      geocodeCache.set(key, result);
      return result;
    } catch (err) {
      console.warn(`  Reverse geocode failed for (${lat}, ${lng}): ${err.message}`);
    }
  }

  geocodeCache.set(key, null);
  return null;
}

async function fetchNewPermits(lastTimestampMs = 0) {
  const since = lastTimestampMs
    ? new Date(lastTimestampMs).toISOString().split('T')[0]
    : 'beginning';
  console.log(`[Johns Creek] Fetching permits since ${since}...`);

  const allFeatures = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      where: `ISSUE_DATE > ${msToArcgisTimestamp(lastTimestampMs)}`,
      outFields: OUT_FIELDS,
      returnGeometry: 'true',
      outSR: '4326',
      orderByFields: 'ISSUE_DATE ASC',
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

  console.log(`[Johns Creek] Found ${allFeatures.length} permits`);

  if (allFeatures.length === 0) return { permits: [], maxTimestamp: lastTimestampMs };

  const permits = allFeatures.map(f => {
    const a = f.attributes;
    return {
      permit_number: String(a.JobID),
      address:       a.JobAddress ?? null,
      zip_code:      null,
      permit_type:   a.JobTypeDescription ?? null,
      description:   null,
      date_filed:    msToIsoDate(a.ISSUE_DATE),
      county:        'Johns Creek',
      raw_data:      a,
      _geometry:     f.geometry ?? null,
    };
  });

  let geocoded = 0;
  let noGeometry = 0;
  for (const permit of permits) {
    const geo = permit._geometry;
    if (geo?.x && geo?.y) {
      const cacheKey = `${geo.y.toFixed(5)},${geo.x.toFixed(5)}`;
      const cached = geocodeCache.has(cacheKey);
      const result = await reverseGeocode(geo.y, geo.x);
      if (result?.zip) {
        permit.zip_code = result.zip;
        geocoded++;
      }
      if (result?.city && permit.address) {
        permit.address = `${permit.address}, ${result.city}`;
      }
      if (!cached) await sleep(150);
    } else {
      noGeometry++;
    }
    delete permit._geometry;
  }
  if (geocoded > 0) console.log(`  Geocoding: ${geocoded} zips resolved`);
  if (noGeometry > 0) console.log(`  No geometry: ${noGeometry} permits skipped`);

  const maxTimestamp = allFeatures.reduce(
    (max, f) => Math.max(max, f.attributes.ISSUE_DATE || 0),
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
