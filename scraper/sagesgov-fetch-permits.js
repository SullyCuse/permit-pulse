require('dotenv').config();

// SagesGov permit portal scraper — Fayette County, Henry County, and Marietta, GA.
//
// All three portals run on www.sagesgov.com/{slug}/portal/search.aspx and require
// reCAPTCHA v2 checkbox to search — Puppeteer required (raw HTTP is blocked by captcha).
//
// Search form:
//   Class selector:      #cphContent_cphMain_Search1_ddlClass → "1009" (Permits)
//   Submission Date:     rptrDateFilter index 2 (ctl03 in POST, _2_ in IDs)
//   Timeframe field:     ...rptrDateFilter_tfddlDateFilter_2_ddlTimeframe_2 → "DateRange"
//   Start date field:    ...rptrDateFilter_tfddlDateFilter_2_txtPeriodStart_2
//   End date field:      ...rptrDateFilter_tfddlDateFilter_2_txtPeriodEnd_2
//   Captcha token:       #cphContent_cphMain_ctrlCaptcha_txtCaptchaToken (set by reCAPTCHA callback)
//   Search button:       #cphContent_cphMain_btnSearch
//
// Cursor: Unix ms timestamp on Submission Date.
// Detail URL pattern: https://www.sagesgov.com/{slug}/Portal/Details.aspx?id={numeric_id}

const BASE_URL = 'https://www.sagesgov.com';

const JURISDICTIONS = {
  fayetteCounty: { slug: 'fayettecounty-ga', county: 'Fayette County' },
  henryCounty:   { slug: 'henrycounty-ga',   county: 'Henry County'   },
  marietta:      { slug: 'marietta-ga',       county: 'Marietta'       },
};

function msToDateStr(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function fmtDate(isoDate) {
  const [y, m, d] = isoDate.split('-');
  return `${m}/${d}/${y}`;
}

function parseSgDate(s) {
  if (!s) return 0;
  // MM/DD/YYYY
  const m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return Date.UTC(+m[3], +m[1] - 1, +m[2]);
  // YYYY-MM-DD
  const m2 = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m2) return Date.UTC(+m2[1], +m2[2] - 1, +m2[3]);
  return 0;
}

function extractZip(address) {
  if (!address) return null;
  const m = address.match(/\b(3\d{4})\b/);
  return m ? m[1] : null;
}

