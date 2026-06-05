require('dotenv').config();
const { fetchLatestPdfUrls } = require('./fetch-archive');
const { downloadAndParsePdf } = require('./parse-permit-pdf');
const { fetchNewReportUrls, downloadPdf } = require('./gwinnett-fetch-reports');
const { parsePdfBuffer } = require('./gwinnett-parse-permit-pdf');
const { fetchNewPermits } = require('./forsyth-fetch-permits');
const { fetchNewPermits: fetchSavannahPermits } = require('./savannah-fetch-permits');
const { fetchNewPermits: fetchAlpharettaPermits } = require('./alpharetta-fetch-permits');
const { fetchNewPermits: fetchBryanPermits } = require('./bryan-fetch-permits');
const { fetchNewPermits: fetchDeKalbPermits } = require('./dekalb-fetch-permits');
const { fetchNewPermits: fetchJohnsCreekPermits } = require('./johnscreek-fetch-permits');
const { fetchNewPermits: fetchAugustaPermits } = require('./augusta-fetch-permits');
const { fetchNewPermits: fetchAtlantaPermits } = require('./atlanta-fetch-permits');
const { fetchNewPermits: fetchSandySpringsPermits } = require('./sandysprings-fetch-permits');
const { fetchNewPermits: fetchCherokeePermits } = require('./cherokee-fetch-permits');
const { fetchNewPermits: fetchConyersPermits } = require('./conyers-fetch-permits');
const { fetchGainesvillePermits, fetchOakwoodPermits } = require('./hallco-accela-fetch-permits');
const { savePermits } = require('./save-permits');
const {
  getLastItemNumber, setLastItemNumber,
  getGwinnettLastDate, setGwinnettLastDate,
  getForsythLastTimestamp, setForsythLastTimestamp,
  getSavannahLastTimestamp, setSavannahLastTimestamp,
  getAlpharettaLastTimestamp, setAlpharettaLastTimestamp,
  getBryanLastTimestamp, setBryanLastTimestamp,
  getDeKalbLastTimestamp, setDeKalbLastTimestamp,
  getAugustaLastTimestamp, setAugustaLastTimestamp,
  getJohnsCreekLastTimestamp, setJohnsCreekLastTimestamp,
  getAtlantaLastTimestamp, setAtlantaLastTimestamp,
  getSandySpringsLastTimestamp, setSandySpringsLastTimestamp,
  getCherokeeLastDate, setCherokeeLastDate,
  getConyersLastTimestamp, setConyersLastTimestamp,
  getGainesvilleLastTimestamp, setGainesvilleLastTimestamp,
  getOakwoodLastTimestamp, setOakwoodLastTimestamp,
  getLastDigestSentMs, setLastDigestSentMs,
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

    const hallFound = await fetchLatestPdfUrls(lastItem);

    if (hallFound.length === 0) {
      console.log('[Hall County] No new permit PDFs found.');
    } else {
      let maxItemSeen = lastItem;
      for (const pdf of hallFound) {
        try {
          console.log(`\n[Hall County] Processing item #${pdf.itemNumber}...`);
          const permits = await downloadAndParsePdf(pdf.url);
          const result = await savePermits(permits);
          totalInserted += result.inserted;
          totalErrors += result.errors;
          if (pdf.itemNumber > maxItemSeen) maxItemSeen = pdf.itemNumber;
        } catch (err) {
          console.error(`  ❌ [Hall County] Failed on item #${pdf.itemNumber}: ${err.message || err.code || String(err)}`);
          totalErrors++;
        }
      }
      await setLastItemNumber(maxItemSeen);
      console.log(`\n[Hall County] State advanced to item #${maxItemSeen}`);
    }

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
          const permits = await parsePdfBuffer(buffer, report.url);
          const result = await savePermits(permits);
          totalInserted += result.inserted;
          totalErrors += result.errors;

          if (report.startDate > latestDate) latestDate = report.startDate;
        } catch (err) {
          console.error(`  ❌ [Gwinnett County] Failed on ${report.startDate}: ${err.message || err.code || String(err)}`);
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
      console.error(`  ❌ [Forsyth County] Failed: ${err.message || err.code || String(err)}`);
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
      console.error(`  ❌ [Savannah] Failed: ${err.message || err.code || String(err)}`);
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
      console.error(`  ❌ [Alpharetta] Failed: ${err.message || err.code || String(err)}`);
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
      console.error(`  ❌ [Bryan County] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- DeKalb County ---
    const dekalbLastTs = await getDeKalbLastTimestamp();
    console.log(`\n[DeKalb County] Last processed timestamp: ${dekalbLastTs ? new Date(dekalbLastTs).toISOString() : 'none'}`);

    let dekalbCount = 0;
    try {
      const { permits: dekalbPermits, maxTimestamp: dekalbMax } = await fetchDeKalbPermits(dekalbLastTs);
      dekalbCount = dekalbPermits.length;

      if (dekalbPermits.length === 0) {
        console.log('[DeKalb County] No new permits found.');
      } else {
        const result = await savePermits(dekalbPermits);
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setDeKalbLastTimestamp(dekalbMax);
        console.log(`\n[DeKalb County] State advanced to ${new Date(dekalbMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [DeKalb County] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Augusta ---
    const augustaLastTs = await getAugustaLastTimestamp();
    console.log(`\n[Augusta] Last processed timestamp: ${augustaLastTs ? new Date(augustaLastTs).toISOString() : 'none'}`);

    let augustaCount = 0;
    try {
      const { permits: augustaPermits, maxTimestamp: augustaMax } = await fetchAugustaPermits(augustaLastTs);
      augustaCount = augustaPermits.length;

      if (augustaPermits.length === 0) {
        console.log('[Augusta] No new permits found.');
      } else {
        const result = await savePermits(augustaPermits);
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setAugustaLastTimestamp(augustaMax);
        console.log(`\n[Augusta] State advanced to ${new Date(augustaMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Augusta] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Johns Creek ---
    const johnsCreekLastTs = await getJohnsCreekLastTimestamp();
    console.log(`\n[Johns Creek] Last processed timestamp: ${johnsCreekLastTs ? new Date(johnsCreekLastTs).toISOString() : 'none'}`);

    let johnsCreekCount = 0;
    try {
      const { permits: johnsCreekPermits, maxTimestamp: johnsCreekMax } = await fetchJohnsCreekPermits(johnsCreekLastTs);
      johnsCreekCount = johnsCreekPermits.length;

      if (johnsCreekPermits.length === 0) {
        console.log('[Johns Creek] No new permits found.');
      } else {
        const result = await savePermits(johnsCreekPermits);
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setJohnsCreekLastTimestamp(johnsCreekMax);
        console.log(`\n[Johns Creek] State advanced to ${new Date(johnsCreekMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Johns Creek] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- City of Atlanta ---
    const atlantaLastTs = await getAtlantaLastTimestamp();
    console.log(`\n[City of Atlanta] Last processed timestamp: ${atlantaLastTs ? new Date(atlantaLastTs).toISOString() : 'none'}`);

    let atlantaCount = 0;
    try {
      const { permits: atlantaPermits, maxTimestamp: atlantaMax } = await fetchAtlantaPermits(atlantaLastTs);
      atlantaCount = atlantaPermits.length;

      if (atlantaPermits.length === 0) {
        console.log('[City of Atlanta] No new permits found.');
      } else {
        const result = await savePermits(atlantaPermits);
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setAtlantaLastTimestamp(atlantaMax);
        console.log(`\n[City of Atlanta] State advanced to ${new Date(atlantaMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [City of Atlanta] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Sandy Springs ---
    const sandySpringsLastTs = await getSandySpringsLastTimestamp();
    console.log(`\n[Sandy Springs] Last processed timestamp: ${sandySpringsLastTs ? new Date(sandySpringsLastTs).toISOString() : 'none'}`);

    let sandySpringsCount = 0;
    try {
      const { permits: sandySpringsPermits, maxTimestamp: sandySpringsMax } = await fetchSandySpringsPermits(sandySpringsLastTs);
      sandySpringsCount = sandySpringsPermits.length;

      if (sandySpringsPermits.length === 0) {
        console.log('[Sandy Springs] No new permits found.');
      } else {
        const result = await savePermits(sandySpringsPermits);
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setSandySpringsLastTimestamp(sandySpringsMax);
        console.log(`\n[Sandy Springs] State advanced to ${new Date(sandySpringsMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Sandy Springs] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Cherokee County ---
    let cherokeeCount = 0;
    try {
      const cherokeeLastDate = await getCherokeeLastDate();
      console.log(`\n[Cherokee County] Last processed date: ${cherokeeLastDate}`);
      const { permits: cherokeePermits, maxDateStr } = await fetchCherokeePermits(cherokeeLastDate);
      if (cherokeePermits.length === 0) {
        console.log('[Cherokee County] No new permits found.');
      } else {
        const result = await savePermits(cherokeePermits);
        cherokeeCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setCherokeeLastDate(maxDateStr);
        console.log(`\n[Cherokee County] State advanced to ${maxDateStr}`);
      }
    } catch (err) {
      console.error(`  ❌ [Cherokee County] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- City of Conyers ---
    let conyersCount = 0;
    try {
      const conyersLastTs = await getConyersLastTimestamp();
      console.log(`\n[City of Conyers] Last processed timestamp: ${new Date(conyersLastTs).toISOString()}`);
      const { permits: conyersPermits, maxTimestamp: conyersMax } = await fetchConyersPermits(conyersLastTs);
      if (conyersPermits.length === 0) {
        console.log('[City of Conyers] No new permits found.');
      } else {
        const result = await savePermits(conyersPermits);
        conyersCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setConyersLastTimestamp(conyersMax);
        console.log(`\n[City of Conyers] State advanced to ${new Date(conyersMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [City of Conyers] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- City of Gainesville ---
    let gainesvilleCount = 0;
    try {
      const gainesvilleLastTs = await getGainesvilleLastTimestamp();
      console.log(`\n[City of Gainesville] Last processed timestamp: ${new Date(gainesvilleLastTs).toISOString()}`);
      const { permits: gainesvillePermits, maxTimestamp: gainesvilleMax } = await fetchGainesvillePermits(gainesvilleLastTs);
      if (gainesvillePermits.length === 0) {
        console.log('[City of Gainesville] No new permits found.');
      } else {
        const result = await savePermits(gainesvillePermits);
        gainesvilleCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setGainesvilleLastTimestamp(gainesvilleMax);
        console.log(`\n[City of Gainesville] State advanced to ${new Date(gainesvilleMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [City of Gainesville] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- City of Oakwood ---
    let oakwoodCount = 0;
    try {
      const oakwoodLastTs = await getOakwoodLastTimestamp();
      console.log(`\n[City of Oakwood] Last processed timestamp: ${new Date(oakwoodLastTs).toISOString()}`);
      const { permits: oakwoodPermits, maxTimestamp: oakwoodMax } = await fetchOakwoodPermits(oakwoodLastTs);
      if (oakwoodPermits.length === 0) {
        console.log('[City of Oakwood] No new permits found.');
      } else {
        const result = await savePermits(oakwoodPermits);
        oakwoodCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setOakwoodLastTimestamp(oakwoodMax);
        console.log(`\n[City of Oakwood] State advanced to ${new Date(oakwoodMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [City of Oakwood] Failed: ${err.message || err.code || String(err)}`);
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
    console.log(`  DeKalb County permits fetched: ${dekalbCount}`);
    console.log(`  Augusta permits fetched: ${augustaCount}`);
    console.log(`  Johns Creek permits fetched: ${johnsCreekCount}`);
    console.log(`  City of Atlanta permits fetched: ${atlantaCount}`);
    console.log(`  Sandy Springs permits fetched: ${sandySpringsCount}`);
    console.log(`  Cherokee County permits fetched: ${cherokeeCount}`);
    console.log(`  City of Conyers permits fetched: ${conyersCount}`);
    console.log(`  City of Gainesville permits fetched: ${gainesvilleCount}`);
    console.log(`  City of Oakwood permits fetched: ${oakwoodCount}`);
    console.log(`  Permits inserted: ${totalInserted}`);
    console.log(`  Errors: ${totalErrors}`);

    if (totalInserted > 0 && CRON_SECRET) {
      const runDate = new Date().toISOString().split('T')[0];
      console.log(`\n=== Sending Emails ===`);
      await callApi('/api/send-alerts', { run_date: runDate });

      const DIGEST_COOLDOWN_MS = 20 * 60 * 60 * 1000; // 20 hours
      const lastDigestMs = await getLastDigestSentMs();
      const hoursSinceLast = ((Date.now() - lastDigestMs) / 3600000).toFixed(1);
      if (Date.now() - lastDigestMs >= DIGEST_COOLDOWN_MS) {
        await callApi('/api/send-digest');
        await setLastDigestSentMs(Date.now());
      } else {
        console.log(`  Digest skipped — sent ${hoursSinceLast}h ago (cooldown: 20h)`);
      }
    }

  } finally {
    if (isApify) {
      const { Actor } = require('apify');
      await Actor.exit();
    }
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message || err.code || String(err));
  process.exit(1);
});
