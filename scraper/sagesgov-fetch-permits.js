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
  laGrange:      { slug: 'lagrange-ga',       county: 'LaGrange'       },
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

// Attempt a direct HTTP POST to the SagesGov search form without solving reCAPTCHA.
// SagesGov sometimes does not enforce the token server-side; if it does, it returns
// an HTML page without any Details.aspx links and we fall back to Puppeteer.
async function tryDirectHttp(searchUrl, slug, startFmt, endFmt, county) {
  try {
    const axios = require('axios');
    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

    // Step 1: GET the page for session cookie + hidden ASP.NET fields
    const r1 = await axios.get(searchUrl, {
      headers: { 'User-Agent': UA },
      timeout: 20000,
      withCredentials: true,
    });

    const setCookies = r1.headers['set-cookie'] || [];
    const cookieStr  = setCookies.map(c => c.split(';')[0]).join('; ');

    // Extract hidden ASP.NET fields
    const hiddenFields = {};
    for (const m of (r1.data || '').matchAll(/<input[^>]+type="hidden"[^>]+>/gi)) {
      const tag  = m[0];
      const name = (tag.match(/name="([^"]+)"/) || [])[1];
      const val  = (tag.match(/value="([^"]*)"/) || [])[1] ?? '';
      if (name) hiddenFields[name] = val;
    }

    if (!hiddenFields['__VIEWSTATE']) {
      console.log(`  [${county}] Direct HTTP: no ViewState on GET — skipping direct attempt.`);
      return null;
    }

    // Step 2: POST the search — include all hidden fields + search criteria + empty captcha token
    const timeframeKey = 'ctl00$cphContent$cphMain$Search1$SearchOrViewFilters1$rptrDateFilter$ctl03$ddlTimeframe_2';
    const startKey     = 'ctl00$cphContent$cphMain$Search1$SearchOrViewFilters1$rptrDateFilter$ctl03$txtPeriodStart_2';
    const endKey       = 'ctl00$cphContent$cphMain$Search1$SearchOrViewFilters1$rptrDateFilter$ctl03$txtPeriodEnd_2';
    const classKey     = 'ctl00$cphContent$cphMain$Search1$ddlClass';
    const captchaKey   = 'ctl00$cphContent$cphMain$ctrlCaptcha$txtCaptchaToken';
    const searchBtnKey = 'ctl00$cphContent$cphMain$btnSearch';

    const form = new URLSearchParams({
      ...hiddenFields,
      [classKey]:     '1009',
      [timeframeKey]: 'Date Range',
      [startKey]:     startFmt,
      [endKey]:       endFmt,
      [captchaKey]:   '',
      [searchBtnKey]: 'Search',
    });

    const r2 = await axios.post(searchUrl, form.toString(), {
      headers: {
        'User-Agent':   UA,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie':       cookieStr,
        'Referer':      searchUrl,
      },
      timeout: 30000,
    });

    if (r2.data && r2.data.includes('Details.aspx')) {
      console.log(`  [${county}] Direct HTTP succeeded (reCAPTCHA not enforced server-side).`);
      return r2.data;
    }

    console.log(`  [${county}] Direct HTTP returned no results — reCAPTCHA likely enforced; falling back to Puppeteer.`);
    return null;
  } catch (err) {
    console.log(`  [${county}] Direct HTTP failed (${err.message}) — falling back to Puppeteer.`);
    return null;
  }
}

