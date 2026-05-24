require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');

const INDEX_URL = 'https://www.gwinnettcounty.com/government/departments/planning-development/building-services/building-permits-issued';
const REPORT_PATTERN = /gwinnett-county-(?:building|development)-permits-(\d{8})-(\d{8})/;

// Parse MMDDYYYY → YYYYMMDD for chronological comparison
function parseUrlDate(mmddyyyy) {
  const mm = mmddyyyy.slice(0, 2);
  const dd = mmddyyyy.slice(2, 4);
  const yyyy = mmddyyyy.slice(4, 8);
  return `${yyyy}${mm}${dd}`;
}

async function fetchReportIndex() {
  const response = await axios.get(INDEX_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 15000,
  });
  return response.data;
}

function extractReportLinks(html) {
  const $ = cheerio.load(html);
  const reports = [];

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(REPORT_PATTERN);
    if (!match) return;

    const startDate = parseUrlDate(match[1]);
    const endDate = parseUrlDate(match[2]);
    const fullUrl = href.startsWith('http') ? href : `https://www.gwinnettcounty.com${href}`;

    reports.push({ url: fullUrl, startDate, endDate, slug: match[0] });
  });

  // Deduplicate by slug (same report may appear multiple times on page)
  const seen = new Set();
  return reports.filter(r => {
    if (seen.has(r.slug)) return false;
    seen.add(r.slug);
    return true;
  });
}

async function fetchNewReportUrls(lastProcessedDate = '00000000') {
  console.log(`Checking for Gwinnett reports after ${lastProcessedDate}...`);

  const html = await fetchReportIndex();
  const all = extractReportLinks(html);

  const newReports = all
    .filter(r => r.startDate > lastProcessedDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  console.log(`Found ${all.length} total reports, ${newReports.length} new`);
  newReports.forEach(r => console.log(`  → ${r.startDate}–${r.endDate}: ${r.url}`));

  return newReports;
}

// Attempt to resolve the actual PDF binary from Gwinnett's Granicus CMS.
// The page-level URL serves a JS viewer; appending /download or using
// the Accept: application/pdf header retrieves the raw file.
async function downloadPdf(pageUrl) {
  const candidates = [
    pageUrl.replace(/\/?$/, '/download'),
    pageUrl,
  ];

  for (const url of candidates) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/pdf,*/*',
        },
        timeout: 30000,
        maxRedirects: 10,
      });

      const contentType = response.headers['content-type'] || '';
      const buf = Buffer.from(response.data);

      if (contentType.includes('pdf') || buf.slice(0, 4).toString() === '%PDF') {
        console.log(`  Downloaded ${buf.length} bytes from ${url}`);
        return buf;
      }
    } catch {
      // try next candidate
    }
  }

  throw new Error(`Could not download PDF from ${pageUrl}`);
}

module.exports = { fetchNewReportUrls, downloadPdf };

if (require.main === module) {
  fetchNewReportUrls().catch(console.error);
}
