// One-time backfill: Forsyth permits that came in with no address/zip because
// their (usually commercial) parcel number isn't in the address-point service.
// Each permit feature has a point geometry, so we reverse-geocode that to
// recover street/zip/city — same fallback the scraper now does going forward.
//
// Run from the repo root so dotenv picks up .env:
//   node scraper/backfill-forsyth-addresses.js
require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { reverseGeocode } = require('./forsyth-fetch-permits');

const PERMITS_URL = 'https://geo.forsythco.com/gis3/rest/services/Public_EnerGovPlans/Building_Permits/MapServer/0/query';
const BATCH = 100;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Fetch WGS84 point geometry for a set of permit numbers → { permitNumber: {lat,lng} }
async function fetchGeometries(permitNumbers) {
  const map = {};
  for (let i = 0; i < permitNumbers.length; i += BATCH) {
    const batch = permitNumbers.slice(i, i + BATCH);
    const where = 'PermitNumber IN (' + batch.map(p => `'${p.replace(/'/g, "''")}'`).join(',') + ')';
    const params = new URLSearchParams({
      where, outFields: 'PermitNumber', returnGeometry: 'true', outSR: '4326', f: 'json',
    });
    const { data } = await axios.post(PERMITS_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000,
    });
    for (const f of (data.features || [])) {
      if (f.geometry && typeof f.geometry.x === 'number') {
        map[f.attributes.PermitNumber] = { lat: f.geometry.y, lng: f.geometry.x };
      }
    }
  }
  return map;
}

async function backfill() {
  const { data: permits, error } = await supabase
    .from('permits')
    .select('id, permit_number, address, zip_code')
    .eq('county', 'Forsyth')
    .or('zip_code.is.null,address.is.null');

  if (error) { console.error('Fetch failed:', error.message); process.exit(1); }
  console.log(`Found ${permits.length} Forsyth permits missing address/zip`);
  if (permits.length === 0) return;

  const geoms = await fetchGeometries(permits.map(p => p.permit_number));
  console.log(`Got geometry for ${Object.keys(geoms).length}/${permits.length} permits`);

  let updated = 0, noGeom = 0, noResult = 0;
  for (const p of permits) {
    const g = geoms[p.permit_number];
    if (!g) { noGeom++; continue; }

    await sleep(200);
    const geo = await reverseGeocode(g.lat, g.lng);

    const patch = {};
    if (!p.address && geo.address) patch.address = geo.address;
    if ((!p.zip_code || p.zip_code === '') && geo.zip) patch.zip_code = geo.zip;
    if (Object.keys(patch).length === 0) { noResult++; continue; }

    const { error: upErr } = await supabase.from('permits').update(patch).eq('id', p.id);
    if (upErr) { console.error(`  ❌ ${p.permit_number}: ${upErr.message}`); continue; }
    updated++;
    console.log(`  ✅ ${p.permit_number}: ${patch.address ?? p.address} ${patch.zip_code ?? ''}`);
  }

  console.log(`\nDone. Updated ${updated}, no geometry ${noGeom}, no geocode result ${noResult}`);
}

backfill().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
