require('dotenv').config();
const axios = require('axios');

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const memCache = new Map(); // L1: cleared each process restart

let _supabase = null;
function getSupabase() {
  if (!_supabase && process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _supabase;
}

async function geocodeAddress(address) {
  if (!address) return null;

  const query = `${address}, GA`;

  // L1: in-memory
  if (memCache.has(query)) return memCache.get(query);

  // L2: persistent DB cache — avoids re-billing the same address across runs
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from('geocode_cache')
      .select('zip_code')
      .eq('address', query)
      .maybeSingle();
    if (data !== null) {
      memCache.set(query, data.zip_code);
      return data.zip_code;
    }
  }

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
      memCache.set(query, null);
      if (sb) await sb.from('geocode_cache').upsert({ address: query, zip_code: null }, { onConflict: 'address' });
      return null;
    }

    const zipComponent = data.results[0].address_components.find(c =>
      c.types.includes('postal_code')
    );

    const zip = zipComponent?.short_name ?? null;
    memCache.set(query, zip);
    if (sb) await sb.from('geocode_cache').upsert({ address: query, zip_code: zip }, { onConflict: 'address' });
    return zip;
  } catch (err) {
    console.warn(`  Geocode failed for "${query}": ${err.message}`);
    memCache.set(query, null);
    return null;
  }
}

module.exports = { geocodeAddress };
