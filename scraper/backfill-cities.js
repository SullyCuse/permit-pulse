// One-time / repair backfill of the `permits.city` column.
//
// Going-forward population happens in save-permits.js; this script fills in existing
// rows (or repairs them after parser improvements). It is idempotent and re-runnable:
// it only touches rows where city IS NULL.
//
// The initial production backfill was run via an equivalent SQL port of parseCity;
// this script is the canonical JS tool for future repairs. To re-parse ALL rows after
// a parser change, run with `--force` (recomputes every row, not just nulls).
//
// Usage: node scraper/backfill-cities.js [--force]

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { parseCity } = require('./parse-address');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { 'Authorization': `Bearer ${process.env.SUPABASE_SECRET_KEY}` } }
  }
);

const PAGE = 1000;
const force = process.argv.includes('--force');

async function backfill() {
  console.log(`Backfilling permits.city (${force ? 'ALL rows' : 'rows missing city'})...`);

  let from = 0;
  let scanned = 0;
  let updated = 0;
  let unparseable = 0;

  while (true) {
    let q = supabase
      .from('permits')
      .select('id, address, city')
      .not('address', 'is', null)
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (!force) q = q.is('city', null);

    const { data: rows, error } = await q;
    if (error) {
      console.error('Fetch failed:', error.message);
      process.exit(1);
    }
    if (!rows || rows.length === 0) break;

    for (const row of rows) {
      scanned++;
      const city = parseCity(row.address);
      if (!city) { unparseable++; continue; }
      if (city === row.city) continue; // no change

      const { error: upErr } = await supabase
        .from('permits')
        .update({ city })
        .eq('id', row.id);
      if (upErr) {
        console.error(`  ❌ ${row.id}: ${upErr.message}`);
      } else {
        updated++;
        process.stdout.write(`  ✅ ${updated} updated (scanned ${scanned})\r`);
      }
    }

    from += PAGE;
  }

  console.log(`\n\nDone. Scanned ${scanned}, updated ${updated}, unparseable ${unparseable}.`);
}

backfill().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
