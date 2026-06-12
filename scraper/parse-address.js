// Shared address parsing for the permits feed.
//
// County scrapers concatenate street + city + state + zip into a single free-text
// `address` field, in inconsistent formats (see the table in parseCity below). These
// helpers extract a clean city and a street-only display value from that blob.
//
// Used by save-permits.js (going forward) and backfill-cities.js (existing rows).
// Both city and street are best-effort: the data is messy, so callers treat a null
// city as "unknown" rather than an error, and the backfill is re-runnable.

// Comma segments that are never a city — unit markers and the state abbreviation.
const NOISE_SEGMENT = /^(ga|georgia|lot|#.*|ste\b.*|suite\b.*|apt\b.*|unit\b.*|bldg\b.*|fl\b.*)$/i;

// Multi-word GA cities. Only needed for the no-comma "street City" form (Cherokee's
// glued "Ball Ground, GA30107"), where we'd otherwise grab just the last word.
// Longest-match-first so e.g. "Ball Ground" wins over a bare "Ground".
const MULTIWORD_CITIES = [
  'Ball Ground', 'Holly Springs', 'Sandy Springs', 'Powder Springs', 'Stone Mountain',
  'Flowery Branch', 'Johns Creek', 'Peachtree City', 'Peachtree Corners', 'Sugar Hill',
  'Mountain Park', 'Union City', 'College Park', 'East Point', 'Avondale Estates',
  'St Simons Island', 'Sky Valley', 'Lake City', 'Locust Grove',
].sort((a, b) => b.length - a.length);

// Words that are never a city on their own — street-type suffixes, directionals, and
// unit markers. A no-comma address like "1033 MCLENDON DR" would otherwise yield "Dr".
const NON_CITY_WORDS = new Set([
  'st', 'street', 'rd', 'road', 'dr', 'drive', 'ln', 'lane', 'ct', 'court', 'pl', 'place',
  'way', 'ave', 'avenue', 'blvd', 'boulevard', 'cir', 'circle', 'trl', 'trail', 'ter', 'terrace',
  'hwy', 'highway', 'pkwy', 'parkway', 'run', 'pt', 'point', 'cres', 'crescent', 'sq', 'square',
  'loop', 'walk', 'path', 'xing', 'crossing', 'row', 'cv', 'cove', 'pass', 'bnd', 'bend',
  'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'north', 'south', 'east', 'west',
  'ste', 'suite', 'apt', 'unit', 'bldg', 'lot', 'fl', 'ga', 'georgia',
]);

// Reject obvious non-cities: contains a digit (parcel IDs, malformed zips like "GA 0"),
// too short ("Ga", unit letters), or a bare street suffix / directional.
function isValidCity(c) {
  if (!c) return false;
  if (!/^[a-z]/i.test(c)) return false; // must start with a letter (drops "(A)", etc.)
  if (/\d/.test(c)) return false;
  if (c.length < 3) return false;
  if (NON_CITY_WORDS.has(c.toLowerCase())) return false;
  return true;
}

// Title-case and validate a candidate; returns the clean city or null.
function clean(candidate) {
  const t = titleCase(candidate.trim());
  return isValidCity(t) ? t : null;
}

function titleCase(s) {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    // keep common directionals/abbrevs readable but leave as title-case otherwise
    .trim();
}

// Strip a trailing zip and state from the address, returning the remainder.
// Handles both ", GA 30306" and the glued "Canton, GA30115" Cherokee form.
function stripStateZip(address) {
  let s = address.trim();
  s = s.replace(/[\s,]+$/, '');                              // trailing commas/spaces (", ,  ")
  s = s.replace(/,?\s*(GA|GEORGIA)\s*(\d{5})/i, ', GA $2');  // normalize glued "GA30115"/"Georgia 30115"
  s = s.replace(/[,\s]+\d{5}(-\d{4})?\s*$/i, '');            // trailing zip (5 or ZIP+4)
  s = s.replace(/[,\s]+(GA|GEORGIA)\s*\d*\s*$/i, '');        // state + any leftover short digits ("GA 0", "GA 303")
  return s.replace(/[\s,]+$/, '').trim();
}

// Extract the city from a raw address string. Returns a title-cased city, or null.
//
// Formats handled (one example each):
//   street, city, GA zip   528 WOODBRIDGE HOLLOW NE, ATLANTA, GA 30306
//   street, city, GA, zip   406 Boardwalk Way, Alpharetta, GA, 30022
//   street, city, GA        225 EAST PRESIDENT ST, Savannah, GA
//   street, city            172 Woodcliff Dr, Suwanee
//   street, unit, city      769 WITCHER RD, Lot, NEWNAN  /  ... , #21, FLOWERY BRANCH , GA 30542
//   street City, GAzip      2864 East Cherokee Dr Canton, GA30115   (no comma before city)
function parseCity(address) {
  if (!address || typeof address !== 'string') return null;

  const remainder = stripStateZip(address);
  if (!remainder) return null;

  const segments = remainder
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && !NOISE_SEGMENT.test(s));

  if (segments.length === 0) return null;

  // Multiple segments → the last surviving one is the city (street is earlier).
  if (segments.length > 1) {
    return clean(segments[segments.length - 1]);
  }

  // Single segment. If the original had a comma, this lone segment is the street
  // and there's no separate city to extract (e.g. "172 Woodcliff Dr" before its
  // city segment was stripped as noise — rare). If the original had NO comma, this
  // is the Cherokee "street City" form: the city is the trailing word(s).
  if (remainder.includes(',')) {
    // The only non-noise segment is the street; no recoverable city.
    return null;
  }

  // No-comma form (Cherokee glued "street City"): prefer a known multi-word city
  // suffix (e.g. "Ball Ground"); otherwise take the trailing word.
  const lone = segments[0];
  for (const city of MULTIWORD_CITIES) {
    if (new RegExp('\\b' + city.replace(/\s+/g, '\\s+') + '\\s*$', 'i').test(lone)) {
      return city;
    }
  }
  const words = lone.split(/\s+/);
  if (words.length < 2) return null; // just a street number / nothing city-like
  return clean(words[words.length - 1]);
}

