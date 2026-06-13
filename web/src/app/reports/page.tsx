import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ContactModal } from '@/components/ContactModal'
import {
  COUNTY_META, COUNTIES, buildSlug, formatMonthYear, getAllReportSummaries,
} from '@/lib/reports'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Georgia Building Permit Reports | Permit Pulse',
  description: 'Monthly building permit activity reports for Hall, Gwinnett, Forsyth, DeKalb, Bryan, Cherokee, Effingham, Fayette, Henry, Coweta, Glynn, Gordon, Clayton, Barrow, Jackson, Houston, Dawson, Morgan and Bulloch County — and Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, Marietta, LaGrange, Roswell, Lawrenceville, Perry, Flowery Branch, and Dallas, Georgia.',
}

const FOREST = '#2d5a27'
const PLAYFAIR = 'var(--font-playfair), Georgia, serif'

export default async function ReportsIndexPage() {
  const summaries = await getAllReportSummaries()

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
      <nav className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Logo color={FOREST} />
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Sign in</Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide"
          style={{ backgroundColor: '#f0f7ee', color: FOREST }}
        >
          Georgia · Monthly Reports
        </div>
        <h1
          className="text-4xl font-black text-gray-900"
          style={{ fontFamily: PLAYFAIR }}
        >
          Building Permit Activity Reports
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Monthly permit data across Hall, Gwinnett, Forsyth, DeKalb, Bryan, Cherokee, Effingham, Fayette, Henry, Coweta, Glynn, Gordon, Clayton, Barrow, Jackson, Houston, Dawson, Morgan and Bulloch County — and Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, Marietta, LaGrange, Roswell, Lawrenceville, Perry, Flowery Branch, and Dallas — pulled directly from official county sources.
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
              <h2 className="text-base font-semibold text-gray-900 mb-4 border-b border-stone-200 pb-3 flex items-center gap-2">
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
                          className="bg-gray-50 hover:bg-[#f0f7ee] border border-gray-200 hover:border-[#2d5a27] rounded-xl p-4 text-center transition-colors group"
                        >
                          <div className="text-xs text-gray-500 mb-2 leading-tight">
                            {formatMonthYear(year, month)}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 group-hover:text-[#2d5a27]">
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
                            className="text-sm text-gray-500 transition-colors hover:text-[#2d5a27]"
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

      <section className="py-14 text-center px-6" style={{ backgroundColor: FOREST }}>
        <h2
          className="text-2xl font-black text-white mb-3"
          style={{ fontFamily: PLAYFAIR }}
        >
          Get alerted when new permits are filed
        </h2>
        <p className="text-green-100 mb-6 max-w-lg mx-auto">
          Pick your zip codes and permit types. We'll email you every Monday, Wednesday, and Friday.
        </p>
        <Link
          href="/login"
          className="bg-white hover:bg-stone-50 px-8 py-3 rounded-lg font-semibold text-sm transition-colors inline-block"
          style={{ color: FOREST }}
        >
          Start free
        </Link>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Permit Pulse · <ContactModal />
      </footer>
    </div>
  )
}
