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
const { fetchNewPermits: fetchSmyrnaPermits } = require('./smyrna-fetch-permits');
const { fetchNewPermits: fetchCartersvillePermits } = require('./cartersville-fetch-permits');
const { fetchNewPermits: fetchEffinghamPermits } = require('./effingham-fetch-permits');
const { fetchNewPermits: fetchAustellPermits } = require('./austell-fetch-permits');
const { fetchNewPermits: fetchCamdenPermits } = require('./camden-fetch-permits');
const { fetchNewPermits: fetchFranklinCountyPermits } = require('./franklincounty-fetch-permits');
const { fetchNewPermits: fetchBainbridgePermits } = require('./bainbridge-fetch-permits');
const { fetchGainesvillePermits, fetchOakwoodPermits } = require('./hallco-accela-fetch-permits');
const { fetchFayettePermits, fetchHenryPermits, fetchMariettaPermits, fetchLaGrangePermits } = require('./sagesgov-fetch-permits');
const { fetchNewPermits: fetchGlynnPermits } = require('./glynn-fetch-permits');
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
  getSmyrnaLastTimestamp, setSmyrnaLastTimestamp,
  getCartersvilleLastTimestamp, setCartersvilleLastTimestamp,
  getEffinghamLastTimestamp, setEffinghamLastTimestamp,
  getAustellLastTimestamp, setAustellLastTimestamp,
  getCamdenLastTimestamp, setCamdenLastTimestamp,
  getFranklinCountyLastTimestamp, setFranklinCountyLastTimestamp,
  getBainbridgeLastTimestamp, setBainbridgeLastTimestamp,
  getGainesvilleLastTimestamp, setGainesvilleLastTimestamp,
  getOakwoodLastTimestamp, setOakwoodLastTimestamp,
  getFayetteLastTimestamp, setFayetteLastTimestamp,
  getHenryLastTimestamp, setHenryLastTimestamp,
  getMariettaLastTimestamp, setMariettaLastTimestamp,
  getGlynnLastTimestamp, setGlynnLastTimestamp,
  getLaGrangeLastTimestamp, setLaGrangeLastTimestamp,
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

    // --- Smyrna ---
    let smyrnaCount = 0;
    try {
      const smyrnaLastTs = await getSmyrnaLastTimestamp();
      console.log(`\n[Smyrna] Last processed timestamp: ${new Date(smyrnaLastTs).toISOString()}`);
      const { permits: smyrnaPermits, maxTimestamp: smyrnaMax } = await fetchSmyrnaPermits(smyrnaLastTs);
      if (smyrnaPermits.length === 0) {
        console.log('[Smyrna] No new permits found.');
      } else {
        const result = await savePermits(smyrnaPermits);
        smyrnaCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setSmyrnaLastTimestamp(smyrnaMax);
        console.log(`\n[Smyrna] State advanced to ${new Date(smyrnaMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Smyrna] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Cartersville ---
    let cartersvilleCount = 0;
    try {
      const cartersvilleLastTs = await getCartersvilleLastTimestamp();
      console.log(`\n[Cartersville] Last processed timestamp: ${new Date(cartersvilleLastTs).toISOString()}`);
      const { permits: cartersvillePermits, maxTimestamp: cartersvilleMax } = await fetchCartersvillePermits(cartersvilleLastTs);
      if (cartersvillePermits.length === 0) {
        console.log('[Cartersville] No new permits found.');
      } else {
        const result = await savePermits(cartersvillePermits);
        cartersvilleCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setCartersvilleLastTimestamp(cartersvilleMax);
        console.log(`\n[Cartersville] State advanced to ${new Date(cartersvilleMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Cartersville] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Effingham County ---
    let effinghamCount = 0;
    try {
      const effinghamLastTs = await getEffinghamLastTimestamp();
      console.log(`\n[Effingham County] Last processed timestamp: ${new Date(effinghamLastTs).toISOString()}`);
      const { permits: effinghamPermits, maxTimestamp: effinghamMax } = await fetchEffinghamPermits(effinghamLastTs);
      if (effinghamPermits.length === 0) {
        console.log('[Effingham County] No new permits found.');
      } else {
        const result = await savePermits(effinghamPermits);
        effinghamCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setEffinghamLastTimestamp(effinghamMax);
        console.log(`\n[Effingham County] State advanced to ${new Date(effinghamMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Effingham County] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Austell ---
    let austellCount = 0;
    try {
      const austellLastTs = await getAustellLastTimestamp();
      console.log(`\n[Austell] Last processed timestamp: ${new Date(austellLastTs).toISOString()}`);
      const { permits: austellPermits, maxTimestamp: austellMax } = await fetchAustellPermits(austellLastTs);
      if (austellPermits.length === 0) {
        console.log('[Austell] No new permits found.');
      } else {
        const result = await savePermits(austellPermits);
        austellCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setAustellLastTimestamp(austellMax);
        console.log(`\n[Austell] State advanced to ${new Date(austellMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Austell] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Camden County ---
    let camdenCount = 0;
    try {
      const camdenLastTs = await getCamdenLastTimestamp();
      console.log(`\n[Camden County] Last processed timestamp: ${new Date(camdenLastTs).toISOString()}`);
      const { permits: camdenPermits, maxTimestamp: camdenMax } = await fetchCamdenPermits(camdenLastTs);
      if (camdenPermits.length === 0) {
        console.log('[Camden County] No new permits found.');
      } else {
        const result = await savePermits(camdenPermits);
        camdenCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setCamdenLastTimestamp(camdenMax);
        console.log(`\n[Camden County] State advanced to ${new Date(camdenMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Camden County] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Franklin County ---
    let franklinCountyCount = 0;
    try {
      const franklinCountyLastTs = await getFranklinCountyLastTimestamp();
      console.log(`\n[Franklin County] Last processed timestamp: ${new Date(franklinCountyLastTs).toISOString()}`);
      const { permits: franklinCountyPermits, maxTimestamp: franklinCountyMax } = await fetchFranklinCountyPermits(franklinCountyLastTs);
      if (franklinCountyPermits.length === 0) {
        console.log('[Franklin County] No new permits found.');
      } else {
        const result = await savePermits(franklinCountyPermits);
        franklinCountyCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setFranklinCountyLastTimestamp(franklinCountyMax);
        console.log(`\n[Franklin County] State advanced to ${new Date(franklinCountyMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Franklin County] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Bainbridge ---
    let bainbridgeCount = 0;
    try {
      const bainbridgeLastTs = await getBainbridgeLastTimestamp();
      console.log(`\n[Bainbridge] Last processed timestamp: ${new Date(bainbridgeLastTs).toISOString()}`);
      const { permits: bainbridgePermits, maxTimestamp: bainbridgeMax } = await fetchBainbridgePermits(bainbridgeLastTs);
      if (bainbridgePermits.length === 0) {
        console.log('[Bainbridge] No new permits found.');
      } else {
        const result = await savePermits(bainbridgePermits);
        bainbridgeCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setBainbridgeLastTimestamp(bainbridgeMax);
        console.log(`\n[Bainbridge] State advanced to ${new Date(bainbridgeMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Bainbridge] Failed: ${err.message || err.code || String(err)}`);
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

    // --- Fayette County (SagesGov) ---
    let fayetteCount = 0;
    try {
      const fayetteLastTs = await getFayetteLastTimestamp();
      console.log(`\n[Fayette County] Last processed timestamp: ${new Date(fayetteLastTs).toISOString()}`);
      const { permits: fayettePermits, maxTimestamp: fayetteMax } = await fetchFayettePermits(fayetteLastTs);
      if (fayettePermits.length === 0) {
        console.log('[Fayette County] No new permits found.');
      } else {
        const result = await savePermits(fayettePermits);
        fayetteCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setFayetteLastTimestamp(fayetteMax);
        console.log(`\n[Fayette County] State advanced to ${new Date(fayetteMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Fayette County] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Henry County (SagesGov) ---
    let henryCount = 0;
    try {
      const henryLastTs = await getHenryLastTimestamp();
      console.log(`\n[Henry County] Last processed timestamp: ${new Date(henryLastTs).toISOString()}`);
      const { permits: henryPermits, maxTimestamp: henryMax } = await fetchHenryPermits(henryLastTs);
      if (henryPermits.length === 0) {
        console.log('[Henry County] No new permits found.');
      } else {
        const result = await savePermits(henryPermits);
        henryCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setHenryLastTimestamp(henryMax);
        console.log(`\n[Henry County] State advanced to ${new Date(henryMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Henry County] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Marietta (SagesGov) ---
    let mariettaCount = 0;
    try {
      const mariettaLastTs = await getMariettaLastTimestamp();
      console.log(`\n[Marietta] Last processed timestamp: ${new Date(mariettaLastTs).toISOString()}`);
      const { permits: mariettaPermits, maxTimestamp: mariettaMax } = await fetchMariettaPermits(mariettaLastTs);
      if (mariettaPermits.length === 0) {
        console.log('[Marietta] No new permits found.');
      } else {
        const result = await savePermits(mariettaPermits);
        mariettaCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setMariettaLastTimestamp(mariettaMax);
        console.log(`\n[Marietta] State advanced to ${new Date(mariettaMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Marietta] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- Glynn County ---
    let glynnCount = 0;
    try {
      const glynnLastTs = await getGlynnLastTimestamp();
      console.log(`\n[Glynn County] Last processed timestamp: ${new Date(glynnLastTs).toISOString()}`);
      const { permits: glynnPermits, maxTimestamp: glynnMax } = await fetchGlynnPermits(glynnLastTs);
      if (glynnPermits.length === 0) {
        console.log('[Glynn County] No new permits found.');
      } else {
        const result = await savePermits(glynnPermits);
        glynnCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setGlynnLastTimestamp(glynnMax);
        console.log(`\n[Glynn County] State advanced to ${new Date(glynnMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [Glynn County] Failed: ${err.message || err.code || String(err)}`);
      totalErrors++;
    }

    // --- LaGrange (SagesGov) ---
    let laGrangeCount = 0;
    try {
      const laGrangeLastTs = await getLaGrangeLastTimestamp();
      console.log(`\n[LaGrange] Last processed timestamp: ${new Date(laGrangeLastTs).toISOString()}`);
      const { permits: laGrangePermits, maxTimestamp: laGrangeMax } = await fetchLaGrangePermits(laGrangeLastTs);
      if (laGrangePermits.length === 0) {
        console.log('[LaGrange] No new permits found.');
      } else {
        const result = await savePermits(laGrangePermits);
        laGrangeCount = result.inserted;
        totalInserted += result.inserted;
        totalErrors += result.errors;
        await setLaGrangeLastTimestamp(laGrangeMax);
        console.log(`\n[LaGrange] State advanced to ${new Date(laGrangeMax).toISOString()}`);
      }
    } catch (err) {
      console.error(`  ❌ [LaGrange] Failed: ${err.message || err.code || String(err)}`);
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
    console.log(`  Smyrna permits fetched: ${smyrnaCount}`);
    console.log(`  Cartersville permits fetched: ${cartersvilleCount}`);
    console.log(`  Effingham County permits fetched: ${effinghamCount}`);
    console.log(`  Austell permits fetched: ${austellCount}`);
    console.log(`  Camden County permits fetched: ${camdenCount}`);
    console.log(`  Franklin County permits fetched: ${franklinCountyCount}`);
    console.log(`  Bainbridge permits fetched: ${bainbridgeCount}`);
    console.log(`  City of Gainesville permits fetched: ${gainesvilleCount}`);
    console.log(`  City of Oakwood permits fetched: ${oakwoodCount}`);
    console.log(`  Fayette County permits fetched: ${fayetteCount}`);
    console.log(`  Henry County permits fetched: ${henryCount}`);
    console.log(`  Marietta permits fetched: ${mariettaCount}`);
    console.log(`  Glynn County permits fetched: ${glynnCount}`);
    console.log(`  LaGrange permits fetched: ${laGrangeCount}`);
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
