require('dotenv').config();
const axios = require('axios');

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const cache = new Map();

async function geocodeAddress(address) {
  if (!address) return null;

  const query = `${address}, GA`;

  if (cache.has(query)) return cache.get(query);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('  GOOGLE_MAPS_API_KEY not set — zip_code will be null');
    return null;
  }

  try {
    const { data } = await axios.get(GEOCODE_URL, {
      params: { address: query, key: apiKey },
      timeout: 5000,
    });

    if (data.status !== 'OK' || !data.results?.length) {
      cache.set(query, null);
      return null;
    }

    const zipComponent = data.results[0].address_components.find(c =>
      c.types.includes('postal_code')
    );

    const zip = zipComponent?.short_name ?? null;
    cache.set(query, zip);
    return zip;
  } catch (err) {
    console.warn(`  Geocode failed for "${query}": ${err.message}`);
    cache.set(query, null);
    return null;
  }
}

module.exports = { geocodeAddress };
