require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const ADDRESS_URL = 'https://geo.forsythco.com/gis/rest/services/EnerGov/EnerGovParcelAddressMapService/MapServer/0/query';
const ADDRESS_BATCH = 200;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { 'Authorization': `Bearer ${process.env.SUPABASE_SECRET_KEY}` } }
  }
);

function normalizePin(pin) {
  return pin?.trim().replace(/\s+/g, ' ') ?? '';
}

async function lookupCities(rawParcelNumbers) {
  const quoted = rawParcelNumbers.map(p => `'${p.replace(/'/g, "''")}'`).join(',');
  const params = new URLSearchParams({
    where: `PIN IN (${quoted})`,
    outFields: 'PIN,FULLADDR,MUNICIPALITY',
    f: 'json',
  });

  const { data } = await axios.post(ADDRESS_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000,
  });

  const map = {};
  for (const f of (data.features || [])) {
    const { PIN, FULLADDR, MUNICIPALITY } = f.attributes;
    if (PIN && MUNICIPALITY && FULLADDR) {
      map[normalizePin(PIN)] = { address: FULLADDR, city: MUNICIPALITY };
    }
  }
  return map;
}

async function backfill() {
  console.log('Fetching Forsyth permits without city in address...');

  const { data: permits, error } = await supabase
    .from('permits')
    .select('id, permit_number, address, raw_data')
    .eq('county', 'Forsyth')
    .not('raw_data', 'is', null);

  if (error) {
    console.error('Failed to fetch permits:', error.message);
    process.exit(1);
  }

  // Only update permits where address doesn't already contain a comma (no city yet)
  const needsCity = permits.filter(p => p.address && !p.address.includes(','));
  console.log(`Found ${permits.length} Forsyth permits, ${needsCity.length} need city added`);

  if (needsCity.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  // Build parcel → permit map using raw parcel numbers from raw_data
  const rawParcelNumbers = [...new Set(needsCity.map(p => p.raw_data?.raw_data?.ParcelNumber).filter(Boolean))];

  // Batch lookup cities
  const cityMap = {};
  for (let i = 0; i < rawParcelNumbers.length; i += ADDRESS_BATCH) {
    const batch = rawParcelNumbers.slice(i, i + ADDRESS_BATCH);
    const batchMap = await lookupCities(batch);
    Object.assign(cityMap, batchMap);
    process.stdout.write(`  Parcel lookup: ${Math.min(i + ADDRESS_BATCH, rawParcelNumbers.length)}/${rawParcelNumbers.length}\r`);
  }
  console.log(`  Parcel lookup: ${rawParcelNumbers.length}/${rawParcelNumbers.length} done`);

  let updated = 0;
  let skipped = 0;

  for (const permit of needsCity) {
    const normalized = normalizePin(permit.raw_data?.raw_data?.ParcelNumber);
    const info = cityMap[normalized];

    if (!info?.city) {
      skipped++;
      continue;
    }

    const newAddress = `${permit.address}, ${info.city}`;
    const { error: updateError } = await supabase
      .from('permits')
      .update({ address: newAddress })
      .eq('id', permit.id);

    if (updateError) {
      console.error(`  ❌ ${permit.permit_number}: ${updateError.message}`);
      skipped++;
    } else {
      updated++;
      process.stdout.write(`  ✅ ${updated}/${needsCity.length} ${permit.permit_number}: "${newAddress}"\r`);
    }
  }

  console.log(`\n\nDone!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (no city found): ${skipped}`);
}

backfill().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
