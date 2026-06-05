require('dotenv').config();

// Camden County, GA — SmartGov (Granicus) portal scraper.
// Same platform as Conyers: Puppeteer-driven, ASP.NET session required.
// Cursor: Unix ms timestamp of last processed SubmittedOn date.
// State key: camden_last_timestamp

const BASE_HOST = 'https://co-camden-ga.smartgovcommunity.com';
const SEARCH_URL = `${BASE_HOST}/PermittingPublic/PermitSearchAdvanced`;

function msToDateStr(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}/${y}`;
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

function parseSgDate(s) {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return Date.UTC(+m[3], +m[1] - 1, +m[2]);
}

function htmlText(html) {
  return html.replace(/<[^>]+>/g, '').trim();
}

function parseResultsHtml(html) {
  if (!html || !html.includes('<tr')) return { headers: [], rows: [] };

  const thRe = /<th[^>]*>([\s\S]*?)<\/th>/gi;
  const headers = [];
  let m;
  while ((m = thRe.exec(html)) !== null) {
    headers.push(htmlText(m[1]));
  }

  const rowRe = /<tr[^>]*class="[^"]*ils-list-row[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  const linkRe = /href="(\/PermittingPublic\/[^"]+)"/i;
  const rows = [];

  while ((m = rowRe.exec(html)) !== null) {
    const rowHtml = m[0];
    const cells = [];
    let cm;
    while ((cm = cellRe.exec(m[1])) !== null) {
      cells.push(htmlText(cm[1]));
    }
    const linkMatch = rowHtml.match(linkRe);
    rows.push({ cells, detailPath: linkMatch ? linkMatch[1] : null });
  }

  return { headers, rows };
}

function mapRow({ cells, detailPath }, headers) {
  function get(label, pos) {
    if (headers.length > 0) {
      const idx = headers.findIndex(h => h.toLowerCase().includes(label.toLowerCase()));
      if (idx >= 0 && cells[idx] != null) return cells[idx].trim();
    }
    return (cells[pos] || '').trim();
  }

  const permitNumber = get('number', 0) || get('application', 0);
  const permitType   = get('type', 1);
  const status       = get('status', 2);
  const address      = get('address', 3);
  const submittedOn  = get('submitted', 4);
  const issuedOn     = get('issued', 5);

  const submittedMs  = parseSgDate(submittedOn);
  const issuedMs     = parseSgDate(issuedOn);

  const dateFiled = issuedMs
    ? new Date(issuedMs).toISOString().slice(0, 10)
    : (submittedMs ? new Date(submittedMs).toISOString().slice(0, 10) : null);

  const detailUrl = detailPath ? `${BASE_HOST}${detailPath}` : null;

  return {
    permit_number:   permitNumber || null,
    address:         address || null,
    zip_code:        null,
    permit_type:     permitType || null,
    description:     null,
    date_filed:      dateFiled,
    county:          'Camden County',
    contractor_name: null,
    applicant_name:  null,
    source_url:      detailUrl,
    raw_data: { status, submitted_on: submittedOn, issued_on: issuedOn },
    _submittedMs:    submittedMs,
    _issuedMs:       issuedMs,
  };
}

async function fetchNewPermits(lastTimestampMs) {
  const effectiveLastMs = lastTimestampMs || (Date.now() - 90 * 24 * 60 * 60 * 1000);
  const lastDateStr = msToDateStr(effectiveLastMs);
  const todayStr    = msToDateStr(Date.now());
  const dateRange   = `${fmtDate(lastDateStr)} - ${fmtDate(todayStr)}`;

  console.log(`[Camden County] Fetching permits since ${lastDateStr} (range: ${dateRange})...`);

  let puppeteer;
  try { puppeteer = require('puppeteer'); }
  catch {
    console.error('  [Camden County] puppeteer not installed — skipping.');
    return { permits: [], maxTimestamp: lastTimestampMs || Date.now() };
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: findChrome(),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  const permits = [];
  let maxTimestamp = effectiveLastMs;

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

    const searchPageResponses = [];
    page.on('response', async (resp) => {
      if (resp.url().includes('/SearchPage') && resp.status() === 200) {
        try {
          const text = await resp.text();
          if (text && text.includes('<tr')) searchPageResponses.push(text);
        } catch {}
      }
    });

    console.log('  [Camden County] Loading search page...');
    await page.goto(SEARCH_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    console.log(`  [Camden County] Setting date range: ${dateRange}`);
    await page.evaluate((range) => {
      const inp = document.getElementById('SubmittedOn');
      if (inp) {
        inp.value = range;
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const display = document.querySelector('[name="SubmittedOn.display"]');
      if (display) { display.value = range; }
    }, dateRange);

    console.log('  [Camden County] Submitting search...');
    await page.evaluate(() => { FormSupport.submitAction('Search'); });
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});

    console.log('  [Camden County] Loading first results page...');
    await page.evaluate(() => {
      if (typeof PermitSearchResults !== 'undefined') PermitSearchResults.gotoPage(0);
    });

    const timeout = 15000;
    const start = Date.now();
    while (searchPageResponses.length === 0 && Date.now() - start < timeout) {
      await new Promise(r => setTimeout(r, 500));
    }

    if (searchPageResponses.length === 0) {
      console.log('  [Camden County] No results returned from SearchPage.');
      return { permits: [], maxTimestamp: lastTimestampMs || Date.now() };
    }

    let globalHeaders = [];
    let currentPage = 0;
    let hasMore = true;

    while (hasMore && currentPage < 50) {
      const html = searchPageResponses.shift();
      if (!html) break;

      const { headers, rows } = parseResultsHtml(html);
      if (currentPage === 0 && headers.length > 0) {
        globalHeaders = headers;
        console.log('  [Camden County] Columns:', headers.join(', '));
      }

      if (rows.length === 0) { hasMore = false; break; }
      console.log(`  [Camden County] Page ${currentPage + 1}: ${rows.length} rows`);

      for (const row of rows) {
        const permit = mapRow(row, globalHeaders);
        if (permit.permit_number) permits.push(permit);
      }

      hasMore = html.includes('class="next"') ||
                html.includes(`gotoPage(${currentPage + 1})`) ||
                html.includes(`gotoPage( ${currentPage + 1} )`);

      if (hasMore) {
        currentPage++;
        await page.evaluate((pn) => {
          if (typeof PermitSearchResults !== 'undefined') PermitSearchResults.gotoPage(pn);
        }, currentPage);

        const pageStart = Date.now();
        while (searchPageResponses.length === 0 && Date.now() - pageStart < 10000) {
          await new Promise(r => setTimeout(r, 300));
        }
      }
    }

  } catch (err) {
    console.error(`  ❌ [Camden County] Error: ${err.message}`);
  } finally {
    await browser.close();
  }

  const finalPermits = [];
  for (const p of permits) {
    const ts = p._issuedMs || p._submittedMs || 0;
    if (ts > maxTimestamp) maxTimestamp = ts;
    delete p._submittedMs;
    delete p._issuedMs;
    finalPermits.push(p);
  }

  if (maxTimestamp === effectiveLastMs && finalPermits.length > 0) {
    maxTimestamp = Date.now();
  }

  console.log(`[Camden County] Found ${finalPermits.length} permits. Max timestamp: ${new Date(maxTimestamp).toISOString()}`);
  return { permits: finalPermits, maxTimestamp };
}

module.exports = { fetchNewPermits };

if (require.main === module) {
  const since = process.argv[2]
    ? new Date(process.argv[2]).getTime()
    : Date.now() - 90 * 24 * 60 * 60 * 1000;

  fetchNewPermits(since)
    .then(({ permits, maxTimestamp }) => {
      console.log('\n--- RESULTS ---');
      console.log(`Total: ${permits.length}, max timestamp: ${new Date(maxTimestamp).toISOString()}`);
      if (permits.length > 0) {
        console.log('\n--- SAMPLE ---');
        console.log(JSON.stringify(permits[0], null, 2));
      }
    })
    .catch(console.error);
}
