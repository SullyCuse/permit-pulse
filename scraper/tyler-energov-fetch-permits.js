require('dotenv').config();
const axios = require('axios');

// Tyler EnerGov "Civic Self Service" portals expose an ANONYMOUS public search at
// POST /apps/selfservice/api/energov/search/search (no auth/JWT — the /permits/search
// endpoint that needs a token is a different, unused path). Scope to permits via
// SearchModule:1 + FilterModule:2, sort the date field desc, page newest-first to a cursor.
// Server-side date filters are ignored, so we cursor client-side on the date field.
// Some tenants have garbage future-dated rows (e.g. year 2999) — treated as junk.
//
// Date field: most tenants use IssueDate (always populated for issued permits). Columbus
// is different — its IssueDate is uniformly the placeholder 2999-01-01 (unissued), so
// IssueDate-desc returns only junk and never reaches real data. Columbus instead sorts &
// cursors on ApplyDate (the submission date, always populated and sane). Per-tenant via
// cfg.dateField. (Most tenants reject an ApplyDate sort key, so this is opt-in.)

const TYLER_JURISDICTIONS = [
  { county: 'Clayton County',  slug: 'clayton',       host: 'claytoncountyga-energovweb.tylerhost.net' },
  { county: 'Barrow County',   slug: 'barrow',        host: 'barrowcountyga-energovweb.tylerhost.net' },
  { county: 'Jackson County',  slug: 'jackson',       host: 'jacksoncountyga-energovweb.tylerhost.net' },
  { county: 'Roswell',         slug: 'roswell',       host: 'cityofroswellga-energovweb.tylerhost.net' },
  { county: 'Perry',           slug: 'perry',         host: 'perryga-energovpub.tylerhost.net' },
  { county: 'Lawrenceville',   slug: 'lawrenceville', host: 'cityoflawrencevillega-energovweb.tylerhost.net' },
  { county: 'Houston County',  slug: 'houston',       host: 'houstoncountyga-energovpub.tylerhost.net' },
  { county: 'Flowery Branch',  slug: 'flowerybranch', host: 'cityofflowerybranchga-energovweb.tylerhost.net' },
  { county: 'Dawson County',   slug: 'dawson',        host: 'dawsoncountyga-energovpub.tylerhost.net' },
  { county: 'Dallas',          slug: 'dallas',        host: 'dallasga-energovpub.tylerhost.net' },
  // Bulloch County (Statesboro) is functional but its search server is slow (~55s/query,
  // independent of page size) — needs the larger PAGE_SIZE + longer REQUEST_TIMEOUT below.
  { county: 'Bulloch County',  slug: 'bulloch',       host: 'bullochcountyga-energovpub.tylerhost.net' },
  // Columbus (consolidated Columbus-Muscogee gov). IssueDate is all placeholder 2999-01-01,
  // so cursor/sort on ApplyDate instead. Live replacement for the ArcGIS feed that froze 2016.
  { county: 'Columbus',        slug: 'columbus',      host: 'columbusga-energovpub.tylerhost.net', dateField: 'ApplyDate' },
];

// PageSize is honored up to ~1000 at fixed per-query cost, so a large page minimizes
// round-trips (matters for slow tenants like Bulloch). The search is Elasticsearch-backed
// and refuses paging past 10,000 results, so MAX_PAGES * PAGE_SIZE only needs to cover that.
const PAGE_SIZE = 1000;
const MAX_PAGES = 12; // 12 * 1000 > the 10k ES pagination ceiling
const REQUEST_TIMEOUT = 90000; // Bulloch's search takes ~55s; fast tenants return in 1-5s
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function emptyCriteria(extra = {}) {
  return Object.assign({ PageNumber: 0, PageSize: 0, SortBy: null, SortAscending: false }, extra);
}

function buildBody(pageNumber, sortBy = 'IssueDate') {
  return {
    Keyword: '', ExactMatch: false, SearchModule: 1, FilterModule: 2, SearchMainAddress: false,
    PlanCriteria: emptyCriteria(),
    PermitCriteria: {
      PermitNumber: null, PermitTypeId: 'none', PermitWorkclassId: null, PermitStatusId: 'none',
      ProjectName: null, IssueDateFrom: null, IssueDateTo: null, Address: null, Description: null,
      ExpireDateFrom: null, ExpireDateTo: null, FinalDateFrom: null, FinalDateTo: null,
      ApplyDateFrom: null, ApplyDateTo: null, SearchMainAddress: false, ContactId: null,
      TypeId: null, WorkClassIds: null, ParcelNumber: null, ExcludeCases: null,
      EnableDescriptionSearch: false, PageNumber: 0, PageSize: 0, SortBy: sortBy, SortAscending: false,
    },
    InspectionCriteria: emptyCriteria({ TypeId: [], WorkClassIds: [], ExcludeCases: [], ExcludeFilterModules: [] }),
    CodeCaseCriteria: emptyCriteria(), RequestCriteria: emptyCriteria(),
    BusinessLicenseCriteria: emptyCriteria(), ProfessionalLicenseCriteria: emptyCriteria(),
    LicenseCriteria: emptyCriteria(), ProjectCriteria: emptyCriteria(),
    ExcludeCases: null, PageNumber: pageNumber, PageSize: PAGE_SIZE, SortBy: sortBy, SortAscending: false,
  };
}

