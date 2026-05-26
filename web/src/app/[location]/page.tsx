import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { LOCATIONS, getLocation } from '@/lib/locations'
import { COUNTY_META, getAllMonths, buildSlug, formatMonthYear } from '@/lib/reports'

export function generateStaticParams() {
  return LOCATIONS.map(l => ({ location: l.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ location: string }> }
): Promise<Metadata> {
  const { location } = await params
  const loc = getLocation(location)
  if (!loc) return {}
  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
  }
}

export default async function LocationPage(
  { params }: { params: Promise<{ location: string }> }
) {
  const { location } = await params
  const loc = getLocation(location)
  if (!loc) notFound()

  const [headlineLine1, headlineLine2] = loc.headline.split('\n')

  // Find the county key matching this location (e.g. 'Gwinnett')
  const countyKey = Object.keys(COUNTY_META).find(k =>
    COUNTY_META[k].display.toLowerCase() === loc.name.toLowerCase()
  )
  const latestMonth = getAllMonths()[0]
  const latestReportSlug = countyKey ? buildSlug(countyKey, latestMonth.year, latestMonth.month) : null
  const latestReportLabel = formatMonthYear(latestMonth.year, latestMonth.month)

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/"><Logo /></Link>
        <div className="flex items-center gap-6">
          <Link href="/reports" className="text-sm text-gray-600 hover:text-gray-900">Reports</Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          {loc.fullName} · Updated Mon, Wed &amp; Fri
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          {headlineLine1}<br />{headlineLine2}
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          {loc.subheadline}
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-sm">
            Browse free permits
          </Link>
          <a href="#pricing" className="border border-gray-300 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium text-sm text-gray-700">
            See pricing
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-4 text-center">
          {[
            { value: '10,000+', label: 'Permits tracked' },
            { value: '3x / Week', label: 'Mon, Wed & Fri updates' },
            { value: '5 Areas', label: 'GA counties & cities covered' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Built for the people who move first.</h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          In real estate and construction, timing is everything. Permit Pulse puts {loc.name} permit data in your hands before your competition even knows to look.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loc.personas.map(item => (
            <div key={item.title} className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { step: '1', title: 'Set your watchlist', desc: `Pick the zip codes and permit types you care about in ${loc.name}. Takes 60 seconds.` },
              { step: '2', title: 'We monitor for you', desc: `Our system checks ${loc.name} for new permit filings automatically every Monday, Wednesday, and Friday.` },
              { step: '3', title: 'Get your permit digest', desc: `Pro subscribers receive an email digest every Monday, Wednesday, and Friday with every new ${loc.name} permit matching their zip codes — address, type, and value included.` },
            ].map(item => (
              <div key={item.step}>
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">One subscription. Every permit in your market.</h2>
        <p className="text-center text-gray-500 mb-12">Less than the profit on a single lead. No contracts. Cancel anytime.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <PricingCard
            name="Basic"
            price={29}
            description={`Perfect for professionals focused on ${loc.name}.`}
            features={[`${loc.name} permit feed dashboard`, 'Up to 3 zip codes', 'All permit types']}
            highlight={false}
          />
          <PricingCard
            name="Pro"
            price={49}
            description="For investors and teams tracking more territory."
            features={[`${loc.name} permit digest emails (Mon, Wed & Fri)`, 'Unlimited zip codes', 'All 5 GA areas covered']}
            highlight={true}
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Common questions</h2>
          <div className="space-y-6">
            {[
              {
                q: `Where does the ${loc.name} permit data come from?`,
                a: loc.faqWhere,
              },
              {
                q: 'How quickly will I get alerted?',
                a: 'Pro subscribers receive a digest every Monday, Wednesday, and Friday after our system runs. You\'ll have the data the same day it\'s pulled.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. No contracts, no cancellation fees. Cancel from your dashboard at any time.',
              },
              {
                q: 'Do you cover other areas besides ' + loc.name + '?',
                a: loc.faqAreas,
              },
            ].map(item => (
              <div key={item.q} className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest report callout */}
      {latestReportSlug && (
        <section className="bg-gray-50 border-y border-gray-100 py-10">
          <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Free · No account needed</div>
              <p className="text-gray-900 font-semibold">
                {latestReportLabel} permit report — {loc.name}
              </p>
              <p className="text-gray-500 text-sm mt-0.5">Top zip codes, permit types, and month-over-month trends.</p>
            </div>
            <Link
              href={`/reports/${latestReportSlug}`}
              className="flex-shrink-0 border border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              View report →
            </Link>
          </div>
        </section>
      )}

      {/* Other locations */}
      <section className="py-16 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Also available in</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {LOCATIONS.filter(l => l.slug !== loc.slug).map(l => (
            <Link
              key={l.slug}
              href={`/${l.slug}`}
              className="border border-gray-200 hover:border-blue-400 hover:text-blue-600 px-4 py-2 rounded-full text-sm text-gray-600 transition-colors"
            >
              {l.fullName}
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to move first in {loc.name}?</h2>
        <p className="text-gray-500 mb-8">Join contractors, investors, and agents already tracking permits across Georgia.</p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-medium text-sm">
          Browse free permits
        </Link>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Permit Pulse · <a href="mailto:kevin@kpsullivan.com" className="hover:text-gray-600">Contact</a>
      </footer>
    </div>
  )
}

function PricingCard({ name, price, description, features, highlight }: {
  name: string
  price: number
  description: string
  features: string[]
  highlight: boolean
}) {
  return (
    <div className={`rounded-2xl border-2 p-8 transition-shadow hover:shadow-lg ${highlight ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'}`}>
      {highlight && (
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Most popular</span>
      )}
      <h3 className="text-xl font-bold mt-2 text-gray-900">{name}</h3>
      <p className="text-gray-500 text-sm mt-1 mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-gray-400 text-sm">/mo</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={`block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
          highlight
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
        }`}
      >
        Get started
      </Link>
    </div>
  )
}