// Solve a reCAPTCHA v2 checkbox via the 2captcha service.
// Returns the g-recaptcha-response token string, or null on failure/no API key.
// Uses the stable in.php/res.php HTTP API so no extra npm dependency is required.
async function solve2Captcha(sitekey, pageUrl, county) {
  const apiKey = process.env.TWOCAPTCHA_API_KEY;
  if (!apiKey) return null;

  const axios = require('axios');
  try {
    const inResp = await axios.get('https://2captcha.com/in.php', {
      params: {
        key: apiKey,
        method: 'userrecaptcha',
        googlekey: sitekey,
        pageurl: pageUrl,
        json: 1,
      },
      timeout: 20000,
    });

    if (inResp.data.status !== 1) {
      console.error(`  [${county}] 2captcha submit failed: ${inResp.data.request}`);
      return null;
    }

    const id = inResp.data.request;
    console.log(`  [${county}] 2captcha job ${id} submitted; polling for solution...`);

    // reCAPTCHA solves usually take 15–60s; poll for up to ~120s.
    for (let i = 0; i < 24; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const res = await axios.get('https://2captcha.com/res.php', {
        params: { key: apiKey, action: 'get', id, json: 1 },
        timeout: 20000,
      });
      if (res.data.status === 1) {
        console.log(`  [${county}] 2captcha solved.`);
        return res.data.request;
      }
      if (res.data.request !== 'CAPCHA_NOT_READY') {
        console.error(`  [${county}] 2captcha error: ${res.data.request}`);
        return null;
      }
    }

    console.error(`  [${county}] 2captcha timed out after ~120s.`);
    return null;
  } catch (err) {
    console.error(`  [${county}] 2captcha request failed: ${err.message}`);
    return null;
  }
}