async function getTenantHeaders(host) {
  const url = `https://${host}/apps/selfservice/api/Home/GetTenants`;
  const { data } = await axios.get(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, timeout: 30000 });
  const t = data?.Result?.[0];
  if (!t) throw new Error('GetTenants returned no tenant');
  return {
    'User-Agent': UA,
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
    Origin: `https://${host}`,
    Referer: `https://${host}/`,
    tenantid: String(t.TenantID ?? 1),
    tenantname: t.TenantName ?? '',
    'Tyler-TenantUrl': t.TenantUrl ?? '',
    'Tyler-Tenant-Culture': 'en-US',
  };
}

function zipFromAddress(addr) {
  const m = (addr || '').match(/\b(3\d{4})\b/);
  return m ? m[1] : null;
}

// Build a fetcher for one jurisdiction. lastTimestampMs is the cursor (max IssueDate seen).
function makeFetcher(cfg) {
  const dateField = cfg.dateField || 'IssueDate'; // sort/cursor/date_filed source — see header note
  return async function fetchNewPermits(lastTimestampMs = 0) {
    const since = lastTimestampMs ? new Date(lastTimestampMs).toISOString().split('T')[0] : 'beginning';
    console.log(`[${cfg.county}] Fetching permits since ${since} (by ${dateField})...`);
    const headers = await getTenantHeaders(cfg.host);
    const searchUrl = `https://${cfg.host}/apps/selfservice/api/energov/search/search`;
    const nowCap = Date.now() + 2 * 24 * 60 * 60 * 1000; // future-date junk guard

    const seen = new Set();
    const permits = [];
    let maxTimestamp = lastTimestampMs;
    let reachedCursor = false;

    for (let page = 1; page <= MAX_PAGES && !reachedCursor; page++) {
      let result;
      try {
        const { data } = await axios.post(searchUrl, buildBody(page, dateField), { headers, timeout: REQUEST_TIMEOUT });
        result = data?.Result;
      } catch (err) {
        console.error(`  [${cfg.county}] page ${page} error: ${err.message}`);
        break;
      }
      const rows = result?.EntityResults || [];
      if (rows.length === 0) break;

      let sawSaneOnPage = false;
      for (const r of rows) {
        const rawDate = r[dateField];
        if (!rawDate) continue;
        const ms = new Date(rawDate).getTime();
        if (!ms || ms > nowCap) continue; // skip garbage / future-dated junk
        sawSaneOnPage = true;
        if (ms <= lastTimestampMs) { reachedCursor = true; continue; }
        const id = r.CaseId || r.CaseNumber;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        if (ms > maxTimestamp) maxTimestamp = ms;
        const addr = r.AddressDisplay || null;
        permits.push({
          permit_number: r.CaseNumber,
          address: addr,
          zip_code: zipFromAddress(addr),
          permit_type: r.CaseType || null,
          description: r.Description || null,
          date_filed: rawDate.split('T')[0],
          county: cfg.county,
          applicant_name: null,
          source_url: `https://${cfg.host}/apps/selfservice#/permit/${r.CaseId}`,
          raw_data: { source: 'tyler-energov', status: r.CaseStatus, applyDate: r.ApplyDate, issueDate: r.IssueDate, caseId: r.CaseId },
        });
      }
      // Once a page yields a sane row at/under the cursor, the remaining (desc-sorted) rows are older.
      if (reachedCursor) break;
      if (!sawSaneOnPage && page > 3) break; // pages of pure junk — bail
      await new Promise(res => setTimeout(res, 150));
    }

    console.log(`[${cfg.county}] ${permits.length} new permits since ${since}`);
    return { permits, maxTimestamp: Math.min(maxTimestamp, Date.now()) };
  };
}

const fetchers = Object.fromEntries(TYLER_JURISDICTIONS.map(cfg => [cfg.slug, makeFetcher(cfg)]));

module.exports = { TYLER_JURISDICTIONS, makeFetcher, fetchers };

if (require.main === module) {
  const onlySlug = process.argv[2];
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  (async () => {
    for (const cfg of TYLER_JURISDICTIONS) {
      if (onlySlug && cfg.slug !== onlySlug) continue;
      try {
        const { permits, maxTimestamp } = await makeFetcher(cfg)(cutoff);
        console.log(`  → ${cfg.county}: ${permits.length} permits, newest ${new Date(maxTimestamp).toISOString().slice(0, 10)}`);
        if (permits[0]) console.log(`     sample: ${permits[0].permit_number} | ${permits[0].permit_type} | ${permits[0].address} | zip ${permits[0].zip_code}`);
      } catch (e) {
        console.error(`  → ${cfg.county}: FAILED ${e.message}`);
      }
    }
  })();
}
