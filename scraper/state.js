const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', 'state.json');

// ── Apify (production on Apify platform) ──────────────────────────────────────
let _apifyStore = null;
async function getApifyStore() {
  if (!_apifyStore) {
    const { Actor } = require('apify');
    _apifyStore = await Actor.openKeyValueStore('permit-pulse-state');
  }
  return _apifyStore;
}

// ── Supabase (GitHub Actions / any non-Apify environment with SUPABASE_URL) ───
let _supabase = null;
function getSupabaseClient() {
  if (!_supabase) {
    const { createClient } = require('@supabase/supabase-js');
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _supabase;
}

async function getStateValue(key, defaultValue) {
  if (process.env.APIFY_IS_AT_HOME) {
    const store = await getApifyStore();
    const val = await store.getValue(key);
    return val !== null ? val : defaultValue;
  }
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
    const sb = getSupabaseClient();
    const { data, error } = await sb.from('scraper_state').select('value').eq('key', key).maybeSingle();
    if (error) console.error(`[state] Error reading ${key}:`, error.message);
    return data !== null ? data.value : defaultValue;
  }
  // Local file fallback (dev only)
  try {
    const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return data[key] !== undefined ? data[key] : defaultValue;
  } catch {
    return defaultValue;
  }
}

async function setStateValue(key, value) {
  if (process.env.APIFY_IS_AT_HOME) {
    const store = await getApifyStore();
    await store.setValue(key, value);
    return;
  }
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
    const sb = getSupabaseClient();
    await sb.from('scraper_state').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    return;
  }
  // Local file fallback (dev only)
  let data = {};
  try { data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch {}
  data[key] = value;
  fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2));
}

// Hall County — item number cursor
async function getLastItemNumber() {
  return getStateValue('last_item_number', 1416);
}
async function setLastItemNumber(n) {
  return setStateValue('last_item_number', n);
}

// Gwinnett County — last processed report start date (YYYYMMDD)
async function getGwinnettLastDate() {
  return getStateValue('gwinnett_last_report_date', '00000000');
}
async function setGwinnettLastDate(yyyymmdd) {
  return setStateValue('gwinnett_last_report_date', yyyymmdd);
}

// Forsyth County — last processed IssueDate as Unix ms timestamp
async function getForsythLastTimestamp() {
  return getStateValue('forsyth_last_timestamp', 1751328000000); // default: 2025-07-31
}
async function setForsythLastTimestamp(ms) {
  return setStateValue('forsyth_last_timestamp', ms);
}

