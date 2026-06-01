require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://evolvepublic.infovisionsoftware.com/BryanCounty/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Axios instance with manual cookie tracking
function makeSession() {
  const cookies = {};

  const instance = axios.create({
    baseURL: BASE_URL,
    headers: { 'User-Agent': UA },
    maxRedirects: 0,
    validateStatus: s => s < 400,
  });

  instance.interceptors.response.use(res => {
    const setCookie = res.headers['set-cookie'];
    if (setCookie) {
      for (const c of (Array.isArray(setCookie) ? setCookie : [setCookie])) {
        const [kv] = c.split(';');
        const eqIdx = kv.indexOf('=');
        if (eqIdx > -1) cookies[kv.slice(0, eqIdx).trim()] = kv.slice(eqIdx + 1).trim();
      }
    }
    return res;
  });

  instance.interceptors.request.use(cfg => {
    const cookieStr = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
    if (cookieStr) cfg.headers['Cookie'] = cookieStr;
    return cfg;
  });

  return instance;
}

// Extract all hidden <input> values from HTML
function extractHidden(html) {
  const fields = {};
  for (const m of html.matchAll(/<input[^>]+type="hidden"[^>]+>/gi)) {
    const tag = m[0];
    const name = (tag.match(/name="([^"]+)"/) || [])[1];
    const val  = (tag.match(/value="([^"]*)"/) || [])[1] ?? '';
    if (name) fields[name] = val;
  }
  return fields;
}

// MM/DD/YYYY string for Evolve date inputs
function fmtDate(d) {
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

// Telerik RadDatePicker hidden ClientState value
function pickerState(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return JSON.stringify({
    minDate: null, maxDate: null, enabled: true,
    selectedDate: `${d.getFullYear()}-${mm}-${dd}-0-0-0`,
    isUtcTime: false,
  });
}

// POST form data (handles long ViewState strings safely)
async function postForm(session, fields, timeout = 30000) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(fields)) {
    params.set(k, v ?? '');
  }
  return session.post('', params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Referer': BASE_URL },
    timeout,
  });
}

// Run the 4-step navigation to get the date-range search results page
async function runDateSearch(session, startDate, endDate) {
  const startStr   = fmtDate(startDate);
  const endStr     = fmtDate(endDate);
  const startState = pickerState(startDate);
  const endState   = pickerState(endDate);

  // Step 1: Home page → get session cookie + initial ViewState
  const r1 = await session.get('', { timeout: 30000 });
  const h1 = extractHidden(r1.data);

  // Step 2: Navigate to Permit Search (left-nav menu item 2)
  const r2 = await postForm(session, { ...h1, __EVENTTARGET: 'BL_Menu', __EVENTARGUMENT: '2' });
  const h2 = extractHidden(r2.data);

  // Step 3: Switch search type dropdown to "Date Range"
  const r3 = await postForm(session, {
    ...h2,
    __EVENTTARGET: 'DL_SearchType', __EVENTARGUMENT: '',
    DL_SearchType: 'Date Range',
    TB_SearchText1: '', TB_SearchText2: '',
    TBWE1_ClientState: '', TBWE2_ClientState: '',
  });
  const h3 = extractHidden(r3.data);

  // Step 4: Submit the date range search
  const r4 = await postForm(session, {
    ...h3,
    __EVENTTARGET: '', __EVENTARGUMENT: '',
    DL_SearchType: 'Date Range',
    TB_SearchText1: startStr, TB_SearchText2: endStr,
    TBWE1_ClientState: startState, TBWE2_ClientState: endState,
    BT_Search: 'Search',
  });

  return { html: r4.data, hiddenSearch: extractHidden(r4.data), startStr, endStr, startState, endState };
}

// Parse permit rows from the results listing HTML
function parseListingRows(html) {
  const rows = [];
  // Collect all row indices present in the results grid
  const idxSet = new Set([...html.matchAll(/GV_SearchResults_LBT_ResultsLine1_(\d+)/g)].map(m => parseInt(m[1])));

  for (const idx of [...idxSet].sort((a, b) => a - b)) {
    const line1 = html.match(new RegExp(`LBT_ResultsLine1_${idx}"[^>]*>([^<]+)<`))?.[1]?.trim() ?? '';
    const line2 = html.match(new RegExp(`LBT_ResultsLine2_${idx}"[^>]*>([^<]*)<`))?.[1]?.trim() ?? '';
    const line3 = html.match(new RegExp(`LBT_ResultsLine3_${idx}"[^>]*>([^<]*)<`))?.[1]?.trim() ?? '';

    const statusInParens = line1.match(/\(([^)]+)\)\s*$/)?.[1]?.trim() ?? null;
    const permitNum = line1.replace(/\s*\([^)]+\)\s*$/, '').trim();
    if (!permitNum) continue;

    rows.push({ idx, permitNum, address: line2 || null, contractor: line3 || null, listingStatus: statusInParens });
  }
  return rows;
}

