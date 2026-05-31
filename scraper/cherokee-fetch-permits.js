require('dotenv').config();

// Cherokee County, GA — CherokeeStatus portal scraper.
//
// The portal at cherokeega.com/cherokeestatus exposes a CSV export endpoint
// (permit-applications-export.php) that accepts a SQL WHERE clause via the
// `thequery` POST parameter. Returns CSV with all permit fields.
//
// Cloudflare blocks plain Node.js HTTP clients (TLS fingerprinting). We use
// Puppeteer to load the portal page (getting real CF cookies + Chrome TLS),
// then call the export endpoint via fetch() from within the browser context.
//
// Cursor: ISO date string (YYYY-MM-DD), e.g. "2025-07-01".

const PORTAL_URL = 'https://cherokeega.com/cherokeestatus/permit-applications.php';
const EXPORT_URL = 'https://cherokeega.com/cherokeestatus/permit-applications-export.php';

function buildQuery(sinceDate) {
  return `SELECT dateentered,permitnumber,status,[description],gncommonid,recordid,type FROM prpermit WHERE 1=1 AND dateentered >= '${sinceDate}' ORDER BY dateentered asc`;
}

// Parse "MM-DD-YYYY" or "MM-D-YYYY" → "YYYY-MM-DD"
function parseCsvDate(s) {
  if (!s) return null;
  const m = s.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

// Extract zip from location block — "...Canton, GA30115\n..." or "GA 30115"
function extractZip(locationBlock) {
  if (!locationBlock) return null;
  const m = locationBlock.match(/GA\s?(\d{5})/);
  return m ? m[1] : null;
}

// First line of location block is the street address
function extractAddress(locationBlock) {
  if (!locationBlock) return null;
  const firstLine = locationBlock.split('\n')[0].trim();
  return firstLine.replace(/\s{2,}/g, ' ').trim() || null;
}

// Find "(Contractor)" role in contacts block
function extractContractor(contactsBlock) {
  if (!contactsBlock) return null;
  for (const line of contactsBlock.split('\n')) {
    const m = line.match(/^(.+?)\s*\(Contractor\)/i);
    if (m) return m[1].trim();
  }
  return null;
}

// Find "(Applicant)" role in contacts block
function extractApplicant(contactsBlock) {
  if (!contactsBlock) return null;
  for (const line of contactsBlock.split('\n')) {
    const m = line.match(/^(.+?)\s*\(Applicant\)/i);
    if (m) return m[1].trim();
  }
  return null;
}

// Parse CSV with quoted multiline fields (RFC 4180 compliant).
function parseCsv(text) {
  const rows = [];
  let pos = 0;

  function parseField() {
    if (pos >= text.length) return '';
    if (text[pos] === '"') {
      pos++;
      let val = '';
      while (pos < text.length) {
        if (text[pos] === '"') {
          if (text[pos + 1] === '"') { val += '"'; pos += 2; }
          else { pos++; break; }
        } else {
          val += text[pos++];
        }
      }
      return val;
    } else {
      let val = '';
      while (pos < text.length && text[pos] !== ',' && text[pos] !== '\n' && text[pos] !== '\r') {
        val += text[pos++];
      }
      return val;
    }
  }

  function parseRow() {
    const fields = [];
    while (pos < text.length) {
      fields.push(parseField());
      if (pos < text.length && text[pos] === ',') { pos++; }
      else { if (text[pos] === '\r') pos++; if (text[pos] === '\n') pos++; break; }
    }
    return fields;
  }

  const headers = parseRow();
  if (!headers.length) return rows;

  while (pos < text.length) {
    const fields = parseRow();
    if (!fields.length || (fields.length === 1 && fields[0] === '')) continue;
    const row = {};
    headers.forEach((h, i) => { row[h.trim()] = fields[i] ?? ''; });
    rows.push(row);
  }
  return rows;
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

async function fetchNewPermits(lastDateStr = '2025-07-01') {
  console.log(`[Cherokee County] Fetching permits since ${lastDateStr}...`);

  let puppeteer;
  try { puppeteer = require('puppeteer'); }
  catch { console.error('  [Cherokee] puppeteer not installed — skipping.'); return { permits: [], maxDateStr: lastDateStr }; }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: findChrome(),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  let csvText;
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

    // Load portal page first so Cloudflare sets its cookies
    console.log('  [Cherokee] Loading portal page...');
    await page.goto(PORTAL_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // POST to export endpoint from within Chrome's context (real TLS + CF cookies)
    console.log('  [Cherokee] Requesting CSV export...');
    const query = buildQuery(lastDateStr);
    csvText = await page.evaluate(async (exportUrl, thequery) => {
      const resp = await fetch(exportUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ thequery }).toString(),
      });
      return resp.text();
    }, EXPORT_URL, query);
  } catch (err) {
    console.error(`  ❌ [Cherokee County] Browser request failed: ${err.message}`);
    await browser.close();
    return { permits: [], maxDateStr: lastDateStr };
  } finally {
    await browser.close();
  }

  if (!csvText || !csvText.includes('Application Number')) {
    console.log('  [Cherokee County] No CSV data in response.');
    return { permits: [], maxDateStr: lastDateStr };
  }

  const rows = parseCsv(csvText);
  console.log(`  [Cherokee County] Parsed ${rows.length} rows from CSV`);
  if (!rows.length) return { permits: [], maxDateStr: lastDateStr };

  const permits = [];
  let maxDate = lastDateStr;

  for (const row of rows) {
    const permitNumber = (row['Application Number'] || '').trim();
    if (!permitNumber) continue;

    const dateFiled   = parseCsvDate(row['Date Entered']);
    const address     = extractAddress(row['Locations']);
    const zip         = extractZip(row['Locations']);
    const contractor  = extractContractor(row['Contacts']);
    const applicant   = extractApplicant(row['Contacts']);

    permits.push({
      permit_number:   permitNumber,
      address,
      zip_code:        zip,
      permit_type:     (row['Type'] || '').trim() || null,
      description:     (row['Description'] || '').trim() || null,
      date_filed:      dateFiled,
      county:          'Cherokee County',
      contractor_name: contractor,
      applicant_name:  applicant,
      raw_data: {
        status:   (row['Status'] || '').trim(),
        contacts: (row['Contacts'] || '').trim(),
        location: (row['Locations'] || '').trim(),
      },
    });

    if (dateFiled && dateFiled > maxDate) maxDate = dateFiled;
  }

  console.log(`[Cherokee County] Found ${permits.length} permits. Max date: ${maxDate}`);
  return { permits, maxDateStr: maxDate };
}

module.exports = { fetchNewPermits };

if (require.main === module) {
  fetchNewPermits('2026-05-28')
    .then(({ permits, maxDateStr }) => {
      console.log('\n--- RESULTS ---');
      console.log(`Total: ${permits.length}, max date: ${maxDateStr}`);
      if (permits.length > 0) {
        console.log('\n--- SAMPLE PERMIT ---');
        console.log(JSON.stringify(permits[0], null, 2));
        console.log('\n--- SECOND SAMPLE ---');
        console.log(JSON.stringify(permits[1], null, 2));
      }
    })
    .catch(console.error);
}
