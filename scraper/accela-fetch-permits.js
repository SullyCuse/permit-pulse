require('dotenv').config();

// Accela Citizen Access scrapers — Coweta County.
//
// Accela ACA (AngularJS SPA) — Puppeteer required.
// Same selector pattern as HALLCO (hallco-accela-fetch-permits.js):
//   Date fields: #ctl00_PlaceHolderMain_generalSearchForm_txtGSStartDate / txtGSEndDate
//   Search:      #ctl00_PlaceHolderMain_btnNewSearch
//   Results:     .ACA_TabRow_Odd, .ACA_TabRow_Even
//
// Coweta County: aca-prod.accela.com/COWETA, module=Building
//
// NOTE: Cobb County (cobbca.cobbcounty.gov) was attempted but requires login —
// redirects to Login.aspx when accessing CapHome.aspx without authentication.

const AGENCIES = {
  coweta: {
    baseUrl: 'https://aca-prod.accela.com/COWETA/Cap/CapHome.aspx',
    module:  'Building',
    county:  'Coweta County',
  },
};

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

// MM/DD/YYYY → YYYY-MM-DD
function parseMdyDate(s) {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

// "G - Commercial Sign Permit" → "Commercial Sign Permit"
function cleanPermitType(raw) {
  if (!raw) return null;
  return raw.replace(/^[A-Z]\s*-\s*/, '').trim() || null;
}

// "1411 SW BROWNS BRIDGE RD, ACWORTH GA 30101" → { address, zip }
function parseAddressCell(raw) {
  if (!raw) return { address: null, zip: null };
  const zipMatch = raw.match(/\bGA\s+(\d{5})\s*$/i);
  const zip = zipMatch ? zipMatch[1] : null;
  const parts = raw.split(',').map(s => s.trim());
  const cityStateZip = parts[parts.length - 1];
  const cityMatch = cityStateZip.match(/^(.+?)\s+GA\s+\d{5}/i);
  const city = cityMatch ? cityMatch[1].trim() : null;
  const streetParts = parts.length >= 2 ? parts.slice(0, -1) : parts;
  let address = streetParts.join(', ').trim() || null;
  if (address && city) address = `${address}, ${city}`;
  return { address, zip };
}

function parseResultRows(rows) {
  const results = [];
  for (const cells of rows) {
    if (cells.length < 2) continue;
    const date        = parseMdyDate(cells[0]) ?? null;
    const permitNum   = cells[1]?.trim() || null;
    const recordType  = cells[2]?.trim() || null;
    const description = cells[3]?.trim() || null;
    const projectName = cells[4]?.trim() || null;

    const lastCell = cells[cells.length - 1] || '';
    const hasAddress = /GA\s+\d{5}/i.test(lastCell);
    const { address, zip } = hasAddress ? parseAddressCell(lastCell) : { address: null, zip: null };

    let status = null;
    for (let i = 5; i < cells.length - 1; i++) {
      const val = cells[i]?.trim();
      if (val && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) {
        status = val;
        break;
      }
    }

    if (!permitNum) continue;
    results.push({ date, permitNum, recordType, description, projectName, status, address, zip });
  }
  return results;
}

async function fetchAgencyPermits(agencyKey, lastTimestampMs = 0) {
  const { baseUrl, module, county } = AGENCIES[agencyKey];
  const startDate = new Date(Math.max(0, lastTimestampMs - 3 * 86400 * 1000));
  const endDate   = new Date();

  const fmt = d => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
  const startStr = fmt(startDate);
  const endStr   = fmt(endDate);

  console.log(`[${county}] Searching ${startStr} – ${endStr}...`);

  let puppeteer;
  try { puppeteer = require('puppeteer'); }
  catch { throw new Error('puppeteer not installed'); }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: findChrome(),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );

    const url = `${baseUrl}?module=${module}&TabName=Home`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.click('#ctl00_PlaceHolderMain_generalSearchForm_txtGSStartDate', { clickCount: 3 });
    await page.type('#ctl00_PlaceHolderMain_generalSearchForm_txtGSStartDate', startStr);

    await page.click('#ctl00_PlaceHolderMain_generalSearchForm_txtGSEndDate', { clickCount: 3 });
    await page.type('#ctl00_PlaceHolderMain_generalSearchForm_txtGSEndDate', endStr);

    await page.click('#ctl00_PlaceHolderMain_btnNewSearch');
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    } catch {
      await new Promise(r => setTimeout(r, 3000));
    }

    const rawRows = await page.evaluate(() => {
      return [...document.querySelectorAll('.ACA_TabRow_Odd, .ACA_TabRow_Even')].map(row =>
        [...row.querySelectorAll('td')].map(td => td.innerText.trim()).filter(Boolean)
      );
    });

    console.log(`  [${county}] Found ${rawRows.length} result rows`);
    const rows = parseResultRows(rawRows);

    const permits = rows.map(r => ({
      permit_number:   r.permitNum,
      address:         r.address,
      zip_code:        r.zip,
      permit_type:     cleanPermitType(r.recordType),
      description:     r.description,
      date_filed:      r.date,
      contractor_name: r.projectName ?? null,
      applicant_name:  null,
      county,
      raw_data:        { source: 'accela', module, status: r.status },
    }));

    console.log(`[${county}] Processed ${permits.length} permits`);
    return { permits, maxTimestamp: Date.now() };
  } finally {
    await browser.close();
  }
}

async function fetchCowetaPermits(lastTimestampMs = 0) {
  return fetchAgencyPermits('coweta', lastTimestampMs);
}

module.exports = { fetchCowetaPermits };

if (require.main === module) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  fetchCowetaPermits(thirtyDaysAgo)
    .then(({ permits, maxTimestamp }) => {
      console.log('\n--- SAMPLE PERMITS ---');
      permits.slice(0, 3).forEach(p => console.log(JSON.stringify(p, null, 2)));
      console.log(`\nTotal: ${permits.length}`);
      console.log(`Max timestamp: ${new Date(maxTimestamp).toISOString()}`);
    })
    .catch(console.error);
}
