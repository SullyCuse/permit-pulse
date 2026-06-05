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

    // Step 1: Navigate to search page
    console.log('  [Conyers] Loading search page...');
    await page.goto(SEARCH_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Step 2: Show the search form and set the date range
    console.log(`  [Conyers] Setting date range: ${dateRange}`);
    await page.evaluate((range) => {
      const edit = document.getElementById('search-edit');
      if (edit) edit.style.display = 'block';
      const inp = document.getElementById('SubmittedOn');
      if (inp) inp.value = range;
    }, dateRange);

    // Step 3: Click the Search button directly
    console.log('  [Conyers] Clicking Search button...');
    const searchBtn = await page.$('button.sgc-button-primary, button[onclick*="Search"]');
    if (!searchBtn) {
      console.log('  [Conyers] Search button not found — skipping.');
      return { permits: [], maxTimestamp: lastTimestampMs || Date.now() };
    }
    searchBtn.click();
    await page.waitForNetworkIdle({ idleTime: 1000, timeout: 20000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 500));

    // Step 4: Parse results from page HTML — SmartGov renders results inline after submit
    let globalHeaders = [];
    let currentPage = 0;
    let hasMore = true;

    while (hasMore && currentPage < 50) {
      const html = await page.content();

      // Debug: log page title and key HTML fragments to diagnose parsing
      if (currentPage === 0) {
        const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
        console.log(`  [Conyers] Page title: ${titleMatch ? titleMatch[1] : 'unknown'}`);
        console.log(`  [Conyers] Has ils-list-row: ${html.includes('ils-list-row')}`);
        console.log(`  [Conyers] Has search-results: ${html.includes('search-results')}`);
        console.log(`  [Conyers] Has <tr: ${html.includes('<tr')}`);
        const idxTr = html.indexOf('ils-list-row');
        if (idxTr > 0) console.log(`  [Conyers] ils-list-row context: ${html.slice(Math.max(0, idxTr-50), idxTr+200)}`);
        else {
          const trIdx = html.indexOf('<tr');
          if (trIdx > 0) console.log(`  [Conyers] First <tr context: ${html.slice(trIdx, trIdx+300)}`);
        }
      }

      const { headers, rows } = parseResultsHtml(html);

      if (currentPage === 0) {
        if (rows.length === 0) {
          console.log('  [Conyers] No results found.');
          break;
        }
        if (headers.length > 0) {
          globalHeaders = headers;
          console.log('  [Conyers] Columns:', headers.join(', '));
        }
      }

      if (rows.length === 0) { hasMore = false; break; }
      console.log(`  [Conyers] Page ${currentPage + 1}: ${rows.length} rows`);

      for (const row of rows) {
        const permit = mapRow(row, globalHeaders);
        if (permit.permit_number) permits.push(permit);
      }

      const pageHasNext = html.includes('class="next"') ||
                          html.includes(`gotoPage(${currentPage + 1})`);
      if (pageHasNext) {
        currentPage++;
        const nextLink = await page.$('a.next, li.next > a');
        if (nextLink) {
          nextLink.click();
          await page.waitForNetworkIdle({ idleTime: 1000, timeout: 10000 }).catch(() => {});
          await new Promise(r => setTimeout(r, 300));
        } else {
          hasMore = false;
        }
      } else {
        hasMore = false;
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
