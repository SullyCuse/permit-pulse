# Permit Pulse — Dev Notes

## Scraper Patterns
- All scrapers export `fetchNewPermits(lastTimestampMs)` → `{ permits, maxTimestamp }`
- State keys live in `scraper/state.js`; add get/set pair + export when adding a new source
- Wire into `scraper/run-all.js` following existing county block pattern
- `county` field doubles as the upsert conflict key — must be consistent (e.g. `'Sandy Springs'`, not `'Sandy Springs, GA'`)

## ViewpointCloud / OpenGov Portals
- OpenGov portals (*.portal.opengov.com) run on ViewpointCloud, not ArcGIS
- Real API: `https://api-east.viewpointcloud.com/v2/<subdomain>/records?recordTypeID=<id>`
- Get record type IDs from `/record_types` endpoint (no auth needed)
- **Must send browser User-Agent** — axios without it gets Cloudflare 403
- Dates in raw JSON are ISO strings (`2026-05-22T12:13:06.000Z`); PowerShell's ConvertFrom-Json reformats them — always check raw JSON, not PS output
- API returns only currently-active/open permits (~25 per type); no historical archive

## Adding a New Scraper (checklist)
See `memory/adding-new-scrapers.md` for full checklist.
