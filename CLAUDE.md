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
- **Prefer an authoritative county GIS address layer over Google when one exists** — it's free (no quota), and it has new subdivisions Google hasn't indexed yet (Google returns ZERO_RESULTS for streets whose house numbers aren't in its DB). Lookup order: cache → county GIS → Google. Cache GIS hits under the same key so Google is never billed for an address the county already knows. Bryan example below.
- **Bryan County E911 address layer (authoritative):** `https://bryangis.bryan-county.org/arcgis/rest/services/AddressPoints/MapServer/0/query` — fields `ADDRNUM`, `FULLNAME` (street), `ZIPCODE`, `MUNICIPALITY`. Match `ADDRNUM='<num>'` then require a **full street-token match** on `FULLNAME` (a near-miss must fall through to Google, not pick the wrong street). City = `MUNICIPALITY` minus `City of `, else canonical USPS zip→city (31324=Richmond Hill, 31321=Pembroke, 31308=Ellabell). See `lookupBryanGis()` in `bryan-fetch-permits.js`.

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
- **`service_role` has NO DELETE grant on `geocode_cache`** — a scraper/backfill calling `.delete()` on it gets `permission denied` (silent no-op). Clear stale nulls via the Supabase MCP / SQL editor (privileged), not from scraper code.
- **The cache check short-circuits before any lookup logic.** When you add a new authoritative source (e.g. county GIS) ahead of Google, addresses already cached as null will keep returning null — you must clear those stale nulls once so the new path is reachable. (Bryan example: `DELETE FROM geocode_cache WHERE address LIKE '%, Bryan County, GA' AND zip_code IS NULL`.)

## SagesGov Portal (Fayette County, Henry County, Marietta, LaGrange)
- Tries direct HTTP POST (no CAPTCHA) before launching Puppeteer — if server enforces reCAPTCHA, falls back to Puppeteer stealth
- Direct HTTP form fields use `ctl00$cphContent$...` dollar-notation (not the `#id` selector names seen in DevTools)
- reCAPTCHA v2 consistently blocks headless Chrome in CI — **solved via 2captcha** (`TWOCAPTCHA_API_KEY` secret; `solve2Captcha()` uses the 2captcha in.php/res.php HTTP API, no npm dep). Stealth never auto-solves these; without the key the scraper skips. Extract the sitekey from the anchor iframe `k=` param, inject the token into `#...ctrlCaptcha_txtCaptchaToken`, then submit.
- **Timeframe dropdown value is `"Date Range"` (with a space)**, not `"DateRange"` — the label is "Date range (fixed)". `page.select` silently selects nothing on a value mismatch, leaving dates unposted and the search bouncing back to an empty form.
- **Results are a 10-per-page ASP.NET GridView.** Read the "X of Y records" total and page via the GridView postback. Do NOT call `__doPostBack` inside `page.evaluate` — ASP.NET's `onsubmit` reads `arguments.callee`, which throws a strict-mode error in Puppeteer's evaluate wrapper. Instead set `__EVENTTARGET`/`__EVENTARGUMENT` and submit via `HTMLFormElement.prototype.submit` (bypasses onsubmit).
- **Result-count cap**: SagesGov refuses oversized result sets with "Too many records matched" (no rows). `fetchPermitsForJurisdiction` adaptively narrows the date window (anchored at today: full→60→30→14→7→3→1 days) until the search returns rows. Cold-start backfill only reaches as far back as the widest sub-cap window; steady-state runs query a small window.
- **Date column**: map `date_filed` from the "added on" column (submission date, always populated), NOT "issued date" (blank until issued). The "permit" cell is `"<NUMBER> - <Type>"` — split it. There is no applicant column. Require a Details.aspx link to accept a row (drops the stray pager row).

## Accela Portal (Gainesville, Oakwood — hallco-accela-fetch-permits.js)
- Raw address format is "STREET, CITY GA ZIP" — city is always the last comma segment before " GA XXXXX"
- `parseAddressCell()` appends city to address (e.g. `"624 GROVE ST, GAINESVILLE"`) — consistent with Bryan County pattern

## Critical Gotchas
- **scraper_state table requires explicit grants**: `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE scraper_state TO service_role` — missing grants cause ALL cursors to silently fall back to defaults, re-processing everything from scratch every run. Check: `SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'scraper_state'`
- **PDF downloads need timeout**: `parse-permit-pdf.js` axios.get must have `timeout: 30000` — no timeout = hangs forever if server stalls
- **State env var**: scraper uses `SUPABASE_SECRET_KEY` (not `SUPABASE_SERVICE_ROLE_KEY`) — check `gh secret list` if state reads fail
- **Hall County archive rotates**: only keeps latest ~4 PDFs live; `fetch-archive.js` scrapes listing page (`Archive.aspx?AMID=39`) — do NOT revert to sequential scan