// Street-only display value: the address with the trailing ", city, GA zip" removed.
// Falls back to the full address if nothing can be stripped.
function stripCity(address, city) {
  if (!address) return address;
  let s = stripStateZip(address);
  if (city) {
    // Remove a trailing ", City" (case-insensitive) if present.
    const re = new RegExp('[,\\s]+' + city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$', 'i');
    s = s.replace(re, '');
  }
  s = s.replace(/[,\s]+$/, '').trim();
  return s || address;
}

module.exports = { parseCity, stripCity, stripStateZip };

// --- self-test: `node scraper/parse-address.js` ---
if (require.main === module) {
  const cases = [
    ['528 WOODBRIDGE HOLLOW NE, ATLANTA, GA 30306', 'Atlanta'],
    ['406 Boardwalk Way, Alpharetta, GA, 30022', 'Alpharetta'],
    ['225 EAST PRESIDENT ST, Savannah, GA', 'Savannah'],
    ['172 Woodcliff Dr, Suwanee', 'Suwanee'],
    ['3876 GLEN PARK DR , Stonecrest', 'Stonecrest'],
    ['769 WITCHER RD, Lot, NEWNAN', 'Newnan'],
    ['7019 PINE TOP COURT , #21, FLOWERY BRANCH , GA 30542', 'Flowery Branch'],
    ['2864 East Cherokee Dr Canton, GA30115', 'Canton'],
    ['5532 Seminole Way Acworth, GA30102', 'Acworth'],
    ['626 Cokers Chapel Rd Ball Ground, GA30107', 'Ball Ground'],
    ['1396 HIGH SIERRA CT, LAWRENCEVILLE', 'Lawrenceville'],
    ['17 LIVE OAK PL, ST SIMONS ISLAND, GA 31522', 'St Simons Island'],
    ['4688 Hwy 280 W, Pembroke', 'Pembroke'],
    ['101 Fiber Dr, CARTERSVILLE, GA 30120', 'Cartersville'],
    ['5169 MUNDY GROVE LANE SW, GAINESVILLE', 'Gainesville'],
    // edge cases that must NOT yield a bogus city
    ['1033 MCLENDON DR ', null],               // no city -> not "Dr"
    ['1137 AVIATION WAY SW', null],            // directional -> not "Sw"
    ['2710 BOULDERCREST RD STE C ', null],     // unit -> not "C"
    ['21N11 006 , 21-1054-0002', null],        // parcel id -> not "21-1054-0002"
    ['0 ANTHONY NW, ATLANTA, GA 0', 'Atlanta'],// malformed zip -> still Atlanta, not "Ga 0"
  ];
  let pass = 0;
  for (const [addr, expected] of cases) {
    const got = parseCity(addr);
    const ok = got === expected;
    if (ok) pass++;
    console.log(`${ok ? '✅' : '❌'} parseCity(${JSON.stringify(addr)}) = ${JSON.stringify(got)}${ok ? '' : ` (expected ${JSON.stringify(expected)})`}`);
    console.log(`     street → ${JSON.stringify(stripCity(addr, got))}`);
  }
  console.log(`\n${pass}/${cases.length} passed`);
}
