import { createAdminClient } from '@/lib/supabase/server'

export const COUNTY_META: Record<string, { slug: string; display: string; fullName: string; historicalThrough?: string }> = {
  Hall:       { slug: 'hall-county',     display: 'Hall County',   fullName: 'Hall County, GA' },
  Gwinnett:   { slug: 'gwinnett-county', display: 'Gwinnett County', fullName: 'Gwinnett County, GA' },
  Forsyth:    { slug: 'forsyth-county',  display: 'Forsyth County', fullName: 'Forsyth County, GA' },
  Savannah:   { slug: 'savannah',        display: 'Savannah',      fullName: 'Savannah, GA' },
  Alpharetta:    { slug: 'alpharetta',      display: 'Alpharetta',      fullName: 'Alpharetta, GA' },
  'Bryan County': { slug: 'bryan-county',   display: 'Bryan County',    fullName: 'Bryan County, GA' },
  'DeKalb County': { slug: 'dekalb-county', display: 'DeKalb County',   fullName: 'DeKalb County, GA' },
  'Augusta':       { slug: 'augusta',        display: 'Augusta',         fullName: 'Augusta, GA' },
  'Johns Creek':   { slug: 'johns-creek',   display: 'Johns Creek',     fullName: 'Johns Creek, GA' },
  'Atlanta':       { slug: 'atlanta',        display: 'Atlanta',         fullName: 'Atlanta, GA' },
  'Sandy Springs':    { slug: 'sandy-springs',    display: 'Sandy Springs',     fullName: 'Sandy Springs, GA' },
  'Cherokee County':  { slug: 'cherokee-county',  display: 'Cherokee County',   fullName: 'Cherokee County, GA' },
  'Conyers':          { slug: 'conyers',           display: 'Conyers',           fullName: 'Conyers, GA' },
  'Smyrna':           { slug: 'smyrna',            display: 'Smyrna',            fullName: 'Smyrna, GA' },
  'Cartersville':     { slug: 'cartersville',      display: 'Cartersville',      fullName: 'Cartersville, GA' },
  'Effingham County': { slug: 'effingham-county',  display: 'Effingham County',  fullName: 'Effingham County, GA' },
  'Austell':          { slug: 'austell',            display: 'Austell',           fullName: 'Austell, GA' },
  'Camden County':    { slug: 'camden-county',      display: 'Camden County',     fullName: 'Camden County, GA' },
  'Franklin County':  { slug: 'franklin-county',   display: 'Franklin County',   fullName: 'Franklin County, GA' },
  'Bainbridge':       { slug: 'bainbridge',         display: 'Bainbridge',        fullName: 'Bainbridge, GA' },
  'Gainesville':      { slug: 'gainesville',        display: 'Gainesville',       fullName: 'Gainesville, GA' },
  'Oakwood':          { slug: 'oakwood',            display: 'Oakwood',           fullName: 'Oakwood, GA' },
  'Fayette County':   { slug: 'fayette-county',     display: 'Fayette County',    fullName: 'Fayette County, GA' },
  'Henry County':     { slug: 'henry-county',       display: 'Henry County',      fullName: 'Henry County, GA' },
  'Marietta':         { slug: 'marietta',            display: 'Marietta',          fullName: 'Marietta, GA' },
}

export const COUNTIES = Object.keys(COUNTY_META)

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Earliest month with data (July 2025)
const DATA_START_YEAR = 2025
const DATA_START_MONTH = 6 // 0-indexed

export function buildSlug(county: string, year: number, month: number): string {
  return `${COUNTY_META[county].slug}-${MONTH_NAMES[month]}-${year}`
}

export function parseSlug(slug: string): { county: string; year: number; month: number } | null {
  for (const [county, meta] of Object.entries(COUNTY_META)) {
    if (!slug.startsWith(meta.slug + '-')) continue
    const rest = slug.slice(meta.slug.length + 1)
    const lastDash = rest.lastIndexOf('-')
    if (lastDash === -1) continue
    const monthName = rest.slice(0, lastDash)
    const yearStr = rest.slice(lastDash + 1)
    const month = MONTH_NAMES.indexOf(monthName)
    const year = parseInt(yearStr, 10)
    if (month === -1 || isNaN(year) || year < 2020) continue
    return { county, year, month }
  }
  return null
}

