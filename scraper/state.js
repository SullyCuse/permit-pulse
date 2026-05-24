const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', 'state.json');

async function getStateValue(key, defaultValue) {
  if (process.env.APIFY_IS_AT_HOME) {
    const { Actor } = require('apify');
    const val = await Actor.getValue(key);
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
    const { Actor } = require('apify');
    await Actor.setValue(key, value);
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

module.exports = {
  getLastItemNumber, setLastItemNumber,
  getGwinnettLastDate, setGwinnettLastDate,
  getForsythLastTimestamp, setForsythLastTimestamp,
};
