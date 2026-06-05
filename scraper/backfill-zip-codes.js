require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Backfill zip_code (and city for Bryan County) on existing permits that have null zip.
// Run: node scraper/backfill-zip-codes.js [gwinnett|bryan|all]

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const BATCH_SIZE  = 50;  // permits fetched per DB page
const GEO_DELAY   = 120; // ms between Google Maps calls (stay under rate limit)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { 'Authorization': `Bearer ${process.env.SUPABASE_SECRET_KEY}` } },
  }
);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function geocode(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_MAPS_API_KEY not set');

  const { data } = await axios.get(GEOCODE_URL, {
    params: { address, key: apiKey },
    timeout: 8000,
  });

  if (data.status === 'OVER_QUERY_LIMIT') {
    console.warn('  Rate limited — sleeping 5s');
    await sleep(5000);
    return { zip: null, city: null };
  }
  if (data.status !== 'OK' || !data.results?.length) return { zip: null, city: null };

  const components = data.results[0].address_components;
  const zip  = components.find(c => c.types.includes('postal_code'))?.short_name ?? null;
  const city = components.find(c => c.types.includes('locality'))?.long_name ?? null;
  return { zip, city };
}

async function backfillCounty(county, addressSuffix) {
  console.log(`\n[${county}] Fetching permits with null zip_code...`);

  let offset = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  while (true) {
    const { data: permits, error } = await supabase
      .from('permits')
      .select('id, permit_number, address')
      .eq('county', county)
      .is('zip_code', null)
      .not('address', 'is', null)
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) { console.error(`  DB error: ${error.message}`); break; }
    if (!permits || permits.length === 0) break;

    console.log(`  Batch of ${permits.length} (offset ${offset})...`);

    for (const p of permits) {
      const query = `${p.address}${addressSuffix}`;
      await sleep(GEO_DELAY);

      let zip = null, city = null;
      try {
        ({ zip, city } = await geocode(query));
      } catch (err) {
        console.warn(`  Geocode error for "${query}": ${err.message}`);
        totalSkipped++;
        continue;
      }

      if (!zip) {
        totalSkipped++;
        continue;
      }

      // For Bryan County, append city to address if not already present
      const updates = { zip_code: zip };
      if (county === 'Bryan County' && city && p.address && !p.address.includes(',')) {
        updates.address = `${p.address}, ${city}`;
      }

      const { error: upErr } = await supabase
        .from('permits')
        .update(updates)
        .eq('id', p.id);

      if (upErr) {
        console.warn(`  Update failed for ${p.permit_number}: ${upErr.message}`);
        totalSkipped++;
      } else {
        process.stdout.write(`  ✅ ${p.permit_number} → ${zip}${city ? ` (${city})` : ''}\r`);
        totalUpdated++;
      }
    }

    if (permits.length < BATCH_SIZE) break;
    offset += BATCH_SIZE;
  }

  console.log(`\n[${county}] Done — updated: ${totalUpdated}, skipped: ${totalSkipped}`);
  return { totalUpdated, totalSkipped };
}

async function main() {
  const target = process.argv[2] || 'all';

  if (target === 'gwinnett' || target === 'all') {
    // Gwinnett addresses already contain the city, e.g. "3799 PARADISE PTE, DULUTH"
    await backfillCounty('Gwinnett', ', GA');
  }

  if (target === 'bryan' || target === 'all') {
    // Bryan County addresses are bare streets, e.g. "205 NEWPORT CIRCLE"
    await backfillCounty('Bryan County', ', Bryan County, GA');
  }

  console.log('\nBackfill complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