// Parse permit type and issue date from a details page
function parseDetails(html) {
  // Permit type = first contact row that isn't "Applicant" or the header
  let permitType = null;
  let applicantName = null;
  for (const m of html.matchAll(/<tr>\s*<td>([^<]+)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td>\s*<\/tr>/g)) {
    const [, type, name, org] = m.map(s => s.trim());
    if (type === 'Type') continue; // header row
    if (type === 'Applicant') {
      applicantName = name || org || null;
    } else if (type && !permitType) {
      permitType = type;
    }
  }

  // Issue date from Documents section: <td>M/D/YYYY</td><td>Permit</td>
  const dateMatch = html.match(/<td>(\d{1,2}\/\d{1,2}\/\d{4})<\/td><td>Permit<\/td>/);
  let dateFiled = null;
  if (dateMatch) {
    const [mo, dy, yr] = dateMatch[1].split('/');
    dateFiled = `${yr}-${mo.padStart(2, '0')}-${dy.padStart(2, '0')}`;
  }

  // Status field from permit summary table (two-column label/value rows)
  let permitStatus = null;
  const statusMatch = html.match(/<td[^>]*>\s*Status\s*<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
  if (statusMatch) permitStatus = statusMatch[1].trim();

  return { permitType, dateFiled, applicantName, permitStatus };
}

async function fetchNewPermits(lastTimestampMs = 0) {
  const since = lastTimestampMs
    ? new Date(lastTimestampMs).toISOString().split('T')[0]
    : 'beginning';
  console.log(`[Bryan County] Fetching permits since ${since}...`);

  // Search from 3 days before cursor → catches late-added permits
  const startDate = new Date(Math.max(0, lastTimestampMs - 3 * 86400 * 1000));
  const endDate   = new Date();

  const session = makeSession();
  const { html, hiddenSearch, startStr, endStr, startState, endState } = await runDateSearch(session, startDate, endDate);

  const countMatch = html.match(/(\d+) permits listed/);
  const totalInListing = countMatch ? parseInt(countMatch[1]) : 0;
  console.log(`[Bryan County] Found ${totalInListing} permits (${startStr} – ${endStr})`);

  if (totalInListing === 0) {
    return { permits: [], maxTimestamp: lastTimestampMs };
  }

  const rows = parseListingRows(html);
  console.log(`[Bryan County] Parsed ${rows.length} permit rows`);

  const permits = [];
  for (const { idx, permitNum, address, contractor, listingStatus } of rows) {
    try {
      await sleep(250);

      // Reuse search-results ViewState to open this row's Details in-session
      const ctlId = String(idx + 2).padStart(2, '0');
      const r5 = await postForm(session, {
        ...hiddenSearch,
        __EVENTTARGET: `GV_SearchResults$ctl${ctlId}$LBT_ResultsDetails`,
        __EVENTARGUMENT: '',
        DL_SearchType: 'Date Range',
        TB_SearchText1: startStr, TB_SearchText2: endStr,
        TBWE1_ClientState: startState, TBWE2_ClientState: endState,
      });

      const { permitType, dateFiled, applicantName, permitStatus } = parseDetails(r5.data);
      const status = permitStatus ?? listingStatus ?? null;

      permits.push({
        permit_number:   permitNum,
        address:         address ?? null,
        zip_code:        null,
        permit_type:     permitType ?? null,
        description:     null,
        date_filed:      dateFiled ?? null,
        contractor_name: contractor ?? null,
        applicant_name:  applicantName ?? null,
        county:          'Bryan County',
        raw_data:        { source: 'evolve', status },
      });
    } catch (err) {
      console.warn(`  [Bryan County] Details failed for ${permitNum}: ${err.message}`);
      permits.push({
        permit_number:   permitNum,
        address:         address ?? null,
        zip_code:        null,
        permit_type:     null,
        description:     null,
        date_filed:      null,
        contractor_name: contractor ?? null,
        applicant_name:  null,
        county:          'Bryan County',
        raw_data:        { source: 'evolve', status: listingStatus ?? null },
      });
    }
  }

  console.log(`[Bryan County] Processed ${permits.length} permits`);
  return { permits, maxTimestamp: Date.now() };
}

module.exports = { fetchNewPermits };

if (require.main === module) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  fetchNewPermits(thirtyDaysAgo)
    .then(({ permits, maxTimestamp }) => {
      console.log('\n--- SAMPLE PERMIT ---');
      console.log(JSON.stringify(permits[0], null, 2));
      console.log(`\nTotal permits: ${permits.length}`);
      console.log(`Max timestamp: ${new Date(maxTimestamp).toISOString()}`);
    })
    .catch(console.error);
}
