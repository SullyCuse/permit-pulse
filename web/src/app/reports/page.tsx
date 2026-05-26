import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import {
  COUNTY_META, COUNTIES, getAllMonths, buildSlug, formatMonthYear, getAllReportSummaries,
} from '@/lib/reports'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Georgia Building Permit Reports | Permit Pulse',
  description: 'Monthly building permit activity reports for Hall, Gwinnett, Forsyth, Savannah, and Alpharetta, Georgia. Permit counts by zip code, type, and month-over-month trends.',
}

export default async function ReportsIndexPage() {
  const summaries = await getAllReportSummaries()
  const months = getAllMonths() // most recent first
  const recentMonths = months.slice(0, 6)

  const countLookup: Record<string, number> = {}
  for (const s of summaries) {
    countLookup[`${s.county}|${s.year}|${s.month}`] = s.count
  }

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
          Monthly permit data across Hall, Gwinnett, Forsyth, Savannah, and Alpharetta — pulled directly from official county sources.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        {COUNTIES.map(county => {
          const meta = COUNTY_META[county]
          return (
            <div key={county} className="mb-12">
              <h2 className="text-base font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
                {meta.fullName}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {recentMonths.map(({ year, month }) => {
                  const count = countLookup[`${county}|${year}|${month}`]
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
                      {count != null ? (
                        <>
                          <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-700">{count}</div>
                          <div className="text-xs text-gray-400 mt-1">permits</div>
                        </>
                      ) : (
                        <div className="text-2xl font-bold text-gray-300">—</div>
                      )}
                    </Link>
                  )
                })}
              </div>
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
        © {new Date().getFullYear()} Permit Pulse · <a href="mailto:kevin@kpsullivan.com" className="hover:text-gray-600">Contact</a>
      </footer>
    </div>
  )
}
