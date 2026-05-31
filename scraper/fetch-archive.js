require('dotenv').config();
const axios = require('axios');

// Hall County publishes permit PDFs to their ArchiveCenter under category AMID=39.
// The archive rotates — only the most recent batch of PDFs is live at any time, and
// item numbers may not be strictly sequential across CMS migrations. We scrape the
// listing page directly to find current item IDs rather than scanning forward blindly.

const ARCHIVE_LISTING_URL = 'https://www.hallcounty.org/Archive.aspx?AMID=39';
const BASE_PDF_URL = 'https://www.hallcounty.org/ArchiveCenter/ViewFile/Item';

/**
 * Scrape the Archive listing page and return all current ADID values as integers.
 */
async function fetchListingAdids() {
  const response = await axios.get(ARCHIVE_LISTING_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 15000,
  });

  const html = response.data;
  const matches = [...html.matchAll(/Archive\.aspx\?ADID=(\d+)/g)];
  const adids = [...new Set(matches.map(m => parseInt(m[1], 10)))].sort((a, b) => a - b);
  return adids;
}

/**
 * Return PDFs from the listing page that haven't been processed yet.
 * "New" means item number > lastKnownItem, OR any item on the listing page
 * if the listing's max item < lastKnownItem (catches CMS resets/re-indexing).
 */
async function fetchLatestPdfUrls(lastKnownItem = 0) {
  console.log(`[Hall County] Scraping archive listing page for current PDFs...`);

  let adids;
  try {
    adids = await fetchListingAdids();
  } catch (err) {
    console.error(`  ❌ [Hall County] Failed to fetch archive listing: ${err.message}`);
    return [];
  }

  if (adids.length === 0) {
    console.log(`  No items found on listing page.`);
    return [];
  }

  const maxListed = Math.max(...adids);
  console.log(`  Found ${adids.length} items on listing page: [${adids.join(', ')}] (max: ${maxListed})`);

  // If the archive has been re-indexed (max listed < our cursor), process everything listed.
  // Otherwise, only process items we haven't seen yet.
  const isReindex = maxListed < lastKnownItem;
  if (isReindex) {
    console.log(`  ⚠️  Archive re-index detected (max listed ${maxListed} < cursor ${lastKnownItem}) — processing all listed items.`);
  }

  const toProcess = isReindex
    ? adids
    : adids.filter(id => id > lastKnownItem);

  if (toProcess.length === 0) {
    console.log(`  No new items since cursor ${lastKnownItem}.`);
    return [];
  }

  console.log(`  Processing ${toProcess.length} item(s): [${toProcess.join(', ')}]`);
  return toProcess.map(id => ({
    exists: true,
    url: `${BASE_PDF_URL}/${id}`,
    itemNumber: id,
  }));
}

module.exports = { fetchLatestPdfUrls };

if (require.main === module) {
  fetchLatestPdfUrls(0)
    .then(pdfs => {
      console.log('\nFound PDFs:');
      pdfs.forEach(p => console.log(`  Item ${p.itemNumber}: ${p.url}`));
    })
    .catch(console.error);
}