// Savannah — last processed IssuedDate_DATE as Unix ms timestamp
async function getSavannahLastTimestamp() {
  return getStateValue('savannah_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setSavannahLastTimestamp(ms) {
  return setStateValue('savannah_last_timestamp', ms);
}

// Alpharetta — last processed DATE_ENTERED as Unix ms timestamp
async function getAlpharettaLastTimestamp() {
  return getStateValue('alpharetta_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setAlpharettaLastTimestamp(ms) {
  return setStateValue('alpharetta_last_timestamp', ms);
}

// Bryan County — last processed LASTUPDATE as Unix ms timestamp
async function getBryanLastTimestamp() {
  return getStateValue('bryan_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setBryanLastTimestamp(ms) {
  return setStateValue('bryan_last_timestamp', ms);
}

// DeKalb County — last processed issuedDateTime as Unix ms timestamp
async function getDeKalbLastTimestamp() {
  return getStateValue('dekalb_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setDeKalbLastTimestamp(ms) {
  return setStateValue('dekalb_last_timestamp', ms);
}

// Augusta — last processed DATE_ISSUE as Unix ms timestamp
async function getAugustaLastTimestamp() {
  return getStateValue('augusta_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setAugustaLastTimestamp(ms) {
  return setStateValue('augusta_last_timestamp', ms);
}

// Johns Creek — last processed ISSUE_DATE as Unix ms timestamp
async function getJohnsCreekLastTimestamp() {
  return getStateValue('johnscreek_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setJohnsCreekLastTimestamp(ms) {
  return setStateValue('johnscreek_last_timestamp', ms);
}

// City of Atlanta — last processed OrigOpened as Unix ms timestamp
async function getAtlantaLastTimestamp() {
  return getStateValue('atlanta_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setAtlantaLastTimestamp(ms) {
  return setStateValue('atlanta_last_timestamp', ms);
}

// Sandy Springs — last processed dateSubmitted as Unix ms timestamp
async function getSandySpringsLastTimestamp() {
  return getStateValue('sandysprings_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setSandySpringsLastTimestamp(ms) {
  return setStateValue('sandysprings_last_timestamp', ms);
}

// Cherokee County — last processed permit number string (legacy CityView cursor, no longer used)
async function getCherokeeLastPermitNum() {
  return getStateValue('cherokee_last_permit_num', 'PR20250000000');
}
async function setCherokeeLastPermitNum(s) {
  return setStateValue('cherokee_last_permit_num', s);
}

// Cherokee County — last processed dateentered as ISO date string (YYYY-MM-DD)
async function getCherokeeLastDate() {
  return getStateValue('cherokee_last_date', '2025-07-01'); // default: 2025-07-01
}
async function setCherokeeLastDate(dateStr) {
  return setStateValue('cherokee_last_date', dateStr);
}

// City of Conyers — last processed permit date as Unix ms timestamp
async function getConyersLastTimestamp() {
  return getStateValue('conyers_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setConyersLastTimestamp(ms) {
  return setStateValue('conyers_last_timestamp', ms);
}

// Smyrna — last processed dateSubmitted as Unix ms timestamp
async function getSmyrnaLastTimestamp() {
  return getStateValue('smyrna_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setSmyrnaLastTimestamp(ms) {
  return setStateValue('smyrna_last_timestamp', ms);
}

// Cartersville — last processed dateSubmitted as Unix ms timestamp
async function getCartersvilleLastTimestamp() {
  return getStateValue('cartersville_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setCartersvilleLastTimestamp(ms) {
  return setStateValue('cartersville_last_timestamp', ms);
}

// Effingham County — last processed dateSubmitted as Unix ms timestamp
async function getEffinghamLastTimestamp() {
  return getStateValue('effingham_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setEffinghamLastTimestamp(ms) {
  return setStateValue('effingham_last_timestamp', ms);
}

// Austell — last processed dateSubmitted as Unix ms timestamp
async function getAustellLastTimestamp() {
  return getStateValue('austell_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setAustellLastTimestamp(ms) {
  return setStateValue('austell_last_timestamp', ms);
}

// Camden County — last processed SubmittedOn as Unix ms timestamp
async function getCamdenLastTimestamp() {
  return getStateValue('camden_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setCamdenLastTimestamp(ms) {
  return setStateValue('camden_last_timestamp', ms);
}

// Franklin County — last processed SubmittedOn as Unix ms timestamp
async function getFranklinCountyLastTimestamp() {
  return getStateValue('franklincounty_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setFranklinCountyLastTimestamp(ms) {
  return setStateValue('franklincounty_last_timestamp', ms);
}

// Bainbridge — last processed SubmittedOn as Unix ms timestamp
async function getBainbridgeLastTimestamp() {
  return getStateValue('bainbridge_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setBainbridgeLastTimestamp(ms) {
  return setStateValue('bainbridge_last_timestamp', ms);
}

// City of Gainesville (HALLCO Accela) — last processed permit date as Unix ms timestamp
async function getGainesvilleLastTimestamp() {
  return getStateValue('gainesville_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setGainesvilleLastTimestamp(ms) {
  return setStateValue('gainesville_last_timestamp', ms);
}

// City of Oakwood (HALLCO Accela) — last processed permit date as Unix ms timestamp
async function getOakwoodLastTimestamp() {
  return getStateValue('oakwood_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setOakwoodLastTimestamp(ms) {
  return setStateValue('oakwood_last_timestamp', ms);
}

// Fayette County (SagesGov) — last processed submission date as Unix ms timestamp
async function getFayetteLastTimestamp() {
  return getStateValue('fayette_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setFayetteLastTimestamp(ms) {
  return setStateValue('fayette_last_timestamp', ms);
}

// Henry County (SagesGov) — last processed submission date as Unix ms timestamp
async function getHenryLastTimestamp() {
  return getStateValue('henry_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setHenryLastTimestamp(ms) {
  return setStateValue('henry_last_timestamp', ms);
}

// Marietta (SagesGov) — last processed submission date as Unix ms timestamp
async function getMariettaLastTimestamp() {
  return getStateValue('marietta_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setMariettaLastTimestamp(ms) {
  return setStateValue('marietta_last_timestamp', ms);
}

// Digest cooldown — last time digest email was sent (Unix ms)
async function getLastDigestSentMs() {
  return getStateValue('last_digest_sent_ms', 0);
}
async function setLastDigestSentMs(ms) {
  return setStateValue('last_digest_sent_ms', ms);
}

module.exports = {
  getLastItemNumber, setLastItemNumber,
  getGwinnettLastDate, setGwinnettLastDate,
  getForsythLastTimestamp, setForsythLastTimestamp,
  getSavannahLastTimestamp, setSavannahLastTimestamp,
  getAlpharettaLastTimestamp, setAlpharettaLastTimestamp,
  getBryanLastTimestamp, setBryanLastTimestamp,
  getDeKalbLastTimestamp, setDeKalbLastTimestamp,
  getAugustaLastTimestamp, setAugustaLastTimestamp,
  getJohnsCreekLastTimestamp, setJohnsCreekLastTimestamp,
  getAtlantaLastTimestamp, setAtlantaLastTimestamp,
  getSandySpringsLastTimestamp, setSandySpringsLastTimestamp,
  getCherokeeLastPermitNum, setCherokeeLastPermitNum,
  getCherokeeLastDate, setCherokeeLastDate,
  getConyersLastTimestamp, setConyersLastTimestamp,
  getSmyrnaLastTimestamp, setSmyrnaLastTimestamp,
  getCartersvilleLastTimestamp, setCartersvilleLastTimestamp,
  getEffinghamLastTimestamp, setEffinghamLastTimestamp,
  getAustellLastTimestamp, setAustellLastTimestamp,
  getCamdenLastTimestamp, setCamdenLastTimestamp,
  getFranklinCountyLastTimestamp, setFranklinCountyLastTimestamp,
  getBainbridgeLastTimestamp, setBainbridgeLastTimestamp,
  getGainesvilleLastTimestamp, setGainesvilleLastTimestamp,
  getOakwoodLastTimestamp, setOakwoodLastTimestamp,
  getFayetteLastTimestamp, setFayetteLastTimestamp,
  getHenryLastTimestamp, setHenryLastTimestamp,
  getMariettaLastTimestamp, setMariettaLastTimestamp,
  getLastDigestSentMs, setLastDigestSentMs,
};
