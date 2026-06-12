require('dotenv').config();
const axios = require('axios');
const { geocodeAddress } = require('./gwinnett-geocode');

const PERMITS_URL = 'https://geo.forsythco.com/gis3/rest/services/Public_EnerGovPlans/Building_Permits/MapServer/0/query';
const ADDRESS_URL = 'https://geo.forsythco.com/gis/rest/services/EnerGov/EnerGovParcelAddressMapService/MapServer/0/query';
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

const PAGE_SIZE = 1000;
const ADDRESS_BATCH = 200;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function msToIsoDate(ms) {
  if (!ms) return null;
  return new Date(ms).toISOString().split('T')[0];
}

// ── Reverse geocoding (fallback for permits with no parcel-address match) ──────
// Commercial permits often carry a PIN that isn't in the address-point service,
// so the parcel→address lookup returns nothing. Every permit feature does carry
// a point geometry, so we reverse-geocode that to recover street/zip/city.
// Cached in geocode_cache keyed `geo:lat,lng` (zip+city only — see CLAUDE.md).

const geoMemCache = new Map();

let _supabase = null;
function getSupabase() {
  if (!_supabase && process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _supabase;
}

// Build a "Street, City" display address from a Google result's components.
function formatStreetCity(result) {
  const c = result.address_components;
  const num    = c.find(x => x.types.includes('street_number'))?.long_name ?? '';
  const route  = c.find(x => x.types.includes('route'))?.long_name ?? '';
  const city   = c.find(x => x.types.includes('locality'))?.long_name ?? null;
  const zip    = c.find(x => x.types.includes('postal_code'))?.short_name ?? null;
  const street = `${num} ${route}`.trim() || null;
  const address = street ? (city ? `${street}, ${city}` : street) : (city ?? null);
  return { address, zip, city };
}

// Reverse-geocode a WGS84 point → { address, zip, city }. zip/city cached in
// geocode_cache; the street part is only available on a live (uncached) call.
async function reverseGeocode(lat, lng) {
  const key = `geo:${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geoMemCache.has(key)) return geoMemCache.get(key);

  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from('geocode_cache')
      .select('zip_code, city')
      .eq('address', key)
      .maybeSingle();
    if (data !== null) {
      const cached = { address: data.city ?? null, zip: data.zip_code, city: data.city };
      geoMemCache.set(key, cached);
      return cached;
    }
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return { address: null, zip: null, city: null };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await sleep(1000 * attempt);
      const { data } = await axios.get(GEOCODE_URL, {
        params: { latlng: `${lat},${lng}`, key: apiKey },
        timeout: 5000,
      });

      if (data.status === 'OVER_QUERY_LIMIT') {
        console.warn(`  Google rate limited, retrying (attempt ${attempt + 1})...`);
        continue;
      }
      if (data.status !== 'OK' || !data.results?.length) {
        geoMemCache.set(key, { address: null, zip: null, city: null });
        if (sb) await sb.from('geocode_cache').upsert({ address: key, zip_code: null, city: null }, { onConflict: 'address' });
        return { address: null, zip: null, city: null };
      }

      const result = formatStreetCity(data.results[0]);
      geoMemCache.set(key, result);
      if (sb) await sb.from('geocode_cache').upsert({ address: key, zip_code: result.zip, city: result.city }, { onConflict: 'address' });
      return result;
    } catch (err) {
      console.warn(`  Reverse geocode failed for (${lat}, ${lng}): ${err.message}`);
    }
  }
  geoMemCache.set(key, { address: null, zip: null, city: null });
  return { address: null, zip: null, city: null };
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
      returnGeometry: 'true',
      outSR: '4326',
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
      address:        addr?.address && addr?.city ? `${addr.address}, ${addr.city}` : (addr?.address ?? null),
      zip_code:       addr?.zip_code ?? null,
      permit_type:    a.PermitType ?? null,
      description:    a.PermitClassDescription || a.PermitClass || null,
      date_filed:     msToIsoDate(a.IssueDate),
      source_url:     a.Link ?? null,
      county:         'Forsyth',
      parcel_number:  parcel || null,
      _geometry:      f.geometry ?? null,
      raw_data:       a,
    };
  });

  // Fallback 1: parcel had no address-point match (common for commercial PINs) —
  // reverse-geocode the permit's point geometry to recover street/zip/city.
  for (const permit of permits) {
    if (!permit.address && permit._geometry) {
      const { x: lng, y: lat } = permit._geometry;
      if (typeof lat === 'number' && typeof lng === 'number') {
        const geo = await reverseGeocode(lat, lng);
        if (geo.address) permit.address = geo.address;
        if (geo.zip) permit.zip_code = geo.zip;
      }
    }
  }

  // Fallback 2: have an address but still no zip — forward-geocode for the zip.
  for (const permit of permits) {
    if (!permit.zip_code && permit.address) {
      permit.zip_code = await geocodeAddress(permit.address);
    }
  }

  // Drop the transient geometry field before handing permits to the upserter.
  for (const permit of permits) delete permit._geometry;

  const maxTimestamp = Math.min(
    features.reduce((max, f) => Math.max(max, f.attributes.IssueDate || 0), lastTimestampMs),
    Date.now()
  );

  return { permits, maxTimestamp };
}

module.exports = { fetchNewPermits, reverseGeocode };

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
