import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { ContactModal } from '@/components/ContactModal'
import {
  parseSlug, getReportData, formatMonthYear, COUNTY_META,
  getCountyMonths, buildSlug, getPastMonthSlugs,
} from '@/lib/reports'

export const revalidate = 86400

const FOREST = '#2d5a27'
const PLAYFAIR = 'var(--font-playfair), Georgia, serif'

export async function generateStaticParams() {
  return getPastMonthSlugs().map(slug => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed) return {}
  const { county, year, month } = parsed
  const meta = COUNTY_META[county]
  const monthYear = formatMonthYear(year, month)
  return {
    title: `${meta.fullName} Building Permits — ${monthYear} | Permit Pulse`,
    description: `${monthYear} building permit activity in ${meta.fullName}. Permit counts by zip code and type, with month-over-month comparison.`,
  }
}

export default async function ReportPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed || !COUNTY_META[parsed.county]) notFound()

  const { county, year, month } = parsed
  const report = await getReportData(county, year, month)
  if (report.total === 0) notFound()
  const meta = COUNTY_META[county]
  const monthYear = formatMonthYear(year, month)

  const pctChange =
    report.prevTotal != null && report.prevTotal > 0
      ? Math.round(((report.total - report.prevTotal) / report.prevTotal) * 100)
      : null

  const maxZipCount = report.byZip[0]?.count ?? 1
  const topType = report.byType[0]
  const totalTyped = report.byType.reduce((s, t) => s + t.count, 0)

  const allCountyMonths = await getCountyMonths(county)
  const otherMonths = allCountyMonths.filter(m => !(m.year === year && m.month === month))

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Logo color={FOREST} />
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Sign in</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          <Link
            href="/reports"
            className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            ← All reports
          </Link>
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide"
            style={{ backgroundColor: '#f0f7ee', color: FOREST }}
          >
            {meta.fullName} · Monthly Report
          </span>
        </div>
        <h1
          className="text-4xl font-black text-gray-900"
          style={{ fontFamily: PLAYFAIR }}
        >
          {monthYear} Building Permits
        </h1>
        <p className="mt-4 text-gray-500">
          Official permit data from {meta.display} — updated Mon, Wed &amp; Fri from the county permitting office.
        </p>
      </section>

      {/* Key metrics */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Permits issued" value={report.total.toLocaleString()} />
          <MetricCard
            label="vs. prior month"
            value={pctChange != null ? `${pctChange > 0 ? '+' : ''}${pctChange}%` : '—'}
            valueClass={
              pctChange == null ? 'text-gray-400'
              : pctChange >= 0 ? 'text-green-600'
              : 'text-red-500'
            }
            sub={report.prevTotal != null ? `${report.prevTotal.toLocaleString()} last month` : undefined}
          />
          <MetricCard
            label="Most active zip"
            value={report.byZip[0]?.zip ?? '—'}
            sub={report.byZip[0] ? `${report.byZip[0].count} permits` : undefined}
          />
          <MetricCard
            label="Top permit type"
            value={topType?.type ?? '—'}
            sub={
              topType && totalTyped > 0
                ? `${Math.round((topType.count / totalTyped) * 100)}% of total`
                : undefined
            }
          />
        </div>
      </section>

      {/* Zip code breakdown */}
      {report.byZip.length > 0 && (
        <section className="hero-pattern py-14">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Permit activity by zip code</h2>
            <p className="text-sm text-gray-500 mb-8">Top 10 zip codes by permit volume — {monthYear}</p>
            <div className="space-y-5">
              {report.byZip.map(row => (
                <div key={row.zip} className="flex items-center gap-4">
                  <span className="w-16 text-sm font-mono text-gray-700 flex-shrink-0">{row.zip}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${Math.max(3, (row.count / maxZipCount) * 100)}%`,
                        backgroundColor: FOREST,
                      }}
                    />
                  </div>
                  <span className="w-10 text-sm font-semibold text-gray-900 text-right flex-shrink-0">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Permit type breakdown */}
      {report.byType.length > 0 && (
        <section className="py-14">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Permits by type</h2>
            <p className="text-sm text-gray-500 mb-8">{monthYear} · {meta.fullName}</p>
            <div className="space-y-4">
              {report.byType.map(row => {
                const pct = totalTyped > 0 ? Math.round((row.count / totalTyped) * 100) : 0
                return (
                  <div key={row.type} className="flex items-center gap-4">
                    <span className="w-44 text-sm text-gray-700 truncate flex-shrink-0">{row.type}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${Math.max(3, pct)}%`,
                          backgroundColor: FOREST,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <span className="w-20 text-sm text-gray-500 text-right flex-shrink-0">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Other months for this county */}
      <section className="hero-pattern py-12 border-t border-stone-200">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Other months — {meta.display}
          </h2>
          <div className="flex flex-wrap gap-3">
            {otherMonths.map(({ year: y, month: m }) => (
              <Link
                key={buildSlug(county, y, m)}
                href={`/reports/${buildSlug(county, y, m)}`}
                className="border border-stone-200 px-4 py-2 rounded-full text-sm text-gray-600 transition-colors hover:border-[#2d5a27] hover:text-[#2d5a27]"
              >
                {formatMonthYear(y, m)}
              </Link>
            ))}
          </div>
          <div className="mt-5">
            <Link href="/reports" className="text-sm text-gray-500 hover:text-gray-700">
              View all counties →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6">
        <h2
          className="text-2xl font-black text-gray-900 mb-3"
          style={{ fontFamily: PLAYFAIR }}
        >
          Get alerted when new permits are filed in {meta.display}
        </h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          Pick your zip codes and permit types. We'll email you every Monday, Wednesday, and Friday.
        </p>
        <Link
          href="/login"
          className="text-white px-10 py-3 rounded-lg font-semibold text-sm inline-block transition-opacity hover:opacity-90"
          style={{ backgroundColor: FOREST }}
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

function MetricCard({
  label,
  value,
  valueClass = 'text-gray-900',
  sub,
}: {
  label: string
  value: string
  valueClass?: string
  sub?: string
}) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: '#f0f7ee' }}>
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}
