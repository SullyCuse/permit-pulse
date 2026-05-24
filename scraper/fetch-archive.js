require('dotenv').config();
const axios = require('axios');

const BASE_PDF_URL = 'https://www.hallcounty.org/ArchiveCenter/ViewFile/Item';

// Last known item number from our research (state.js overrides this at runtime)
const LAST_KNOWN_ITEM = 1416;
const CHECK_AHEAD = 10; // Check 10 item numbers ahead

async function checkPdfExists(itemNumber) {
  const url = `${BASE_PDF_URL}/${itemNumber}`;
  try {
    const response = await axios.head(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000,
      maxRedirects: 5
    });
    return { 
      exists: response.status === 200, 
      url, 
      itemNumber,
      contentType: response.headers['content-type'] || ''
    };
  } catch (err) {
    return { exists: false, url, itemNumber };
  }
}

async function fetchLatestPdfUrls(lastKnownItem = LAST_KNOWN_ITEM) {
  console.log(`Checking for new permit PDFs after item #${lastKnownItem}...`);
  const newPdfs = [];

  for (let i = lastKnownItem + 1; i <= lastKnownItem + CHECK_AHEAD; i++) {
    process.stdout.write(`  Checking item ${i}... `);
    const result = await checkPdfExists(i);
    if (result.exists) {
      console.log(`✅ Found!`);
      newPdfs.push(result);
    } else {
      console.log(`✗ Not found`);
    }
  }

  console.log(`\nFound ${newPdfs.length} accessible permit PDFs`);
  newPdfs.forEach(p => console.log(`  → ${p.url}`));
  return newPdfs;
}

module.exports = { fetchLatestPdfUrls };

if (require.main === module) {
  fetchLatestPdfUrls().catch(console.error);
}