function htmlText(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function findChrome() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const fs = require('fs');
  const candidates = [
    '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser', '/usr/bin/chromium', '/snap/bin/chromium',
  ];
  for (const p of candidates) { if (fs.existsSync(p)) return p; }
  try {
    const { execSync } = require('child_process');
    const found = execSync('which google-chrome-stable google-chrome chromium 2>/dev/null | head -1',
      { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
    if (found) return found;
  } catch {}
  return undefined;
}

// Parse the HTML table from a SagesGov search results page.
// Returns array of raw permit objects with cells + detailHref.
function parseResultsHtml(html) {
  if (!html || !html.includes('Details.aspx')) return [];

  // Find table containing Details links
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  if (!tableMatch) return [];

  let headers = [];
  const rows = [];

  for (const tableHtml of tableMatch) {
    if (!tableHtml.includes('Details.aspx')) continue;

    // Extract headers
    const thRe = /<th[^>]*>([\s\S]*?)<\/th>/gi;
    const ths = [];
    let m;
    while ((m = thRe.exec(tableHtml)) !== null) {
      ths.push(htmlText(m[1]).toLowerCase());
    }
    if (ths.length > 0) headers = ths;

    // Extract data rows
    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    while ((m = rowRe.exec(tableHtml)) !== null) {
      const rowHtml = m[0];
      if (!rowHtml.includes('<td')) continue;

      const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells = [];
      let cm;
      while ((cm = cellRe.exec(m[1])) !== null) {
        cells.push(htmlText(cm[1]));
      }

      const linkMatch = rowHtml.match(/href="([^"]*Details\.aspx\?id=[^"]+)"/i);
      if (cells.length > 0) {
        rows.push({ cells, detailHref: linkMatch ? linkMatch[1] : null });
      }
    }
    break; // Stop after finding the results table
  }

  return { headers, rows };
}

function mapRow({ cells, detailHref }, headers, slug) {
  function get(label, fallbackPos) {
    if (headers.length > 0) {
      const idx = headers.findIndex(h =>
        h.includes(label.toLowerCase()) ||
        (label === 'number' && (h.includes('case') || h.includes('permit') || h.includes('#'))) ||
        (label === 'type' && (h.includes('type') || h.includes('record'))) ||
        (label === 'address' && h.includes('address')) ||
        (label === 'status' && h.includes('status')) ||
        (label === 'date' && (h.includes('date') || h.includes('submitted') || h.includes('filed'))) ||
        (label === 'applicant' && (h.includes('applicant') || h.includes('owner')))
      );
      if (idx >= 0 && cells[idx] != null) return cells[idx].trim();
    }
    return (cells[fallbackPos] || '').trim();
  }

  const permitNumber  = get('number', 0);
  const permitType    = get('type', 1);
  const address       = get('address', 2);
  const status        = get('status', 3);
  const submittedDate = get('date', 4);
  const applicant     = get('applicant', 5);

  const submittedMs   = parseSgDate(submittedDate);
  const dateFiled     = submittedMs
    ? new Date(submittedMs).toISOString().slice(0, 10)
    : null;

  const detailUrl = detailHref
    ? (detailHref.startsWith('http') ? detailHref : `${BASE_URL}${detailHref.startsWith('/') ? '' : `/${slug}/`}${detailHref}`)
    : null;

  return {
    permit_number:  permitNumber || null,
    address:        address || null,
    zip_code:       extractZip(address),
    permit_type:    permitType || null,
    description:    null,
    date_filed:     dateFiled,
    applicant_name: applicant || null,
    source_url:     detailUrl,
    _submittedMs:   submittedMs,
    _status:        status || null,
    _cells:         cells,
  };
}

async function fetchPermitsForJurisdiction(lastTimestampMs, { slug, county }) {
  const effectiveLastMs = lastTimestampMs || (Date.now() - 90 * 24 * 60 * 60 * 1000);
  const lastDateStr = msToDateStr(effectiveLastMs);
  const todayStr    = msToDateStr(Date.now());
  const startFmt    = fmtDate(lastDateStr);
  const endFmt      = fmtDate(todayStr);

  console.log(`[${county}] Fetching permits from ${lastDateStr} to ${todayStr}...`);

  let puppeteer;
  try { puppeteer = require('puppeteer'); }
  catch {
    console.error(`  [${county}] puppeteer not installed — skipping.`);
    return { permits: [], maxTimestamp: lastTimestampMs || Date.now() };
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: findChrome(),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  const searchUrl = `${BASE_URL}/${slug}/portal/search.aspx`;
  const allPermits = [];
  let maxTimestamp = effectiveLastMs;

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

    console.log(`  [${county}] Loading search page...`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Select Permits class
    await page.select('#cphContent_cphMain_Search1_ddlClass', '1009');
    await new Promise(r => setTimeout(r, 800));

    // Set Submission Date → DateRange
    const timeframeId = 'cphContent_cphMain_Search1_SearchOrViewFilters1_rptrDateFilter_tfddlDateFilter_2_ddlTimeframe_2';
    const startId     = 'cphContent_cphMain_Search1_SearchOrViewFilters1_rptrDateFilter_tfddlDateFilter_2_txtPeriodStart_2';
    const endId       = 'cphContent_cphMain_Search1_SearchOrViewFilters1_rptrDateFilter_tfddlDateFilter_2_txtPeriodEnd_2';

    await page.select(`#${timeframeId}`, 'DateRange');
    await new Promise(r => setTimeout(r, 300));

    // Type start date
    await page.evaluate((id) => { const el = document.getElementById(id); if (el) { el.value = ''; el.focus(); } }, startId);
    await page.type(`#${startId}`, startFmt, { delay: 50 });

    // Type end date
    await page.evaluate((id) => { const el = document.getElementById(id); if (el) { el.value = ''; el.focus(); } }, endId);
    await page.type(`#${endId}`, endFmt, { delay: 50 });

    // Solve reCAPTCHA — click the checkbox and wait for token
    console.log(`  [${county}] Waiting for reCAPTCHA...`);
    let captchaSolved = false;
    try {
      // Wait for captcha iframe to load
      await page.waitForSelector('#cphContent_cphMain_ctrlCaptcha_captchUI iframe', { timeout: 10000 });

      // Find the anchor frame and click the checkbox
      const frames = page.frames();
      const anchorFrame = frames.find(f => f.url().includes('recaptcha/api2/anchor'));
      if (anchorFrame) {
        await anchorFrame.click('#recaptcha-anchor');
        console.log(`  [${county}] Clicked reCAPTCHA checkbox, waiting for token...`);
      } else {
        // Try clicking the captcha div directly
        await page.click('#cphContent_cphMain_ctrlCaptcha_captchUI');
      }

      // Wait for token to be set (up to 30s)
      await page.waitForFunction(
        () => {
          const el = document.getElementById('cphContent_cphMain_ctrlCaptcha_txtCaptchaToken');
          return el && el.value && el.value.length > 10;
        },
        { timeout: 30000 }
      );
      captchaSolved = true;
      console.log(`  [${county}] reCAPTCHA token received.`);
    } catch (err) {
      console.error(`  [${county}] reCAPTCHA handling failed: ${err.message}`);
      console.error(`  [${county}] Skipping — captcha must be solved to search SagesGov.`);
      return { permits: [], maxTimestamp: lastTimestampMs || Date.now() };
    }

    if (!captchaSolved) {
      return { permits: [], maxTimestamp: lastTimestampMs || Date.now() };
    }

    // Submit the search
    console.log(`  [${county}] Submitting search...`);
    await Promise.all([
      page.click('#cphContent_cphMain_btnSearch'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
    ]);

    await new Promise(r => setTimeout(r, 1000));

    // Parse results across all pages
    let pageNum = 0;
    let hasMore = true;

    while (hasMore && pageNum < 50) {
      const html = await page.content();

      if (!html.includes('Details.aspx')) {
        console.log(`  [${county}] No results found on page ${pageNum + 1}.`);
        break;
      }

      const { headers, rows } = parseResultsHtml(html);

      if (pageNum === 0 && headers.length > 0) {
        console.log(`  [${county}] Columns: ${headers.join(', ')}`);
      }

      if (!rows || rows.length === 0) break;
      console.log(`  [${county}] Page ${pageNum + 1}: ${rows.length} rows`);

      for (const row of rows) {
        const permit = mapRow(row, headers, slug);
        if (permit.permit_number || permit.source_url) {
          allPermits.push(permit);
        }
      }

      // Check for next page — look for __doPostBack links with Page$ pattern
      const nextPageHref = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="__doPostBack"]'));
        // Find the ">" or "Next" link, or the next numbered page
        for (const l of links) {
          const text = l.textContent.trim();
          if (text === '>' || text.toLowerCase() === 'next') {
            return l.getAttribute('href');
          }
        }
        return null;
      });

      if (nextPageHref) {
        pageNum++;
        await page.evaluate((href) => {
          const m = href.match(/__doPostBack\('([^']+)','([^']*)'\)/);
          if (m) __doPostBack(m[1], m[2]); // eslint-disable-line no-undef
        }, nextPageHref);
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 500));
      } else {
        hasMore = false;
      }
    }

  } catch (err) {
    console.error(`  ❌ [${county}] Error: ${err.message}`);
  } finally {
    await browser.close();
  }

  // Finalise — remove internal fields, compute maxTimestamp
  const finalPermits = allPermits.map(p => {
    const ts = p._submittedMs || 0;
    if (ts > maxTimestamp) maxTimestamp = ts;

    const { _submittedMs, _cells, _status, ...permit } = p;
    return {
      ...permit,
      county,
      raw_data: { status: _status },
    };
  });

  if (maxTimestamp === effectiveLastMs && finalPermits.length > 0) {
    maxTimestamp = Date.now();
  }

  console.log(`[${county}] Found ${finalPermits.length} permits. Max ts: ${new Date(maxTimestamp).toISOString()}`);
  return { permits: finalPermits, maxTimestamp };
}

