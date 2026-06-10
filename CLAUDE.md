# Permit Pulse — Dev Notes

## Scraper Patterns
- All scrapers export `fetchNewPermits(lastTimestampMs)` → `{ permits, maxTimestamp }`
- State keys live in `scraper/state.js`; add get/set pair + export when adding a new source
- Wire into `scraper/run-all.js` following existing county block pattern
- `county` field doubles as the upsert conflict key — must be consistent (e.g. `'Sandy Springs'`, not `'Sandy Springs, GA'`)

## Geocoding (zip_code / city)
- If a scraper needs Google Geocoding API (forward or reverse) for zip_code/city, it MUST cache results in the shared `geocode_cache` table (columns: `address` text PK, `zip_code`, `city`, `created_at`) — uncached per-permit calls exhaust the daily quota fast (DeKalb hit OVER_QUERY_LIMIT on ~94/96 permits in one run before caching was added)
- Forward geocode (address string): cache key = `${address}, GA` — see `gwinnett-geocode.js` / `bryan-fetch-permits.js`
- Reverse geocode (lat/lng from ArcGIS geometry): cache key = `geo:${lat.toFixed(4)},${lng.toFixed(4)}` — see `dekalb-fetch-permits.js` / `johnscreek-fetch-permits.js`
- Pattern: check `geocode_cache` first (treat a row with both null zip/city as a cached "no result"), call Google API only on miss, then `upsert` the result (including null misses) with `onConflict: 'address'`
- Google Geocoding API costs $5/1000 requests. Daily quota cap is set to 200 (could allow up to ~$13/month if maxed every run); the $10/month billing limit is the actual backstop — caching should keep real usage well under both

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
- Self-hosted ArcGIS (e.g. bryangis.bryan-county.org) has no ArcGIS Online search — if it freezes, look for the county's own permit portal instead
- Bryan County example: `LandUsePermits` MapServer froze May 2026 → county migrated to Evolve portal at `evolvepublic.infovisionsoftware.com/BryanCounty/`

## Evolve Portal (InfoVision Software)
- ASP.NET WebForms — scrapable via raw HTTP (no Puppeteer needed)
- Pattern: GET home → POST BL_Menu arg=2 (Permit Search) → POST DL_SearchType=Date Range → POST BT_Search with date strings + Telerik picker ClientState JSON
- Reuse step-4 ViewState to click any row's Details: `__EVENTTARGET=GV_SearchResults$ctl${String(i+2).padStart(2,'0')}$LBT_ResultsDetails`
- Permit type = first non-Applicant contact role; issue date = `<td>M/D/YYYY</td><td>Permit</td>` in Documents section
- See `scraper/bryan-fetch-permits.js` for the full implementation

## Scraper Scheduling
- **Triggered by cron-job.org** (as of 2026-06-05) — POSTs to GitHub API workflow_dispatch Mon/Wed/Fri 7:30 AM ET
- GitHub's built-in schedule removed (was silently missing runs) — `scraper.yml` now only has `workflow_dispatch`
- To trigger manually: `gh workflow run scraper.yml --ref main` or GitHub Actions UI → Run workflow
- cron-job.org job uses PAT with `workflow` scope (no expiration) in Authorization header

## Debugging Scraper Runs
- Scraper logs are in **GitHub Actions**, not Vercel — `gh run list --limit 5` then `gh run view <id> --log 2>&1`
- Vercel runtime logs will show zero traffic if `APP_URL` secret is wrong — absence of logs ≠ no errors
- Production domain is `https://permitpulse.io` — `APP_URL` GitHub secret must match this exactly

## Geocode Cache
- Null geocode results are cached permanently and block retries on future runs
- Clear stale nulls: `DELETE FROM geocode_cache WHERE zip_code IS NULL AND city IS NULL`
- Gwinnett geocoder (`gwinnett-geocode.js`) only returns zip; Bryan geocoder also returns city

## SagesGov Portal (Fayette County, Henry County, Marietta)
- Tries direct HTTP POST (no CAPTCHA) before launching Puppeteer — if server enforces reCAPTCHA, falls back to Puppeteer stealth
- Direct HTTP form fields use `ctl00$cphContent$...` dollar-notation (not the `#id` selector names seen in DevTools)
- reCAPTCHA v2 consistently blocks headless Chrome in CI; direct HTTP bypass is the preferred path

## Accela Portal (Gainesville, Oakwood — hallco-accela-fetch-permits.js)
- Raw address format is "STREET, CITY GA ZIP" — city is always the last comma segment before " GA XXXXX"
- `parseAddressCell()` appends city to address (e.g. `"624 GROVE ST, GAINESVILLE"`) — consistent with Bryan County pattern

## Critical Gotchas
- **scraper_state table requires explicit grants**: `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE scraper_state TO service_role` — missing grants cause ALL cursors to silently fall back to defaults, re-processing everything from scratch every run. Check: `SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'scraper_state'`
- **PDF downloads need timeout**: `parse-permit-pdf.js` axios.get must have `timeout: 30000` — no timeout = hangs forever if server stalls
- **State env var**: scraper uses `SUPABASE_SECRET_KEY` (not `SUPABASE_SERVICE_ROLE_KEY`) — check `gh secret list` if state reads fail
- **Hall County archive rotates**: only keeps latest ~4 PDFs live; `fetch-archive.js` scrapes listing page (`Archive.aspx?AMID=39`) — do NOT revert to sequential scan
