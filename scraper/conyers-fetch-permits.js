require('dotenv').config();

// City of Conyers, GA — SmartGov (Granicus) portal scraper.
//
// SmartGov requires a real browser session (server-side ASP.NET session state).
// We use Puppeteer to:
//   1. Load the advanced permit search page (establishes ASP.NET session)
//   2. Set SubmittedOn to the date range since the last run
//   3. Submit the search form
//   4. Intercept the SearchPage AJAX responses to capture result HTML
//   5. Paginate through all result pages
//
// Cursor: Unix ms timestamp of last processed SubmittedOn date.
// State key: conyers_last_timestamp

const SEARCH_URL = 'https://ci-conyers-ga.smartgovcommunity.com/PermittingPublic/PermitSearchAdvanced';

function msToDateStr(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

// Format YYYY-MM-DD as MM/DD/YYYY for SmartGov date inputs
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

// Parse "M/D/YYYY" → Unix ms (midnight UTC)
function parseSgDate(s) {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return Date.UTC(+m[3], +m[1] - 1, +m[2]);
}

// Extract plain text from an HTML snippet
function htmlText(html) {
  return html.replace(/<[^>]+>/g, '').trim();
}

// Parse SmartGov results HTML fragment into row arrays
function parseResultsHtml(html) {
  if (!html || !html.includes('<tr')) return { headers: [], rows: [] };

  // Header row
  const thRe = /<th[^>]*>([\s\S]*?)<\/th>/gi;
  const headers = [];
  let m;
  while ((m = thRe.exec(html)) !== null) {
    headers.push(htmlText(m[1]));
  }

  // Data rows — SmartGov uses class="ils-list-row" or similar
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

// Map a SmartGov result row to our permit schema
function mapRow({ cells, detailPath }, headers) {
  // Try header-based lookup first, fall back to positional
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

  const detailUrl = detailPath
    ? `https://ci-conyers-ga.smartgovcommunity.com${detailPath}`
    : null;

  return {
    permit_number:   permitNumber || null,
    address:         address || null,
    zip_code:        null,
    permit_type:     permitType || null,
    description:     null,
    date_filed:      dateFiled,
    county:          'Conyers',
    contractor_name: null,
    applicant_name:  null,
    source_url:      detailUrl,
    raw_data: { status, submitted_on: submittedOn, issued_on: issuedOn },
    _submittedMs:    submittedMs,
    _issuedMs:       issuedMs,
  };
}

async function fetchNewPermits(lastTimestampMs) {
  // Default to 90 days if no cursor
  const effectiveLastMs = lastTimestampMs || (Date.now() - 90 * 24 * 60 * 60 * 1000);
  const lastDateStr = msToDateStr(effectiveLastMs);
  const todayStr    = msToDateStr(Date.now());
  const dateRange   = `${fmtDate(lastDateStr)} - ${fmtDate(todayStr)}`;

  console.log(`[Conyers] Fetching permits since ${lastDateStr} (range: ${dateRange})...`);

  let puppeteer;
  try { puppeteer = require('puppeteer'); }
  catch {
    console.error('  [Conyers] puppeteer not installed — skipping.');
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

    // Queue for capturing SearchPage AJAX responses
    const searchPageResponses = [];
    page.on('response', async (resp) => {
      if (resp.url().includes('/SearchPage') && resp.status() === 200) {
        try {
          const text = await resp.text();
          if (text && text.includes('<tr')) {
            searchPageResponses.push(text);
          }
        } catch {}
      }
    });

    // Step 1: Navigate to search page (establishes session)
    console.log('  [Conyers] Loading search page...');
    await page.goto(SEARCH_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Step 2: Set SubmittedOn date range.
    // The field starts as type="text"; il-daterangepicker.js may replace it
    // with a web component. We set the underlying hidden input directly.
    console.log(`  [Conyers] Setting date range: ${dateRange}`);
    await page.evaluate((range) => {
      const inp = document.getElementById('SubmittedOn');
      if (inp) {
        inp.value = range;
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
      // Also set the display field if the daterangepicker already replaced it
      const display = document.querySelector('[name="SubmittedOn.display"]');
      if (display) { display.value = range; }
    }, dateRange);

    // Step 3: Submit the search form
    console.log('  [Conyers] Submitting search...');
    await page.evaluate(() => {
      // FormSupport.submitAction changes form.action to /Search and calls form.submit()
      FormSupport.submitAction('Search');
    });

    // Wait for the page to reload (full form submit → navigation)
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
      .catch(() => {});

    // Step 4: Trigger first SearchPage AJAX load
    // The page has PermitSearchResults.gotoPage defined; call it to load results.
    console.log('  [Conyers] Loading first results page...');
    await page.evaluate(() => {
      if (typeof PermitSearchResults !== 'undefined') {
        PermitSearchResults.gotoPage(0);
      }
    });

    // Wait for the first SearchPage response
    const timeout = 15000;
    const start = Date.now();
    while (searchPageResponses.length === 0 && Date.now() - start < timeout) {
      await new Promise(r => setTimeout(r, 500));
    }

    if (searchPageResponses.length === 0) {
      console.log('  [Conyers] No results returned from SearchPage.');
      return { permits: [], maxTimestamp: lastTimestampMs || Date.now() };
    }

    // Step 5: Process the first page
    let globalHeaders = [];
    let currentPage = 0;
    let hasMore = true;

    while (hasMore && currentPage < 50) {
      const html = searchPageResponses.shift();
      if (!html) break;

      const { headers, rows } = parseResultsHtml(html);
      if (currentPage === 0 && headers.length > 0) {
        globalHeaders = headers;
        console.log('  [Conyers] Columns:', headers.join(', '));
      }

      if (rows.length === 0) { hasMore = false; break; }
      console.log(`  [Conyers] Page ${currentPage + 1}: ${rows.length} rows`);

      for (const row of rows) {
        const permit = mapRow(row, globalHeaders);
        if (permit.permit_number) permits.push(permit);
      }

      // Check if more pages exist (SmartGov shows page nav with class "next" or page number links)
      hasMore = html.includes('class="next"') ||
                html.includes(`gotoPage(${currentPage + 1})`) ||
                html.includes(`gotoPage( ${currentPage + 1} )`);

      if (hasMore) {
        currentPage++;
        await page.evaluate((pn) => {
          if (typeof PermitSearchResults !== 'undefined') {
            PermitSearchResults.gotoPage(pn);
          }
        }, currentPage);

        // Wait for next page response
        const pageStart = Date.now();
        while (searchPageResponses.length === 0 && Date.now() - pageStart < 10000) {
          await new Promise(r => setTimeout(r, 300));
        }
      }
    }

  } catch (err) {
    console.error(`  ❌ [Conyers] Error: ${err.message}`);
  } finally {
    await browser.close();
  }

  // Build final permit list, advancing the cursor
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

  console.log(`[Conyers] Found ${finalPermits.length} permits. Max timestamp: ${new Date(maxTimestamp).toISOString()}`);
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
        if (permits.length > 1) {
          console.log('\n--- SECOND ---');
          console.log(JSON.stringify(permits[1], null, 2));
        }
      }
    })
    .catch(console.error);
}
