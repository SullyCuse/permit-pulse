require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: { 'Authorization': `Bearer ${process.env.SUPABASE_SECRET_KEY}` }
    }
  }
);

const PERMITS_URL = 'https://geo.forsythco.com/gis3/rest/services/Public_EnerGovPlans/Building_Permits/MapServer/0/query';
const PAGE_SIZE = 2000;
const CUTOFF_MS = 1751328000000; // 2025-07-01

function msToArcgisTimestamp(ms) {
  const d = new Date(ms);
  const pad = n => String(n).padStart(2, '0');
  return `timestamp '${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}'`;
}

async function fetchForsythLinks() {
  const all = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      where: `IssueDate > ${msToArcgisTimestamp(CUTOFF_MS)}`,
      outFields: 'PermitNumber,Link',
      orderByFields: 'IssueDate ASC',
      resultOffset: String(offset),
      resultRecordCount: String(PAGE_SIZE),
      f: 'json',
    });

    const { data } = await axios.get(`${PERMITS_URL}?${params}`, { timeout: 30000 });
    const features = data.features || [];
    all.push(...features);

    if (features.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return all;
}

async function main() {
  console.log('\n=== Backfilling Forsyth source_url ===');
  console.log('Fetching PermitNumber + Link from ArcGIS...');

  const features = await fetchForsythLinks();
  const withLink = features.filter(f => f.attributes.Link);
  console.log(`Found ${features.length} permits, ${withLink.length} have a Link`);

  if (withLink.length === 0) {
    console.log('Nothing to backfill.');
    return;
  }

  let updated = 0;
  let errors = 0;

  for (const f of withLink) {
    const { PermitNumber, Link } = f.attributes;
    const { error } = await supabase
      .from('permits')
      .update({ source_url: Link })
      .eq('permit_number', PermitNumber)
      .eq('county', 'Forsyth');

    if (error) {
      console.error(`  ❌ ${PermitNumber}: ${error.message}`);
      errors++;
    } else {
      updated++;
      process.stdout.write(`  ✅ Updated ${updated}/${withLink.length}\r`);
    }
  }

  console.log(`\n\nResults:`);
  console.log(`  ✅ Updated: ${updated}`);
  console.log(`  ❌ Errors:  ${errors}`);
  console.log('\n=== Backfill complete ===');
}

main().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