async function fetchFayettePermits(lastTimestampMs) {
  return fetchPermitsForJurisdiction(lastTimestampMs, JURISDICTIONS.fayetteCounty);
}

async function fetchHenryPermits(lastTimestampMs) {
  return fetchPermitsForJurisdiction(lastTimestampMs, JURISDICTIONS.henryCounty);
}

async function fetchMariettaPermits(lastTimestampMs) {
  return fetchPermitsForJurisdiction(lastTimestampMs, JURISDICTIONS.marietta);
}

module.exports = { fetchFayettePermits, fetchHenryPermits, fetchMariettaPermits };

if (require.main === module) {
  const target = process.argv[2] || 'fayette';
  const since = process.argv[3]
    ? new Date(process.argv[3]).getTime()
    : Date.now() - 30 * 24 * 60 * 60 * 1000;

  const fn = target === 'henry' ? fetchHenryPermits
           : target === 'marietta' ? fetchMariettaPermits
           : fetchFayettePermits;

  fn(since)
    .then(({ permits, maxTimestamp }) => {
      console.log('\n--- RESULTS ---');
      console.log(`Total: ${permits.length}, max ts: ${new Date(maxTimestamp).toISOString()}`);
      if (permits.length > 0) {
        console.log('\n--- SAMPLE ---');
        console.log(JSON.stringify(permits[0], null, 2));
      }
    })
    .catch(console.error);
}
