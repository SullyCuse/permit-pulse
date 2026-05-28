const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', 'state.json');

// Named store so state persists across Apify runs (default store is per-run)
let _apifyStore = null;
async function getApifyStore() {
  if (!_apifyStore) {
    const { Actor } = require('apify');
    _apifyStore = await Actor.openKeyValueStore('permit-pulse-state');
  }
  return _apifyStore;
}

async function getStateValue(key, defaultValue) {
  if (process.env.APIFY_IS_AT_HOME) {
    const store = await getApifyStore();
    const val = await store.getValue(key);
    return val !== null ? val : defaultValue;
  }
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

// Johns Creek — last processed ISSUE_DATE as Unix ms timestamp
async function getJohnsCreekLastTimestamp() {
  return getStateValue('johnscreek_last_timestamp', 1751328000000); // default: 2025-07-01
}
async function setJohnsCreekLastTimestamp(ms) {
  return setStateValue('johnscreek_last_timestamp', ms);
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
  getJohnsCreekLastTimestamp, setJohnsCreekLastTimestamp,
  getLastDigestSentMs, setLastDigestSentMs,
};
