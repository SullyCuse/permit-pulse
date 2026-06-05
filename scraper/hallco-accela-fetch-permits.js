require('dotenv').config();

// City of Gainesville & City of Oakwood — Accela Citizen Access portal
// Agency: HALLCO at aca-prod.accela.com/HALLCO
// Modules: Gainesville, Oakwood (same portal, separate search modules)
//
// Portal is AngularJS-driven — requires Puppeteer to interact with the search form.
// Results page shows all data inline (date, permit#, type, description, project name,
// status, address) — no detail-page clicks needed.

const BASE_URL = 'https://aca-prod.accela.com/HALLCO/Cap/CapHome.aspx';

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
// "O - Residential New Construction Permit" → "Residential New Construction Permit"
function cleanPermitType(raw) {
  if (!raw) return null;
  return raw.replace(/^[A-Z]\s*-\s*/, '').trim() || null;
}

// "1411 SW BROWNS BRIDGE ROAD SW, GAINESVILLE GA 30501" → { address: "1411 SW BROWNS BRIDGE ROAD SW, Gainesville", zip: "30501" }
// "621 WASHINGTON STREET SW, A3, GAINESVILLE GA 30501" → { address: "621 WASHINGTON STREET SW, A3, Gainesville", zip: "30501" }
function parseAddressCell(raw) {
  if (!raw) return { address: null, zip: null };
  const zipMatch = raw.match(/\bGA\s+(\d{5})\s*$/i);
  const zip = zipMatch ? zipMatch[1] : null;
  const parts = raw.split(',').map(s => s.trim());
  // Last part is "CITY GA ZIP" — extract city name before " GA "
  const cityStateZip = parts[parts.length - 1]; // e.g. "GAINESVILLE GA 30501"
  const cityMatch = cityStateZip.match(/^(.+?)\s+GA\s+\d{5}/i);
  const city = cityMatch ? cityMatch[1].trim() : null;
  // Street is everything before the last comma segment
  const streetParts = parts.length >= 2 ? parts.slice(0, -1) : parts;
  let address = streetParts.join(', ').trim() || null;
  // Append city so the full address is stored (consistent with Bryan County)
  if (address && city) address = `${address}, ${city}`;
  return { address, zip };
}

// Parse all result rows from the search results page
// Returns array of { date, permitNumber, recordType, description, projectName, status, address, zip }
function parseResultRows(rows) {
  const results = [];
  for (const cells of rows) {
    if (cells.length < 2) continue;
    const date        = parseMdyDate(cells[0]) ?? null;
    const permitNum   = cells[1]?.trim() || null;
    const recordType  = cells[2]?.trim() || null;
    const description = cells[3]?.trim() || null;
    const projectName = cells[4]?.trim() || null;

    // The last cell is the address if it contains a GA ZIP pattern
    const lastCell = cells[cells.length - 1] || '';
    const hasAddress = /GA\s+\d{5}/i.test(lastCell);
    const { address, zip } = hasAddress ? parseAddressCell(lastCell) : { address: null, zip: null };

    // Status may be in cells[6] or cells[5] (varies by row)
    let status = null;
    for (let i = 5; i < cells.length - 1; i++) {
      const val = cells[i]?.trim();
      if (val && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) { // skip date-like cells
        status = val;
        break;
      }
    }

    if (!permitNum) continue;
    results.push({ date, permitNum, recordType, description, projectName, status, address, zip });
  }
  return results;
}

async function fetchModulePermits(module, countyName, startDate, endDate) {
  const startStr = `${String(startDate.getMonth() + 1).padStart(2, '0')}/${String(startDate.getDate()).padStart(2, '0')}/${startDate.getFullYear()}`;
  const endStr   = `${String(endDate.getMonth() + 1).padStart(2, '0')}/${String(endDate.getDate()).padStart(2, '0')}/${endDate.getFullYear()}`;

  console.log(`  [${countyName}] Searching ${startStr} – ${endStr}...`);

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

    const url = `${BASE_URL}?module=${module}&TabName=Home`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Fill start date
    await page.click('#ctl00_PlaceHolderMain_generalSearchForm_txtGSStartDate', { clickCount: 3 });
    await page.type('#ctl00_PlaceHolderMain_generalSearchForm_txtGSStartDate', startStr);

    // Fill end date
    await page.click('#ctl00_PlaceHolderMain_generalSearchForm_txtGSEndDate', { clickCount: 3 });
    await page.type('#ctl00_PlaceHolderMain_generalSearchForm_txtGSEndDate', endStr);

    // Click Search
    await page.click('#ctl00_PlaceHolderMain_btnNewSearch');
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    } catch {
      // Results load in-place; navigation event may not fire
      await new Promise(r => setTimeout(r, 3000));
    }

    // Extract all result rows (each row is an array of non-empty cell text values)
    const rawRows = await page.evaluate(() => {
      return [...document.querySelectorAll('.ACA_TabRow_Odd, .ACA_TabRow_Even')].map(row =>
        [...row.querySelectorAll('td')].map(td => td.innerText.trim()).filter(Boolean)
      );
    });

    console.log(`  [${countyName}] Found ${rawRows.length} result rows`);
    return parseResultRows(rawRows);
  } finally {
    await browser.close();
  }
}

async function fetchNewPermits(module, countyName, lastTimestampMs = 0) {
  const startDate = new Date(Math.max(0, lastTimestampMs - 3 * 86400 * 1000));
  const endDate   = new Date();

  const rows = await fetchModulePermits(module, countyName, startDate, endDate);

  const permits = rows.map(r => ({
    permit_number:   r.permitNum,
    address:         r.address,
    zip_code:        r.zip,
    permit_type:     cleanPermitType(r.recordType),
    description:     r.description,
    date_filed:      r.date,
    contractor_name: r.projectName ?? null,
    applicant_name:  null,
    county:          countyName,
    raw_data:        { source: 'accela', module, status: r.status },
  }));

  console.log(`[${countyName}] Processed ${permits.length} permits`);
  return { permits, maxTimestamp: Date.now() };
}

async function fetchGainesvillePermits(lastTimestampMs = 0) {
  return fetchNewPermits('Gainesville', 'Gainesville', lastTimestampMs);
}

async function fetchOakwoodPermits(lastTimestampMs = 0) {
  return fetchNewPermits('Oakwood', 'Oakwood', lastTimestampMs);
}

module.exports = { fetchGainesvillePermits, fetchOakwoodPermits };

if (require.main === module) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const module_arg = process.argv[2] || 'Gainesville';
  const fn = module_arg === 'Oakwood' ? fetchOakwoodPermits : fetchGainesvillePermits;

  fn(thirtyDaysAgo)
    .then(({ permits, maxTimestamp }) => {
      console.log('\n--- SAMPLE PERMITS ---');
      permits.slice(0, 3).forEach(p => console.log(JSON.stringify(p, null, 2)));
      console.log(`\nTotal: ${permits.length}`);
      console.log(`Max timestamp: ${new Date(maxTimestamp).toISOString()}`);
    })
    .catch(console.error);
}
