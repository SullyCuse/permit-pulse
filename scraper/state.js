const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', 'state.json');
const STATE_KEY = 'last_item_number';
const DEFAULT_LAST_ITEM = 1416;

async function getLastItemNumber() {
  if (process.env.APIFY_IS_AT_HOME) {
    const { Actor } = require('apify');
    const val = await Actor.getValue(STATE_KEY);
    return val !== null ? val : DEFAULT_LAST_ITEM;
  }
  try {
    const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return data[STATE_KEY] !== undefined ? data[STATE_KEY] : DEFAULT_LAST_ITEM;
  } catch {
    return DEFAULT_LAST_ITEM;
  }
}

async function setLastItemNumber(n) {
  if (process.env.APIFY_IS_AT_HOME) {
    const { Actor } = require('apify');
    await Actor.setValue(STATE_KEY, n);
    return;
  }
  let data = {};
  try { data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch {}
  data[STATE_KEY] = n;
  fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2));
}

module.exports = { getLastItemNumber, setLastItemNumber };