export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_LABELS[month]} ${year}`
}

// All months from data start through current month, most recent first
export function getAllMonths(): { year: number; month: number }[] {
  const now = new Date()
  const result: { year: number; month: number }[] = []
  let y = DATA_START_YEAR
  let m = DATA_START_MONTH
  while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth())) {
    result.push({ year: y, month: m })
    m++
    if (m > 11) { m = 0; y++ }
  }
  return result.reverse()
}

// All complete past months (excludes current month) — used for generateStaticParams
export function getPastMonthSlugs(): string[] {
  const now = new Date()
  const slugs: string[] = []
  let y = DATA_START_YEAR
  let m = DATA_START_MONTH
  while (y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth())) {
    for (const county of COUNTIES) {
      slugs.push(buildSlug(county, y, m))
    }
    m++
    if (m > 11) { m = 0; y++ }
  }
  return slugs
}

export interface ReportData {
  county: string
  year: number
  month: number
  total: number
  prevTotal: number | null
  byZip: { zip: string; count: number }[]
  byType: { type: string; count: number }[]
}

function monthBounds(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  const end = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01`
  return { start, end }
}

export async function getReportData(county: string, year: number, month: number): Promise<ReportData> {
  const admin = createAdminClient()

  const { start, end } = monthBounds(year, month)
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const { start: prevStart } = monthBounds(prevYear, prevMonth)

  const [permits, prevResult] = await Promise.all([
    fetchAllRows<{ zip_code: string | null; permit_type: string | null }>(
      admin,
      'permits',
      'zip_code, permit_type',
      q => q.eq('county', county).gte('date_filed', start).lt('date_filed', end)
    ),
    admin
      .from('permits')
      .select('*', { count: 'exact', head: true })
      .eq('county', county)
      .gte('date_filed', prevStart)
      .lt('date_filed', start),
  ])
  const prevTotal = prevResult.count ?? null

  const zipCounts: Record<string, number> = {}
  const typeCounts: Record<string, number> = {}

  for (const p of permits) {
    if (p.zip_code) zipCounts[p.zip_code] = (zipCounts[p.zip_code] ?? 0) + 1
    const type = p.permit_type ?? 'Other'
    typeCounts[type] = (typeCounts[type] ?? 0) + 1
  }

  const byZip = Object.entries(zipCounts)
    .map(([zip, count]) => ({ zip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const byType = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  return { county, year, month, total: permits.length, prevTotal, byZip, byType }
}

// Paginate through all rows for a Supabase query builder, 1000 rows at a time.
// Pass a factory fn that accepts (from, to) and returns a Supabase query.
async function fetchAllRows<T>(
  admin: ReturnType<typeof createAdminClient>,
  table: string,
  columns: string,
  filters: (q: ReturnType<ReturnType<typeof createAdminClient>['from']>) => ReturnType<ReturnType<typeof createAdminClient>['from']>
): Promise<T[]> {
  const PAGE = 1000
  const all: T[] = []
  let from = 0
  while (true) {
    const base = admin.from(table).select(columns)
    const { data, error } = await (filters(base) as any).range(from, from + PAGE - 1)
    if (error || !data || data.length === 0) break
    all.push(...(data as T[]))
    if (data.length < PAGE) break
    from += PAGE
  }
  return all
}

// Months with actual permit data for a single county — used for "other months" nav
export async function getCountyMonths(county: string): Promise<{ year: number; month: number }[]> {
  const summaries = await getAllReportSummaries()
  return summaries
    .filter(s => s.county === county && s.count > 0)
    .map(s => ({ year: s.year, month: s.month }))
}

// Aggregate permit counts per county per month — used on index page
export async function getAllReportSummaries(): Promise<
  { county: string; year: number; month: number; count: number }[]
> {
  const admin = createAdminClient()

  const { data, error } = await admin.rpc('get_permit_summaries')
  if (error) throw new Error(`get_permit_summaries: ${error.message}`)

  return (data ?? []).map((row: { county: string; year: number; month: number; count: number }) => ({
    county: row.county,
    year: row.year,
    month: row.month,
    count: Number(row.count),
  }))
}
