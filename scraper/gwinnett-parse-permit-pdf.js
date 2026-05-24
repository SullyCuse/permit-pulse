require('dotenv').config();
const pdfParse = require('pdf-parse');
const { geocodeAddress } = require('./gwinnett-geocode');

async function extractText(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

// NOTE: pdf-parse extracts Gwinnett's multi-column layout in a scrambled order.
// The column values come out with labels and values swapped/interleaved.
// Observed mappings from raw text vs actual PDF:
//   "PARCEL #BLD2026-XXXXX"  → case number  (appears where PARCEL # label is)
//   "PROJECT:MM/DD/YYYY"     → issued date  (appears where PROJECT label is)
//   "ISSUED ON {digits}"     → parcel number (appears where ISSUED ON label is)
//   "NO. OF UNITS:{name}"    → project name
// Each permit block begins with "ST ADDRESS, CITY:" in the extracted text.

function parseDate(raw) {
  if (!raw) return null;
  const m = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const [, mo, da, yr] = m;
  return `${yr}-${mo.padStart(2, '0')}-${da.padStart(2, '0')}`;
}

async function parsePdfBuffer(buffer) {
  console.log(`Extracting text from Gwinnett PDF (${buffer.length} bytes)...`);
  const text = await extractText(buffer);
  console.log(`Extracted ${text.length} characters`);

  // Split on the label that starts each permit block in the extracted text
  const parts = text.split(/\nST ADDRESS, CITY:/);
  const permits = [];

  // parts[0] is the document header; skip it
  for (const part of parts.slice(1)) {
    try {
      const lines = part.split('\n').map(l => l.trim());
      const nonEmpty = lines.filter(l => l.length > 0);
      const permit = {};

      // Address is the very first line of the block
      permit.address = lines[0]?.trim() || null;

      // Case number: label "PARCEL #" is followed by the case number value in extracted text
      const caseMatch = part.match(/PARCEL #([A-Z]+\d{4}-\d+)/);
      permit.permit_number = caseMatch?.[1] || null;
      if (!permit.permit_number) continue;

      // Issued date: label "PROJECT:" is followed by the date value in extracted text
      const dateMatch = part.match(/PROJECT:(\d{1,2}\/\d{1,2}\/\d{4})/);
      permit.date_filed = parseDate(dateMatch?.[1]);

      // Parcel number: label "ISSUED ON" is followed by the parcel digits in extracted text
      const parcelMatch = part.match(/ISSUED ON([\d\s]+?)(?:\n|$)/);
      permit.parcel_number = parcelMatch?.[1]?.trim() || null;

      // Project name: label "NO. OF UNITS:" is followed by the project name in extracted text
      const projectMatch = part.match(/NO\. OF UNITS:(.*?)(?:\n|$)/);
      permit.project = projectMatch?.[1]?.trim() || null;

      // Subdivision
      const subdivMatch = part.match(/SUBDIVISION:(.*?)(?:\n|$)/);
      permit.subdivision = subdivMatch?.[1]?.trim() || null;

      // Zoning: value appears immediately before "ZONING DISTRICT:" label in extracted text
      const zoningMatch = part.match(/([A-Z][A-Z0-9]*)ZONING DISTRICT:/);
      permit.zoning = zoningMatch?.[1] || null;

      // Estimated cost
      const costMatch = part.match(/\$([\d,]+\.?\d*)/);
      permit.estimated_value = costMatch ? costMatch[1].replace(/,/g, '') : null;

      // Census code (description): last line containing letters before the $ amount line
      const dollarIdx = nonEmpty.findIndex(l => l.startsWith('$'));
      if (dollarIdx > 0) {
        for (let i = dollarIdx - 1; i >= 0; i--) {
          if (/[a-zA-Z]/.test(nonEmpty[i]) && nonEmpty[i].length > 3) {
            permit.description = nonEmpty[i];
            break;
          }
        }
      }

      // Comm/Res classification
      const commResMatch = part.match(/\n(Residential|Commercial|Industrial)\n/);
      permit.comm_res = commResMatch?.[1] || null;

      // Contractor: first non-label line after the $ amount
      if (dollarIdx >= 0 && nonEmpty[dollarIdx + 1]) {
        const next = nonEmpty[dollarIdx + 1];
        if (!next.match(/^(Sewer|USE OF|City Limit|CENSUS CODE|PRINTED)/i)) {
          permit.contractor = next;
        }
      }

      permit.permit_type = permit.description || permit.comm_res || null;
      permit.county = 'Gwinnett';
      permit.zip_code = null;

      permits.push(permit);
    } catch (err) {
      console.error('Error parsing Gwinnett block:', err.message);
    }
  }

  console.log(`Parsed ${permits.length} permit records, geocoding addresses...`);

  for (const permit of permits) {
    if (permit.address) {
      permit.zip_code = await geocodeAddress(permit.address);
    }
  }

  return permits;
}

module.exports = { parsePdfBuffer };

if (require.main === module) {
  const { downloadPdf } = require('./gwinnett-fetch-reports');
  const testUrl = 'https://www.gwinnettcounty.com/documents/d/gwinnett-county/gwinnett-county-building-permits-05042026-05082026-pdf';

  downloadPdf(testUrl)
    .then(buf => parsePdfBuffer(buf))
    .then(permits => {
      console.log('\n--- SAMPLE PERMIT ---');
      console.log(JSON.stringify(permits[0], null, 2));
      console.log('\n--- SECOND PERMIT ---');
      console.log(JSON.stringify(permits[1], null, 2));
      console.log(`\nTotal permits parsed: ${permits.length}`);
    })
    .catch(console.error);
}
