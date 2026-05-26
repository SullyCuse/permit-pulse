require('dotenv').config();
const { fetchLatestPdfUrls } = require('./fetch-archive');
const { downloadAndParsePdf } = require('./parse-permit-pdf');
const { fetchNewReportUrls, downloadPdf } = require('./gwinnett-fetch-reports');
const { parsePdfBuffer } = require('./gwinnett-parse-permit-pdf');
const { fetchNewPermits } = require('./forsyth-fetch-permits');
const { fetchNewPermits: fetchSavannahPermits } = require('./savannah-fetch-permits');
const { fetchNewPermits: fetchAlpharettaPermits } = require('./alpharetta-fetch-permits');
const { fetchNewPermits: fetchBryanPermits } = require('./bryan-fetch-permits');
const { savePermits } = require('./save-permits');
const {
  getLastItemNumber, setLastItemNumber,
  getGwinnettLastDate, setGwinnettLastDate,
  getForsythLastTimestamp, setForsythLastTimestamp,
  getSavannahLastTimestamp, setSavannahLastTimestamp,
  getAlpharettaLastTimestamp, setAlpharettaLastTimestamp,
  getBryanLastTimestamp, setBryanLastTimestamp,
} = require('./state');

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
    console.log(`\n=== Permit Pulse Scraper ===`);

    let totalInserted = 0;
    let totalErrors = 0;

    // --- Hall County ---
    const lastItem = await getLastItemNumber();
    console.log(`\n[Hall County] Last processed item: #${lastItem}`);
    console.log(`Checking items #${lastItem + 1} – #${lastItem + CHECK_AHEAD}`);

    const hallFound = await fetchLatestPdfUrls(lastItem);

    if (hallFound.length === 0) {
      console.log('[Hall County] No new permit PDFs found.');
    } else {
      for (const pdf of hallFound) {
        try {
          console.log(`\n[Hall County] Processing item #${pdf.itemNumber}...`);
          const permits = await downloadAndParsePdf(pdf.url);
          const result = await savePermits(permits);
          totalInserted += result.inserted;
          totalErrors += result.errors;
        } catch (err) {
          console.error(`  ❌ [Hall County] Failed on item #${pdf.itemNumber}: ${err.message}`);
          totalErrors++;
        }
      }
    }

    const newLast = lastItem + CHECK_AHEAD;
    await setLastItemNumber(newLast);
    console.log(`\n[Hall County] State advanced to item #${newLast}`);

    // --- Gwinnett County ---
    const gwinnettLastDate = await getGwinnettLastDate();
    console.log(`\n[Gwinnett County] Last processed report date: ${gwinnettLastDate}`);

    const gwinnettReports = await fetchNewReportUrls(gwinnettLastDate);

    if (gwinnettReports.length === 0) {
      console.log('[Gwinnett County] No new reports found.');
    } else {
      let latestDate = gwinnettLastDate;

      for (const report of gwinnettReports) {
        try {
          console.log(`\n[Gwinnett County] Processing report ${report.startDate}–${report.endDate}...`);
          const buffer = await downloadPdf(report.url);
          const permits = await parsePdfBuffer(buffer);
          const result = await savePermits(permits);
          totalInserted += result.inserted;
          totalErrors += result.errors;

          if (report.startDate > latestDate) latestDate = report.startDate;
        } catch (err) {
          console.error(`  ❌ [Gwinnett County] Failed on ${report.startDate}: ${err.message}`);
          totalErrors++;
        }
      }

      await setGwinnettLastDate(latestDate);
      console.log(`\n[Gwinnett County] State advanced to ${latestDate}`);
    }

    // --- Forsyth County ---
    const forsythLastTs = await getForsythLastTimestamp();
    console.log(`\n[Forsyth County] Last processed timestamp: ${forsythLastTs ? new Date(forsythLastTs).toISOString() : 'none'}`);

    let forsythCount = 0;
    try {
      const { permits: forsythPermits, maxTimestamp } = await fetchNewPermits(forsythLastTs);
      forsythCount = forsythPermits.length;

      if (forsythPermits.length === 0) {
        console.log('[Forsyth County] No new permits found.');
      } else {
        const result = await savePermits(forsythPermits);
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setForsythLastTimestamp(maxTimestamp);
        console.log(`\n[Forsyth County] State advanced to ${new Date(maxTimestamp).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Forsyth County] Failed: ${err.message}`);
      totalErrors++;
    }

    // --- Savannah ---
    const savannahLastTs = await getSavannahLastTimestamp();
    console.log(`\n[Savannah] Last processed timestamp: ${savannahLastTs ? new Date(savannahLastTs).toISOString() : 'none'}`);

    let savannahCount = 0;
    try {
      const { permits: savannahPermits, maxTimestamp: savannahMax } = await fetchSavannahPermits(savannahLastTs);
      savannahCount = savannahPermits.length;

      if (savannahPermits.length === 0) {
        console.log('[Savannah] No new permits found.');
      } else {
        const result = await savePermits(savannahPermits);
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setSavannahLastTimestamp(savannahMax);
        console.log(`\n[Savannah] State advanced to ${new Date(savannahMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Savannah] Failed: ${err.message}`);
      totalErrors++;
    }

    // --- Alpharetta ---
    const alpharettaLastTs = await getAlpharettaLastTimestamp();
    console.log(`\n[Alpharetta] Last processed timestamp: ${alpharettaLastTs ? new Date(alpharettaLastTs).toISOString() : 'none'}`);

    let alpharettaCount = 0;
    try {
      const { permits: alpharettaPermits, maxTimestamp: alpharettaMax } = await fetchAlpharettaPermits(alpharettaLastTs);
      alpharettaCount = alpharettaPermits.length;

      if (alpharettaPermits.length === 0) {
        console.log('[Alpharetta] No new permits found.');
      } else {
        const result = await savePermits(alpharettaPermits);
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setAlpharettaLastTimestamp(alpharettaMax);
        console.log(`\n[Alpharetta] State advanced to ${new Date(alpharettaMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Alpharetta] Failed: ${err.message}`);
      totalErrors++;
    }

    // --- Bryan County ---
    const bryanLastTs = await getBryanLastTimestamp();
    console.log(`\n[Bryan County] Last processed timestamp: ${bryanLastTs ? new Date(bryanLastTs).toISOString() : 'none'}`);

    let bryanCount = 0;
    try {
      const { permits: bryanPermits, maxTimestamp: bryanMax } = await fetchBryanPermits(bryanLastTs);
      bryanCount = bryanPermits.length;

      if (bryanPermits.length === 0) {
        console.log('[Bryan County] No new permits found.');
      } else {
        const result = await savePermits(bryanPermits);
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setBryanLastTimestamp(bryanMax);
        console.log(`\n[Bryan County] State advanced to ${new Date(bryanMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Bryan County] Failed: ${err.message}`);
      totalErrors++;
    }

    // --- Summary & emails ---
    console.log(`\n=== Run Summary ===`);
    console.log(`  Hall PDFs checked: ${hallFound.length}`);
    console.log(`  Gwinnett reports processed: ${gwinnettReports.length}`);
    console.log(`  Forsyth permits fetched: ${forsythCount}`);
    console.log(`  Savannah permits fetched: ${savannahCount}`);
    console.log(`  Alpharetta permits fetched: ${alpharettaCount}`);
    console.log(`  Bryan County permits fetched: ${bryanCount}`);
    console.log(`  Permits inserted: ${totalInserted}`);
    console.log(`  Errors: ${totalErrors}`);

    if (totalInserted > 0 && CRON_SECRET) {
      const runDate = new Date().toISOString().split('T')[0];
      console.log(`\n=== Sending Emails ===`);
      await callApi('/api/send-alerts', { run_date: runDate });
      await callApi('/api/send-digest');
    }

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
