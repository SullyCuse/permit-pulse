'use client'

import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json'

// County FIPS codes for tracked markets
// Cities that are tracked are shown via their parent county
const TRACKED_FIPS = new Set([
  '13139', // Hall County
  '13135', // Gwinnett County
  '13117', // Forsyth County
  '13089', // DeKalb County
  '13029', // Bryan County
  '13057', // Cherokee County
  '13121', // Fulton County (Atlanta, Alpharetta, Johns Creek, Sandy Springs)
  '13051', // Chatham County (Savannah)
  '13245', // Richmond County (Augusta)
  '13067', // Cobb County (Smyrna, Austell, Marietta)
  '13015', // Bartow County (Cartersville)
  '13103', // Effingham County
  '13113', // Fayette County
  '13151', // Henry County
  '13077', // Coweta County
  '13127', // Glynn County
  '13285', // Troup County (LaGrange)
  '13129', // Gordon County (Calhoun)
  '13063', // Clayton County
  '13013', // Barrow County
  '13157', // Jackson County
  '13153', // Houston County (Perry, Warner Robins)
  '13085', // Dawson County
  '13223', // Paulding County (Dallas)
  // Roswell (Fulton 13121), Lawrenceville (Gwinnett 13135), Flowery Branch (Hall 13139) already tracked
])

const FOREST = '#2d5a27'

export function GeorgiaMap() {
  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{ scale: 3900, center: [-83.2, 32.7] }}
      width={300}
      height={340}
      style={{ width: '100%', height: 'auto', maxWidth: 300 }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies
            .filter(geo => String(geo.id).startsWith('13'))
            .map(geo => {
              const isTracked = TRACKED_FIPS.has(String(geo.id))
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isTracked ? FOREST : '#dce8dc'}
                  stroke="#fff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: isTracked ? '#3d7a37' : '#cddccd' },
                    pressed: { outline: 'none' },
                  }}
                />
              )
            })
        }
      </Geographies>
    </ComposableMap>
  )
}
