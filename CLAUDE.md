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

## CherokeeStatus Portal
- Export endpoint: POST `https://cherokeega.com/cherokeestatus/permit-applications-export.php` with `thequery` param (SQL WHERE clause)
- Returns CSV; Cloudflare blocks Node.js/axios via TLS fingerprinting — must use Puppeteer: load portal page first, then `page.evaluate/fetch` from Chrome context
- Date cursor (ISO string), state key: `cherokee_last_date`

## ArcGIS Service Goes Stale
- If an ArcGIS FeatureServer stops updating, find the replacement: `arcgis.com/sharing/rest/search?q=<name>+orgid%3A<ORG_ID>&sortField=modified&sortOrder=desc`
- Atlanta example: `Building_Permit_latest` froze Jan 2026 → replaced by `building_permit_featureLayer` (same schema)

## Critical Gotchas
- **scraper_state table requires explicit grants**: `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE scraper_state TO service_role` — missing grants cause ALL cursors to silently fall back to defaults, re-processing everything from scratch every run. Check: `SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'scraper_state'`
- **PDF downloads need timeout**: `parse-permit-pdf.js` axios.get must have `timeout: 30000` — no timeout = hangs forever if server stalls
- **State env var**: scraper uses `SUPABASE_SECRET_KEY` (not `SUPABASE_SERVICE_ROLE_KEY`) — check `gh secret list` if state reads fail
- **Hall County archive rotates**: only keeps latest ~4 PDFs live; `fetch-archive.js` scrapes listing page (`Archive.aspx?AMID=39`) — do NOT revert to sequential scan
