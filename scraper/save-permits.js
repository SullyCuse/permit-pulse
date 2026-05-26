require('dotenv').config();
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

async function savePermits(permits) {
  console.log(`\nSaving ${permits.length} permits to Supabase...`);
  
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const permit of permits) {
    const { error } = await supabase
      .from('permits')
      .upsert({
        permit_number:    permit.permit_number,
        address:          permit.address,
        permit_type:      permit.permit_type,
        county:           permit.county,
        zip_code:         permit.zip_code,
        date_filed:       permit.date_filed,
        description:      permit.description,
        contractor_name:  permit.contractor_name ?? null,
        applicant_name:   permit.applicant_name  ?? null,
        raw_data:         permit
      }, {
        onConflict: 'permit_number,county',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`  ❌ Error on ${permit.permit_number}: ${error.message}`);
      errors++;
    } else {
      inserted++;
      process.stdout.write(`  ✅ Saved ${permit.permit_number}\r`);
    }
  }

  console.log(`\n\nResults:`);
  console.log(`  ✅ Saved:   ${inserted}`);
  console.log(`  ⏭  Skipped: ${skipped}`);
  console.log(`  ❌ Errors:  ${errors}`);
  return { inserted, skipped, errors };
}

module.exports = { savePermits };

if (require.main === module) {
  const { downloadAndParsePdf } = require('./parse-permit-pdf');
  const testUrl = 'https://www.hallcounty.org/ArchiveCenter/ViewFile/Item/1413';

  downloadAndParsePdf(testUrl)
    .then(permits => savePermits(permits))
    .then(results => {
      console.log('\n🎉 Done! Check your Supabase Table Editor to see the permits.');
    })
    .catch(console.error);
}