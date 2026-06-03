require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://evolvepublic.infovisionsoftware.com/BryanCounty/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Geocoding ─────────────────────────────────────────────────────────────────

const geoMemCache = new Map(); // L1: per-process, keyed by full query string

let _supabase = null;
function getSupabase() {
  if (!_supabase && process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _supabase;
}

// Forward-geocode a bare street address in Bryan County → { zip, city }
// Uses geocode_cache table (L2) to avoid re-billing the same address.
async function geocodeBryanAddress(address) {
  if (!address) return { zip: null, city: null };

  const query = `${address}, Bryan County, GA`;

  if (geoMemCache.has(query)) return geoMemCache.get(query);

  // L2: DB cache
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from('geocode_cache')
      .select('zip_code, city')
      .eq('address', query)
      .maybeSingle();
    if (data !== null) {
      const result = { zip: data.zip_code, city: data.city };
      geoMemCache.set(query, result);
      return result;
    }
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return { zip: null, city: null };

  try {
    const { data } = await axios.get(GEOCODE_URL, {
      params: { address: query, key: apiKey },
      timeout: 5000,
    });

    if (data.status === 'OVER_QUERY_LIMIT') {
      // Transient rate limit — do NOT cache, will retry on next run
      console.warn('  Google Maps API rate limited — zip/city will be null for this run');
      return { zip: null, city: null };
    }

    if (data.status !== 'OK' || !data.results?.length) {
      // Genuine no-result — cache as null so we don't keep calling the API
      const empty = { zip: null, city: null };
      geoMemCache.set(query, empty);
      if (sb) await sb.from('geocode_cache').upsert({ address: query, zip_code: null, city: null }, { onConflict: 'address' });
      return empty;
    }

    const components = data.results[0].address_components;
    const zip  = components.find(c => c.types.includes('postal_code'))?.short_name ?? null;
    const city = components.find(c => c.types.includes('locality'))?.long_name ?? null;

    const result = { zip, city };
    geoMemCache.set(query, result);
    if (sb) await sb.from('geocode_cache').upsert({ address: query, zip_code: zip, city }, { onConflict: 'address' });
    return result;
  } catch (err) {
    console.warn(`  Geocode failed for "${query}": ${err.message}`);
    geoMemCache.set(query, { zip: null, city: null });
    return { zip: null, city: null };
  }
}

// ── Permit type mapping ───────────────────────────────────────────────────────
// Evolve contact roles → human-readable permit type labels

const CONTACT_TYPE_MAP = {
  'Electrical':                    'Electrical',
  'Pool Contractor':               'Pool',
  'Manufactured Home Contractor':  'Manufactured Home',
  'Fire Protection Contractor':    'Fire Protection',
  'Sign Contractor':               'Sign',
  'Zoning Final':                  'Zoning',
  'General Contractor':            'Construction',
  'Site Superintendent':           'Construction',
  'Owner':                         'Owner-Builder',
  'Engineer':                      'Construction',
  'Slab':                          'Construction',
  'Plumbing Contractor':           'Plumbing',
  'Mechanical Contractor':         'Mechanical',
  'Other':                         null,
};

function mapPermitType(contactRole) {
  if (!contactRole) return null;
  return Object.prototype.hasOwnProperty.call(CONTACT_TYPE_MAP, contactRole)
    ? CONTACT_TYPE_MAP[contactRole]
    : contactRole; // pass through any unmapped roles as-is
}

// ── Evolve portal navigation ──────────────────────────────────────────────────

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
  const idxSet = new Set([...html.matchAll(/GV_SearchResults_LBT_ResultsLine1_(\d+)/g)].map(m => parseInt(m[1])));

  for (const idx of [...idxSet].sort((a, b) => a - b)) {
    const line1 = html.match(new RegExp(`LBT_ResultsLine1_${idx}"[^>]*>([^<]+)<`))?.[1]?.trim() ?? '';
    const line2 = html.match(new RegExp(`LBT_ResultsLine2_${idx}"[^>]*>([^<]*)<`))?.[1]?.trim() ?? '';
    const line3 = html.match(new RegExp(`LBT_ResultsLine3_${idx}"[^>]*>([^<]*)<`))?.[1]?.trim() ?? '';

    const permitNum = line1.replace(/\s*\([^)]+\)\s*$/, '').trim();
    if (!permitNum) continue;

    rows.push({ idx, permitNum, address: line2 || null, contractor: line3 || null });
  }
  return rows;
}

// Parse permit type (contact role) and issue date from a details page
function parseDetails(html) {
  let contactRole = null;
  let applicantName = null;
  for (const m of html.matchAll(/<tr>\s*<td>([^<]+)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td>\s*<\/tr>/g)) {
    const [, type, name, org] = m.map(s => s.trim());
    if (type === 'Type') continue;
    if (type === 'Applicant') {
      applicantName = name || org || null;
    } else if (type && !contactRole) {
      contactRole = type;
    }
  }

  // Issue date from Documents section: <td>M/D/YYYY</td><td>Permit</td>
  const dateMatch = html.match(/<td>(\d{1,2}\/\d{1,2}\/\d{4})<\/td><td>Permit<\/td>/);
  let dateFiled = null;
  if (dateMatch) {
    const [mo, dy, yr] = dateMatch[1].split('/');
    dateFiled = `${yr}-${mo.padStart(2, '0')}-${dy.padStart(2, '0')}`;
  }

  return { contactRole, permitType: mapPermitType(contactRole), dateFiled, applicantName };
}

// ── Main export ───────────────────────────────────────────────────────────────

async function fetchNewPermits(lastTimestampMs = 0) {
  const since = lastTimestampMs
    ? new Date(lastTimestampMs).toISOString().split('T')[0]
    : 'beginning';
  console.log(`[Bryan County] Fetching permits since ${since}...`);

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
  let geocoded = 0;

  for (const { idx, permitNum, address, contractor } of rows) {
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

      const { permitType, dateFiled, applicantName } = parseDetails(r5.data);

      // Forward-geocode address for zip + city
      let zip = null;
      let displayAddress = address ?? null;
      if (address) {
        const geo = await geocodeBryanAddress(address);
        if (geo.zip) { zip = geo.zip; geocoded++; }
        if (geo.city && address) displayAddress = `${address}, ${geo.city}`;
      }

      permits.push({
        permit_number:   permitNum,
        address:         displayAddress,
        zip_code:        zip,
        permit_type:     permitType,
        description:     null,
        date_filed:      dateFiled ?? null,
        contractor_name: contractor ?? null,
        applicant_name:  applicantName ?? null,
        county:          'Bryan County',
        raw_data:        { source: 'evolve' },
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
        raw_data:        { source: 'evolve' },
      });
    }
  }

  if (geocoded > 0) console.log(`  Geocoded: ${geocoded}/${rows.length} permits`);
  console.log(`[Bryan County] Processed ${permits.length} permits`);
  return { permits, maxTimestamp: Date.now() };
}

module.exports = { fetchNewPermits };

if (require.main === module) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  fetchNewPermits(thirtyDaysAgo)
    .then(({ permits, maxTimestamp }) => {
      console.log('\n--- SAMPLE PERMITS ---');
      permits.slice(0, 3).forEach(p => console.log(JSON.stringify(p, null, 2)));
      console.log(`\nTotal: ${permits.length}`);
      console.log(`Max timestamp: ${new Date(maxTimestamp).toISOString()}`);
    })
    .catch(console.error);
}