// Run a single SagesGov search for one date window on an existing page.
// Returns { tooMany: bool, permits: [rawPermit...] }. `tooMany` signals the result
// set exceeded SagesGov's display cap so the caller should retry a narrower window.
async function searchOneWindow(page, { searchUrl, slug, county, startFmt, endFmt }) {
  const timeframeId = 'cphContent_cphMain_Search1_SearchOrViewFilters1_rptrDateFilter_tfddlDateFilter_2_ddlTimeframe_2';
  const startId     = 'cphContent_cphMain_Search1_SearchOrViewFilters1_rptrDateFilter_tfddlDateFilter_2_txtPeriodStart_2';
  const endId       = 'cphContent_cphMain_Search1_SearchOrViewFilters1_rptrDateFilter_tfddlDateFilter_2_txtPeriodEnd_2';

  // Fresh load each attempt so the form state (and captcha widget) is reset.
  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

  // Select Permits class
  await page.select('#cphContent_cphMain_Search1_ddlClass', '1009');
  await new Promise(r => setTimeout(r, 800));

  // Set Submission Date → Date Range (option value has a space; label is "Date range (fixed)").
  await page.select(`#${timeframeId}`, 'Date Range');
  // Selecting it reveals the Period Start/End inputs (may involve an AutoPostBack).
  await page.waitForFunction(
    (id) => { const el = document.getElementById(id); return el && el.offsetParent !== null; },
    { timeout: 15000 },
    startId,
  ).catch(() => {});
  await new Promise(r => setTimeout(r, 300));

  // Type start + end dates
  await page.evaluate((id) => { const el = document.getElementById(id); if (el) { el.value = ''; el.focus(); } }, startId);
  await page.type(`#${startId}`, startFmt, { delay: 50 });
  await page.evaluate((id) => { const el = document.getElementById(id); if (el) { el.value = ''; el.focus(); } }, endId);
  await page.type(`#${endId}`, endFmt, { delay: 50 });

  // Solve reCAPTCHA — stealth may auto-solve; otherwise use 2captcha; else click the checkbox.
  console.log(`  [${county}] Waiting for reCAPTCHA...`);
  await page.waitForSelector('#cphContent_cphMain_ctrlCaptcha_captchUI iframe', { timeout: 10000 });

  const alreadySolved = await page.evaluate(() => {
    const el = document.getElementById('cphContent_cphMain_ctrlCaptcha_txtCaptchaToken');
    return el && el.value && el.value.length > 10;
  });

  if (alreadySolved) {
    console.log(`  [${county}] reCAPTCHA auto-solved by stealth mode.`);
  } else if (process.env.TWOCAPTCHA_API_KEY) {
    const sitekey = await page.evaluate(() => {
      const el = document.querySelector('[data-sitekey]');
      if (el) return el.getAttribute('data-sitekey');
      const iframe = document.querySelector('iframe[src*="recaptcha/api2/anchor"]');
      if (iframe) {
        const m = iframe.src.match(/[?&]k=([^&]+)/);
        if (m) return decodeURIComponent(m[1]);
      }
      return null;
    });
    if (!sitekey) throw new Error('could not find reCAPTCHA sitekey');

    console.log(`  [${county}] Solving reCAPTCHA via 2captcha (sitekey ${sitekey.slice(0, 12)}…)...`);
    const token = await solve2Captcha(sitekey, searchUrl, county);
    if (!token) throw new Error('2captcha did not return a token');

    // Inject token: populate g-recaptcha-response, the SagesGov hidden field, and fire the callback.
    await page.evaluate((tok) => {
      document.querySelectorAll('textarea#g-recaptcha-response, textarea[name="g-recaptcha-response"]')
        .forEach(t => { t.value = tok; t.style.display = 'block'; });
      const hidden = document.getElementById('cphContent_cphMain_ctrlCaptcha_txtCaptchaToken');
      if (hidden) hidden.value = tok;
      const cbEl = document.querySelector('[data-callback]');
      const cbName = cbEl && cbEl.getAttribute('data-callback');
      if (cbName && typeof window[cbName] === 'function') {
        try { window[cbName](tok); } catch {}
      }
    }, token);

    const injected = await page.evaluate(() => {
      const el = document.getElementById('cphContent_cphMain_ctrlCaptcha_txtCaptchaToken');
      return !!(el && el.value && el.value.length > 10);
    });
    if (!injected) throw new Error('token injection did not populate the hidden field');
    console.log(`  [${county}] reCAPTCHA token injected.`);
  } else {
    const frames = page.frames();
    const anchorFrame = frames.find(f => f.url().includes('recaptcha/api2/anchor'));
    if (anchorFrame) {
      await anchorFrame.click('#recaptcha-anchor');
      console.log(`  [${county}] Clicked reCAPTCHA checkbox, waiting for token...`);
    } else {
      await page.click('#cphContent_cphMain_ctrlCaptcha_captchUI');
    }
    await page.waitForFunction(
      () => {
        const el = document.getElementById('cphContent_cphMain_ctrlCaptcha_txtCaptchaToken');
        return el && el.value && el.value.length > 10;
      },
      { timeout: 30000 },
    );
    console.log(`  [${county}] reCAPTCHA token received.`);
  }

  // Submit the search
  console.log(`  [${county}] Submitting search...`);
  await Promise.all([
    page.click('#cphContent_cphMain_btnSearch'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
  ]);
  await new Promise(r => setTimeout(r, 1000));

  const firstHtml = await page.content();
  if (/too many records/i.test(firstHtml)) {
    return { tooMany: true, permits: [] };
  }

  // Parse results across all pages
  const permits = [];
  let pageNum = 0;
  let hasMore = true;
  while (hasMore && pageNum < 50) {
    const html = await page.content();
    if (!html.includes('Details.aspx')) {
      if (pageNum === 0) console.log(`  [${county}] No results found in this window.`);
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
      if (permit.permit_number || permit.source_url) permits.push(permit);
    }

    const nextPageHref = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="__doPostBack"]'));
      for (const l of links) {
        const text = l.textContent.trim();
        if (text === '>' || text.toLowerCase() === 'next') return l.getAttribute('href');
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

  return { tooMany: false, permits };
}

async function fetchPermitsForJurisdiction(lastTimestampMs, { slug, county }) {
  const effectiveLastMs = lastTimestampMs || (Date.now() - 90 * 24 * 60 * 60 * 1000);
  const lastDateStr = msToDateStr(effectiveLastMs);
  const todayStr    = msToDateStr(Date.now());
  const startFmt    = fmtDate(lastDateStr);
  const endFmt      = fmtDate(todayStr);

  console.log(`[${county}] Fetching permits from ${lastDateStr} to ${todayStr}...`);

  const searchUrl = `${BASE_URL}/${slug}/portal/search.aspx`;
  const allPermits = [];
  let maxTimestamp = effectiveLastMs;

  // Try direct HTTP first — avoids Puppeteer + reCAPTCHA entirely if server doesn't validate token
  const directHtml = await tryDirectHttp(searchUrl, slug, startFmt, endFmt, county);
  if (directHtml) {
    const { headers, rows } = parseResultsHtml(directHtml);
    if (headers) console.log(`  [${county}] Columns: ${headers.join(', ')}`);
    for (const row of (rows || [])) {
      const permit = mapRow(row, headers || [], slug);
      if (permit.permit_number || permit.source_url) allPermits.push(permit);
    }
    console.log(`  [${county}] Direct HTTP: ${allPermits.length} permits parsed.`);

    const finalPermits = allPermits.map(p => {
      const ts = p._submittedMs || 0;
      if (ts > maxTimestamp) maxTimestamp = ts;
      const { _submittedMs, _cells, _status, ...permit } = p;
      return { ...permit, county, raw_data: { status: _status } };
    });
    if (maxTimestamp === effectiveLastMs && finalPermits.length > 0) maxTimestamp = Date.now();
    console.log(`[${county}] Found ${finalPermits.length} permits via direct HTTP.`);
    return { permits: finalPermits, maxTimestamp };
  }

  let puppeteerExtra, StealthPlugin;
  try {
    puppeteerExtra = require('puppeteer-extra');
    StealthPlugin   = require('puppeteer-extra-plugin-stealth');
    puppeteerExtra.use(StealthPlugin());
  } catch {
    try { puppeteerExtra = require('puppeteer'); }
    catch {
      console.error(`  [${county}] puppeteer not installed — skipping.`);
      return { permits: [], maxTimestamp: lastTimestampMs || Date.now() };
    }
  }

  const browser = await puppeteerExtra.launch({
    headless: true,
    executablePath: findChrome(),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  // Adaptive date-range narrowing: SagesGov rejects oversized result sets with
  // "Too many records matched". Try the requested window first; if it's too large,
  // shrink it (anchored at today) until the search returns rows. Steady-state runs
  // have a small window (cursor ~days back) and succeed on the first attempt; only a
  // cold-start backfill triggers narrowing.
  const day = 24 * 60 * 60 * 1000;
  const candidateStarts = [effectiveLastMs, Date.now() - 60 * day, Date.now() - 30 * day, Date.now() - 14 * day, Date.now() - 7 * day]
    .filter(ms => ms >= effectiveLastMs);
  const windowStarts = [...new Set(candidateStarts)].sort((a, b) => a - b); // widest first

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

    for (let i = 0; i < windowStarts.length; i++) {
      const ws = windowStarts[i];
      const sFmt = fmtDate(msToDateStr(ws));
      console.log(`  [${county}] Searching ${msToDateStr(ws)} → ${todayStr}...`);
      let res;
      try {
        res = await searchOneWindow(page, { searchUrl, slug, county, startFmt: sFmt, endFmt });
      } catch (err) {
        console.error(`  [${county}] Search attempt failed: ${err.message}`);
        break;
      }
      if (res.tooMany) {
        console.log(`  [${county}] Too many records — narrowing window.`);
        continue;
      }
      for (const p of res.permits) allPermits.push(p);
      break;
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

async function fetchLaGrangePermits(lastTimestampMs) {
  return fetchPermitsForJurisdiction(lastTimestampMs, JURISDICTIONS.laGrange);
}

module.exports = { fetchFayettePermits, fetchHenryPermits, fetchMariettaPermits, fetchLaGrangePermits };

if (require.main === module) {
  const target = process.argv[2] || 'fayette';
  const since = process.argv[3]
    ? new Date(process.argv[3]).getTime()
    : Date.now() - 30 * 24 * 60 * 60 * 1000;

  const fn = target === 'henry'    ? fetchHenryPermits
           : target === 'marietta' ? fetchMariettaPermits
           : target === 'lagrange' ? fetchLaGrangePermits
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
