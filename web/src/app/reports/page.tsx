import type { Metadata } from 'next'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { Logo } from '@/components/Logo'
import { ContactModal } from '@/components/ContactModal'
import {
  COUNTY_META, COUNTIES, buildSlug, formatMonthYear, getAllReportSummaries,
} from '@/lib/reports'

// force-dynamic prevents build-time pre-render (Supabase env vars only available at runtime).
// unstable_cache caches the DB result for 6 hours so repeated requests are fast.
export const dynamic = 'force-dynamic'

const getCachedSummaries = unstable_cache(
  getAllReportSummaries,
  ['report-summaries'],
  { revalidate: 21600 },
)

export const metadata: Metadata = {
  title: 'Georgia Building Permit Reports | Permit Pulse',
  description: 'Monthly building permit activity reports for Hall, Gwinnett, Forsyth, DeKalb County, Bryan County, Atlanta, Savannah, Alpharetta, Johns Creek, and Augusta, Georgia. Permit counts by zip code, type, and month-over-month trends.',
}

export default async function ReportsIndexPage() {
  const summaries = await getCachedSummaries()

  // Group summaries by county, most recent month first — show ALL months so
  // no report page is an internal-link orphan
  const byCounty: Record<string, { year: number; month: number; count: number }[]> = {}
  for (const s of summaries) {
    if (!byCounty[s.county]) byCounty[s.county] = []
    byCounty[s.county].push({ year: s.year, month: s.month, count: s.count })
  }
  // summaries is already sorted most-recent-first; no cap

  const totalPermits = summaries.reduce((s, r) => s + r.count, 0)

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/"><Logo /></Link>
        <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          Georgia · Monthly Reports
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Building Permit Activity Reports</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Monthly permit data across Hall, Gwinnett, Forsyth, DeKalb County, Bryan County, Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, and Cherokee County — pulled directly from official county sources.
        </p>
        {totalPermits > 0 && (
          <p className="mt-3 text-sm text-gray-400">{totalPermits.toLocaleString()} permits tracked across all areas</p>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        {COUNTIES.map(county => {
          const meta = COUNTY_META[county]
          const countyMonths = byCounty[county] ?? []
          return (
            <div key={county} className="mb-12">
              <h2 className="text-base font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                {meta.fullName}
                {meta.historicalThrough && (
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Historical · through {meta.historicalThrough}
                  </span>
                )}
              </h2>
              {countyMonths.length === 0 ? (
                <p className="text-sm text-gray-400">No data yet for this area.</p>
              ) : (
                <>
                  {/* Featured months — large cards */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {countyMonths.slice(0, 6).map(({ year, month, count }) => {
                      const slug = buildSlug(county, year, month)
                      return (
                        <Link
                          key={slug}
                          href={`/reports/${slug}`}
                          className="bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 rounded-xl p-4 text-center transition-colors group"
                        >
                          <div className="text-xs text-gray-500 mb-2 leading-tight">
                            {formatMonthYear(year, month)}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-700">
                            {count.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">permits</div>
                        </Link>
                      )
                    })}
                  </div>
                  {/* Archive months — compact text links so older reports are never orphaned */}
                  {countyMonths.length > 6 && (
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      {countyMonths.slice(6).map(({ year, month, count }) => {
                        const slug = buildSlug(county, year, month)
                        return (
                          <Link
                            key={slug}
                            href={`/reports/${slug}`}
                            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            {formatMonthYear(year, month)} ({count.toLocaleString()})
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </section>

      <section className="bg-blue-600 py-14 text-center px-6">
        <h2 className="text-2xl font-bold text-white mb-3">Get alerted when new permits are filed</h2>
        <p className="text-blue-100 mb-6 max-w-lg mx-auto">
          Pick your zip codes and permit types. We'll email you every Monday, Wednesday, and Friday.
        </p>
        <Link
          href="/login"
          className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium text-sm"
        >
          Start free
        </Link>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Permit Pulse · <ContactModal />
      </footer>
    </div>
  )
}
