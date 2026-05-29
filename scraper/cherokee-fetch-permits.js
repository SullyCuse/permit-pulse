require('dotenv').config();

// Cherokee County, GA — CityView portal scraper.
//
// The CityView portal's LocatorResults AJAX endpoint returns empty responses for
// plain HTTP requests (Content-Length: 0) regardless of session/CSRF setup.
// It only works when called from a real browser that passes TLS fingerprint and
// has the page's JavaScript execution context. We use Puppeteer to open the
// InspectionLocator page and call LocatorResults via page.evaluate() so jQuery
// makes the request from inside the real browser session.
//
// Permit number format: PR{YEAR}{7-digit-zero-padded}  e.g. PR20260000001
// Cursor: last processed permit number string, incremented each run.

const BASE_URL = 'https://cityview.cherokeega.com/CVProdPortal';
const LOCATOR_PAGE = `${BASE_URL}/Permit/InspectionLocator`;
const PERMIT_SEARCH_URL = `${BASE_URL}/Permit/PermitSearch`;
const LOCATOR_RESULTS_URL = `${BASE_URL}/Permit/LocatorResults`;

// How many consecutive "not found" permit numbers before we stop scanning
const MAX_CONSECUTIVE_MISSES = 30;

// Permit numbers per batch (we open one browser page and process all)
const MAX_PERMITS_PER_RUN = 300;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function parsePermitNum(s) {
  if (!s || typeof s !== 'string') return null;
  const m = s.match(/^PR(\d{4})(\d{7})$/);
  if (!m) return null;
  return { year: parseInt(m[1], 10), seq: parseInt(m[2], 10) };
}

function formatPermitNum(year, seq) {
  return `PR${year}${String(seq).padStart(7, '0')}`;
}

function nextPermitNum(current) {
  const parsed = parsePermitNum(current);
  if (!parsed) return null;
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  if (parsed.seq + 1 > 9999999) {
    // Roll over to next year
    return formatPermitNum(parsed.year + 1, 1);
  }
  return formatPermitNum(parsed.year, parsed.seq + 1);
}

// Use the autocomplete endpoint (works without browser) to check if a permit exists.
// Returns true/false. This is a lightweight pre-filter before loading via Puppeteer.
async function permitExists(axios, formToken, cookieStr, permitNum) {
  try {
    const { data } = await axios.post(
      PERMIT_SEARCH_URL,
      new URLSearchParams({
        term: permitNum,
        returnInactiveAddresses: 'false',
        module: '',
        appealPeriodStatusesOnly: 'false',
        isIntermentSearch: 'false',
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          '__RequestVerificationToken': formToken,
          'Cookie': cookieStr,
          'Referer': LOCATOR_PAGE,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      }
    );
    // Response is an array of strings. If it contains the permit number, it exists.
    if (Array.isArray(data)) {
      return data.some(item => typeof item === 'string' && item.includes(permitNum));
    }
    if (typeof data === 'string') {
      return data.includes(permitNum) && !data.includes('[There are no matches]');
    }
    return false;
  } catch {
    return false;
  }
}

// Get permit details via page.evaluate() — runs jQuery AJAX from inside the browser.
// Returns the LocatorResults response: {View: "<html>...", LocationMarkers: [...]}
// Returns null if no results.
async function getPermitDetailsFromBrowser(page, permitNum) {
  try {
    const result = await page.evaluate(async (pNum, locatorUrl) => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(null), 12000);

        // Temporarily capture the showLocatorResults callback
        const orig = window.showLocatorResults;
        window.showLocatorResults = function(data) {
          clearTimeout(timeout);
          window.showLocatorResults = orig;
          resolve(data || null);
        };

        // Call the portal's own runLocatorSearch function
        try {
          // Directly call $.ajax to match the portal's own behavior
          window.jQuery.ajax({
            type: 'GET',
            url: locatorUrl,
            data: {
              searchValue: pNum,
              category: '',
              appealPeriodStatusesOnly: 'False',
              isInspectionSearch: 'True',
              pageNumber: '0',
              jurisdictionFilter: '',
            },
          }).done(function(data) {
            clearTimeout(timeout);
            window.showLocatorResults = orig;
            // showLocatorResults would have been called internally, but we intercept here
            resolve(data || null);
          }).fail(function() {
            clearTimeout(timeout);
            window.showLocatorResults = orig;
            resolve(null);
          });
        } catch (e) {
          clearTimeout(timeout);
          window.showLocatorResults = orig;
          resolve(null);
        }
      });
    }, permitNum, LOCATOR_RESULTS_URL);

    return result;
  } catch (err) {
    console.warn(`  [Cherokee] page.evaluate error for ${permitNum}: ${err.message}`);
    return null;
  }
}

