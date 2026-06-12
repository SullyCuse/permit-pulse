// One-time backfill: Bryan County permits missing a zip. Re-runs the (now
// smarter, viewport-biased) Bryan geocoder over every zip-less permit and
// writes back the zip — and appends the city to the address when it was
// missing. Clears stale cached-null geocodes first so they get retried.
//
// Run from the repo root so dotenv picks up .env:
//   node scraper/backfill-bryan-zips.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { geocodeBryanAddress } = require('./bryan-fetch-permits');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function backfill() {
  const { data: permits, error } = await supabase
    .from('permits')
    .select('id, permit_number, address, zip_code')
    .eq('county', 'Bryan County')
    .or('zip_code.is.null,zip_code.eq.')
    .not('address', 'is', null);

  if (error) { console.error('Fetch failed:', error.message); process.exit(1); }
  console.log(`Found ${permits.length} Bryan permits missing zip (with an address)`);
  if (permits.length === 0) return;

  // Clear stale cached-null geocodes for these addresses so the smarter retry runs.
  const staleKeys = permits.map(p => `${p.address}, Bryan County, GA`);
  for (let i = 0; i < staleKeys.length; i += 100) {
    const chunk = staleKeys.slice(i, i + 100);
    const { error: delErr } = await supabase
      .from('geocode_cache')
      .delete()
      .in('address', chunk)
      .is('zip_code', null);
    if (delErr) console.warn('  cache clear warning:', delErr.message);
  }
  console.log('Cleared stale cached-null geocodes');

  let updated = 0, stillNull = 0;
  for (const p of permits) {
    await sleep(200);
    const geo = await geocodeBryanAddress(p.address);

    const patch = {};
    if (geo.zip) patch.zip_code = geo.zip;
    if (geo.city && !p.address.includes(',')) patch.address = `${p.address}, ${geo.city}`;
    if (Object.keys(patch).length === 0) { stillNull++; continue; }

    const { error: upErr } = await supabase.from('permits').update(patch).eq('id', p.id);
    if (upErr) { console.error(`  ❌ ${p.permit_number}: ${upErr.message}`); continue; }
    updated++;
    console.log(`  ✅ ${p.permit_number}: ${patch.address ?? p.address} ${patch.zip_code ?? ''}`);
  }

  console.log(`\nDone. Updated ${updated}, still unresolved ${stillNull}`);
}

backfill().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
