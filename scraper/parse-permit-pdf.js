require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

async function downloadAndParsePdf(url) {
  console.log(`\nDownloading PDF: ${url}`);

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const buffer = Buffer.from(response.data);
  console.log(`PDF downloaded (${buffer.length} bytes). Extracting text...`);

  const text = await extractText(buffer);
  console.log(`Extracted ${text.length} characters.`);

  const permits = parsePermits(text, url);
  console.log(`Found ${permits.length} permits`);
  return permits;
}

function extractText(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on('pdfParser_dataError', err => reject(err));
    pdfParser.on('pdfParser_dataReady', () => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });

    pdfParser.parseBuffer(buffer);
  });
}

function parsePermits(text, sourceUrl = null) {
  const permits = [];
  const blocks = text.split(/Record No:/);
  blocks.shift();

  for (const block of blocks) {
    try {
      const permit = {};

      // Permit number — first word in block
      const recordMatch = block.match(/^\s*([A-Z0-9\-]+)/);
      permit.permit_number = recordMatch ? recordMatch[1].trim() : null;

      // Parcel number
      const parcelMatch = block.match(/Parcel No:\s*([\d\s]+?)(?=Issued Date:|Type:|Site Address:|$)/);
      permit.parcel_number = parcelMatch ? parcelMatch[1].trim() : null;

      // Issued date
      const dateMatch = block.match(/Issued Date:\s*(\d+\/\d+\/\d+)/);
      if (dateMatch) {
        const parsed = new Date(dateMatch[1].trim());
        permit.date_filed = isNaN(parsed) ? null : parsed.toISOString().split('T')[0];
      }

      // Site address — capture until GA + zip code
      const addressMatch = block.match(/Site Address\s*:\s*(.*?GA\s+\d{5})/);
      permit.address = addressMatch ? addressMatch[1].replace(/\s+/g, ' ').trim() : null;

      // Zip code from address
      const zipMatch = permit.address?.match(/GA\s+(\d{5})/);
      permit.zip_code = zipMatch ? zipMatch[1] : null;

      // Description
      const descMatch = block.match(/Decription:\s*([\s\S]*?)(?=\r\nSite Address|\r\nType\s*:|\r\nEst Vaue|Site Address\s*:|Name:|$)/);
      permit.description = descMatch ? descMatch[1].replace(/\s+/g, ' ').trim() : null;

      // Permit type
      const typeMatch = block.match(/Type\s*:\s*([A-Za-z &\/\-]+?)(?=\r|\n|Sq Ft|Est Vaue|Contractor|$)/);
      permit.permit_type = typeMatch ? typeMatch[1].replace(/\s+/g, ' ').trim() : null;

      // Estimated value
      const valueMatch = block.match(/Est Vaue\s*:\s*\$?([\d,]+)/);
      permit.estimated_value = valueMatch ? valueMatch[1].replace(/,/g, '') : null;

      // Contractor name — between "Contractor -" and next label
      const contractorMatch = block.match(/Contractor\s*-\s*(.*?)(?=\r|\n|Contact:|$)/);
      permit.contractor = contractorMatch ? contractorMatch[1].replace(/\s+/g, ' ').trim() : null;

      permit.county = 'Hall';
      permit.source_url = sourceUrl;

      if (permit.permit_number) permits.push(permit);
    } catch (err) {
      console.error('Error parsing block:', err.message);
    }
  }
  return permits;
}
module.exports = { downloadAndParsePdf };

if (require.main === module) {
  const testUrl = 'https://www.hallcounty.org/ArchiveCenter/ViewFile/Item/1413';
  downloadAndParsePdf(testUrl)
    .then(permits => {
      console.log('\n--- SAMPLE PERMIT ---');
      console.log(JSON.stringify(permits[0], null, 2));
      console.log('\n--- SECOND PERMIT ---');
      console.log(JSON.stringify(permits[1], null, 2));
      console.log(`\nTotal permits parsed: ${permits.length}`);
    })
    .catch(console.error);
}