function parsePermitsFromHtml(html, permitNum) {
  if (!html || typeof html !== 'string' || html.trim().length === 0) return [];

  // Use cheerio for HTML parsing
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);

  const permits = [];

  // CityView LocatorResults HTML typically shows a table or list of permits.
  // We try multiple common patterns.

  // Pattern 1: Table rows with permit info
  $('table tbody tr, .cv-locator-result, .cv-result-row, [data-cy*="result"]').each((i, el) => {
    const row = $(el);
    const text = row.text().trim();
    if (!text) return;

    // Try to extract fields from cells
    const cells = row.find('td, .cv-result-cell');
    let address = null, permitType = null, dateFiled = null, status = null;

    cells.each((j, cell) => {
      const cellText = $(cell).text().trim();
      // Look for date pattern MM/DD/YYYY or YYYY-MM-DD
      if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(cellText) && !dateFiled) {
        dateFiled = cellText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)?.[0];
        if (dateFiled) {
          const parts = dateFiled.match(/(\d+)\/(\d+)\/(\d+)/);
          if (parts) dateFiled = `${parts[3]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
      } else if (!address && cellText.match(/\d+\s+\w+/)) {
        address = cellText;
      } else if (!permitType && cellText && cellText.length > 3 && cellText.length < 80 && !cellText.includes('PR2025') && !cellText.includes('PR2026')) {
        permitType = cellText;
      }
    });

    if (address || permitType) {
      permits.push({ address, permitType, dateFiled, status });
    }
  });

  // Pattern 2: Definition lists or key-value pairs
  if (permits.length === 0) {
    const fields = {};
    $('dt, .cv-label, .label, th').each((i, el) => {
      const label = $(el).text().trim().toLowerCase();
      const value = $(el).next('dd, .cv-value, .value, td').text().trim();
      if (label.includes('address')) fields.address = value;
      if (label.includes('type') || label.includes('permit')) fields.permitType = value;
      if (label.includes('date') || label.includes('filed') || label.includes('issued')) {
        const m = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (m) fields.dateFiled = `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
        else if (/\d{4}-\d{2}-\d{2}/.test(value)) fields.dateFiled = value.match(/\d{4}-\d{2}-\d{2}/)[0];
      }
      if (label.includes('status')) fields.status = value;
      if (label.includes('contractor')) fields.contractorName = value;
      if (label.includes('description')) fields.description = value;
    });

    if (fields.address || fields.permitType || fields.dateFiled) {
      permits.push(fields);
    }
  }

  // Pattern 3: Flat text extraction if all else fails
  if (permits.length === 0 && html.length > 100) {
    // Log raw HTML for diagnostics (first permit only)
    console.log(`  [Cherokee] Raw HTML for ${permitNum} (first 500 chars):`);
    console.log('  ' + html.replace(/\s+/g, ' ').substring(0, 500));
  }

  return permits;
}

