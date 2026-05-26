require('dotenv').config();
const { fetchNewPermits: fetchBryanPermits } = require('./bryan-fetch-permits');
const { fetchNewPermits: fetchSavannahPermits } = require('./savannah-fetch-permits');
const { fetchNewReportUrls, downloadPdf } = require('./gwinnett-fetch-reports');
const { parsePdfBuffer } = require('./gwinnett-parse-permit-pdf');
const { savePermits } = require('./save-permits');

const CUTOFF_MS = 1751328000000; // 2025-07-01 — matches scraper defaults, never go earlier

async function backfillBryan() {
  console.log('\n=== Backfilling Bryan County ===');
  const { permits } = await fetchBryanPermits(CUTOFF_MS);
  if (permits.length === 0) { console.log('No permits found.'); return; }
  await savePermits(permits);
}

async function backfillSavannah() {
  console.log('\n=== Backfilling Savannah ===');
  const { permits } = await fetchSavannahPermits(CUTOFF_MS);
  if (permits.length === 0) { console.log('No permits found.'); return; }
  await savePermits(permits);
}

async function backfillGwinnett() {
  console.log('\n=== Backfilling Gwinnett ===');
  const reports = await fetchNewReportUrls('00000000'); // all historical reports
  if (reports.length === 0) { console.log('No reports found.'); return; }

  console.log(`Processing ${reports.length} reports...`);
  for (const report of reports) {
    try {
      console.log(`\n  Report ${report.startDate}–${report.endDate}`);
      const buffer = await downloadPdf(report.url);
      const permits = await parsePdfBuffer(buffer);
      await savePermits(permits);
    } catch (err) {
      console.error(`  ❌ Failed on ${report.startDate}: ${err.message}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const runAll = args.length === 0;

  if (runAll || args.includes('bryan'))    await backfillBryan();
  if (runAll || args.includes('savannah')) await backfillSavannah();
  if (runAll || args.includes('gwinnett')) await backfillGwinnett();

  console.log('\n=== Backfill complete ===');
}

main().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
