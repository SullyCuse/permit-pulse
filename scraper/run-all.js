require('dotenv').config();
const { fetchLatestPdfUrls } = require('./fetch-archive');
const { downloadAndParsePdf } = require('./parse-permit-pdf');
const { savePermits } = require('./save-permits');
const { getLastItemNumber, setLastItemNumber } = require('./state');

const APP_URL = process.env.APP_URL ?? 'https://web-chi-nine-72.vercel.app';
const CRON_SECRET = process.env.CRON_SECRET;

async function callApi(path, body = {}) {
  const url = `${APP_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CRON_SECRET}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(`  POST ${path} →`, JSON.stringify(data));
  return data;
}

const CHECK_AHEAD = 10;

async function main() {
  const isApify = !!process.env.APIFY_IS_AT_HOME;

  if (isApify) {
    const { Actor } = require('apify');
    await Actor.init();
  }

  try {
    const lastItem = await getLastItemNumber();
    console.log(`\n=== Permit Pulse Scraper ===`);
    console.log(`Last processed item: #${lastItem}`);
    console.log(`Checking items #${lastItem + 1} – #${lastItem + CHECK_AHEAD}\n`);

    const found = await fetchLatestPdfUrls(lastItem);

    if (found.length === 0) {
      console.log('No new permit PDFs found.');
    } else {
      let totalInserted = 0;
      let totalErrors = 0;

      for (const pdf of found) {
        try {
          console.log(`\nProcessing item #${pdf.itemNumber}...`);
          const permits = await downloadAndParsePdf(pdf.url);
          const result = await savePermits(permits);
          totalInserted += result.inserted;
          totalErrors += result.errors;
        } catch (err) {
          console.error(`  ❌ Failed on item #${pdf.itemNumber}: ${err.message}`);
          totalErrors++;
        }
      }

      console.log(`\n=== Run Summary ===`);
      console.log(`  PDFs processed: ${found.length}`);
      console.log(`  Permits inserted: ${totalInserted}`);
      console.log(`  Errors: ${totalErrors}`);

      if (totalInserted > 0 && CRON_SECRET) {
        const runDate = new Date().toISOString().split('T')[0];
        console.log(`\n=== Sending Emails ===`);
        await callApi('/api/send-alerts', { run_date: runDate });
        await callApi('/api/send-digest');
      }
    }

    // Advance state past the entire checked range so next run starts fresh
    const newLast = lastItem + CHECK_AHEAD;
    await setLastItemNumber(newLast);
    console.log(`\nState advanced to item #${newLast}. Next run checks #${newLast + 1}+`);

  } finally {
    if (isApify) {
      const { Actor } = require('apify');
      await Actor.exit();
    }
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