async function fetchNewPermits(lastPermitNum) {
  const defaultStart = 'PR20250000000';
  const startFrom = lastPermitNum || defaultStart;
  console.log(`[Cherokee County] Starting from permit ${startFrom}...`);

  let puppeteer;
  let browser;
  let axios;

  try {
    puppeteer = require('puppeteer');
    axios = require('axios');
  } catch (err) {
    console.error(`  [Cherokee] Missing required packages: ${err.message}`);
    console.error(`  [Cherokee] Skipping — install puppeteer to enable this scraper`);
    return { permits: [], maxPermitNum: lastPermitNum };
  }

  try {
    browser = await puppeteer.launch({
      headless: true,
      // Use the Chrome provided by the Apify base image if available,
      // otherwise fall back to puppeteer's own bundled Chrome.
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );

    // Load the InspectionLocator page to establish session
    console.log(`  [Cherokee] Loading InspectionLocator page...`);
    await page.goto(LOCATOR_PAGE, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for jQuery to be available
    await page.waitForFunction(() => typeof window.jQuery !== 'undefined', { timeout: 15000 });

    // Extract cookies and CSRF token for the lightweight autocomplete checks
    const cookies = await page.cookies();
    const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const formToken = await page.$eval(
      'input[name="__RequestVerificationToken"]',
      el => el.value
    ).catch(() => '');

    console.log(`  [Cherokee] Page loaded, session established.`);

    const allPermits = [];
    let currentNum = nextPermitNum(startFrom);
    let consecutiveMisses = 0;
    let checked = 0;
    let maxPermitNum = lastPermitNum || defaultStart;

    while (currentNum && checked < MAX_PERMITS_PER_RUN) {
      checked++;

      // Lightweight check via autocomplete first (saves Puppeteer time for non-existent permits)
      const exists = await permitExists(axios, formToken, cookieStr, currentNum);

      if (!exists) {
        consecutiveMisses++;
        if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES) {
          console.log(`  [Cherokee] ${MAX_CONSECUTIVE_MISSES} consecutive misses at ${currentNum}, stopping scan.`);
          break;
        }
        currentNum = nextPermitNum(currentNum);
        await sleep(50);
        continue;
      }

      consecutiveMisses = 0;
      console.log(`  [Cherokee] Found permit: ${currentNum}`);

      // Get full details via Puppeteer
      const details = await getPermitDetailsFromBrowser(page, currentNum);

      if (details && details.View) {
        const parsed = parsePermitsFromHtml(details.View, currentNum);
        if (parsed.length > 0) {
          const p = parsed[0];
          allPermits.push({
            permit_number: currentNum,
            address:       p.address ?? null,
            zip_code:      null, // will geocode later if needed
            permit_type:   p.permitType ?? null,
            description:   p.description ?? null,
            date_filed:    p.dateFiled ?? null,
            county:        'Cherokee County',
            contractor_name: p.contractorName ?? null,
            raw_data:      { html_preview: details.View.substring(0, 500), ...p },
          });
        } else {
          // No parse — still record the permit with what we have
          console.log(`  [Cherokee] Could not parse HTML for ${currentNum}, recording with minimal data`);
          allPermits.push({
            permit_number: currentNum,
            address:       null,
            zip_code:      null,
            permit_type:   null,
            description:   null,
            date_filed:    null,
            county:        'Cherokee County',
            raw_data:      { html_preview: (details.View || '').substring(0, 500) },
          });
        }
      } else if (details && typeof details === 'string' && details.length > 50) {
        // Fallback: details might be raw HTML string
        const parsed = parsePermitsFromHtml(details, currentNum);
        allPermits.push({
          permit_number: currentNum,
          address:       parsed[0]?.address ?? null,
          zip_code:      null,
          permit_type:   parsed[0]?.permitType ?? null,
          description:   parsed[0]?.description ?? null,
          date_filed:    parsed[0]?.dateFiled ?? null,
          county:        'Cherokee County',
          raw_data:      { html_preview: details.substring(0, 500) },
        });
      } else {
        // Permit exists per autocomplete but LocatorResults returned nothing useful
        console.log(`  [Cherokee] Permit ${currentNum} confirmed via autocomplete but LocatorResults returned empty. Recording stub.`);
        allPermits.push({
          permit_number: currentNum,
          address:       null,
          zip_code:      null,
          permit_type:   null,
          description:   null,
          date_filed:    null,
          county:        'Cherokee County',
          raw_data:      {},
        });
      }

      maxPermitNum = currentNum;
      currentNum = nextPermitNum(currentNum);
      await sleep(300); // be polite
    }

    console.log(`[Cherokee County] Found ${allPermits.length} new permits (checked ${checked} numbers).`);
    return { permits: allPermits, maxPermitNum };

  } catch (err) {
    console.error(`  ❌ [Cherokee County] Error: ${err.message}`);
    return { permits: [], maxPermitNum: lastPermitNum };
  } finally {
    if (browser) {
      try { await browser.close(); } catch {}
    }
  }
}

module.exports = { fetchNewPermits };

if (require.main === module) {
  // Test: scan from PR20260000900 (near-recent permits)
  fetchNewPermits('PR20260000880')
    .then(({ permits, maxPermitNum }) => {
      console.log('\n--- RESULTS ---');
      console.log(`Total permits: ${permits.length}`);
      console.log(`New max permit num: ${maxPermitNum}`);
      if (permits.length > 0) {
        console.log('\n--- SAMPLE PERMIT ---');
        console.log(JSON.stringify(permits[0], null, 2));
      }
    })
    .catch(console.error);
}
