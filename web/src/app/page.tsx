'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Logo } from '@/components/Logo'
import { ContactModal } from '@/components/ContactModal'
import { LOCATIONS } from '@/lib/locations'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Logo />
        <div className="flex items-center gap-6">
          <Link href="/reports" className="text-sm text-gray-600 hover:text-gray-900">Reports</Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          Hall · Gwinnett · Forsyth · DeKalb · Bryan · Savannah · Alpharetta · Johns Creek · Augusta · Atlanta · Sandy Springs · Cherokee County, GA · Updated Mon, Wed &amp; Fri
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Be first on every permit<br />filed in your market.
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          Permit Pulse monitors every building permit filed across Hall, Gwinnett, Forsyth, DeKalb &amp; Bryan County — plus Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, and Cherokee County — and sends Pro subscribers a permit digest every Monday, Wednesday, and Friday when new filings match their zip codes.
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
            { value: '12 Areas', label: 'GA counties & cities covered' },
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
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">In real estate and construction, timing is everything. Permit Pulse puts the data in your hands before your competition even knows to look.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🔨',
              title: 'Contractors & Builders',
              desc: 'A new permit is a new job opportunity. Get a digest of every residential and commercial permit filed in your service area three times a week — and show up to quote before anyone else does.',
            },
            {
              icon: '🏠',
              title: 'Real Estate Investors',
              desc: 'Spot neighborhoods heating up before they hit Zillow. Track new construction, additions, and remodels by zip code to find your next deal while others are still guessing.',
            },
            {
              icon: '📋',
              title: 'Agents & Realtors',
              desc: 'Know which streets are growing before your clients do. Use permit data to prospect smarter, impress sellers, and have real answers about neighborhood development activity.',
            },
          ].map(item => (
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
              { step: '1', title: 'Set your watchlist', desc: 'Pick the zip codes and permit types you care about. Takes 60 seconds.' },
              { step: '2', title: 'We monitor for you', desc: 'Our system checks Hall, Gwinnett, Forsyth, DeKalb, Bryan, and Cherokee County — and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, and Sandy Springs — for new filings automatically each week.' },
              { step: '3', title: 'Get your permit digest', desc: 'Pro subscribers receive an email digest every Monday, Wednesday, and Friday with every new permit matching their zip codes — address, type, and value included.' },
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

      {/* Dashboard Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Here's what you'll see inside</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">Real-time permit data, filterable by county and type. Here's a preview of the dashboard you get after signing up.</p>
          </div>

          {/* Mock dashboard chrome */}
          <div className="rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            {/* Mock header bar */}
            <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
              <Logo />
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">you@example.com</span>
                <span className="text-xs text-gray-300 border border-gray-200 rounded px-2 py-0.5">Sign out</span>
              </div>
            </div>

            <div className="bg-gray-50 p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Permit feed */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Recent Permits</h3>
                    <span className="text-xs text-gray-400">10,240 total</span>
                  </div>

                  {/* Search bar */}
                  <div className="relative mb-3">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <div className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-white shadow-sm text-gray-400">
                      Search by address or permit number…
                    </div>
                  </div>

                  {/* County tabs */}
                  <div className="flex gap-1 overflow-x-hidden mb-3 bg-gray-100 p-1 rounded-lg">
                    {['All', 'Hall', 'Gwinnett', 'Forsyth', 'DeKalb', 'Atlanta'].map((county, i) => (
                      <div key={county} className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap flex-shrink-0 ${i === 0 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                        {county}
                      </div>
                    ))}
                  </div>

                  {/* Permit cards */}
                  <div className="relative">
                    <div className="space-y-2.5">
                      <MockPermitCard
                        type="Residential - New Construction"
                        status="Issued"
                        statusStyle="bg-blue-50 text-blue-700"
                        number="BP-2025-04821"
                        county="Hall"
                        address="412 Ridgecrest Dr, Gainesville, 30501"
                        description="New single-family residence, 2,850 sq ft, 3 bed/2 bath with attached garage"
                        contractor="Lakeside Home Builders LLC"
                        date="May 21, 2025"
                        value="$385,000"
                      />
                      <MockPermitCard
                        type="Electrical"
                        status="Approved"
                        statusStyle="bg-blue-50 text-blue-700"
                        number="EP-2025-01193"
                        county="Gwinnett"
                        address="887 Peachtree Industrial Blvd, Suwanee, 30024"
                        description="200A service upgrade, panel replacement, EV charger installation"
                        contractor="PowerUp Electric Co"
                        date="May 20, 2025"
                        value="$8,400"
                      />
                      <MockPermitCard
                        type="Commercial - Renovation"
                        status="In Review"
                        statusStyle="bg-yellow-50 text-yellow-700"
                        number="CP-2025-00762"
                        county="Forsyth"
                        address="1540 Market Place Blvd, Cumming, 30041"
                        description="Interior build-out for new retail tenant, 3,200 sq ft, includes new MEP"
                        contractor="Cornerstone Commercial Group"
                        date="May 19, 2025"
                        value="$142,000"
                      />
                      <MockPermitCard
                        type="HVAC"
                        status="Finaled"
                        statusStyle="bg-green-50 text-green-700"
                        number="HP-2025-03340"
                        county="DeKalb County"
                        address="2209 Briarcliff Rd NE, Atlanta, 30329"
                        description="Replace existing 4-ton split system, gas furnace and AC unit"
                        contractor="Cool Comfort HVAC Services"
                        date="May 17, 2025"
                        value="$12,500"
                      />
                    </div>

                    {/* Fade + CTA overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent flex items-end justify-center pb-4">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900 mb-1">10,000+ permits tracked across Georgia</p>
                        <p className="text-xs text-gray-500 mb-3">Subscribe to unlock the full feed and email alerts.</p>
                        <Link href="#pricing" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
                          See plans →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">My Watchlist</h3>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <ul className="space-y-2 mb-3">
                      {['30501', '30024', '30041', '30329'].map(zip => (
                        <li key={zip} className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          {zip}
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-gray-100 pt-3 space-y-2">
                      <div className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-300 bg-gray-50">
                        Add zip code (e.g. 30501)
                      </div>
                      <div className="w-full text-xs bg-blue-600 text-white py-2 rounded-lg font-medium text-center opacity-60">
                        Add to watchlist
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
            description="Perfect for contractors focused on one area."
            features={['Hall, Gwinnett, Forsyth, DeKalb & Bryan County + Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs & Cherokee County', 'Permit feed dashboard', 'Up to 3 zip codes']}
            highlight={false}
          />
          <PricingCard
            name="Pro"
            price={49}
            description="For investors and teams tracking more territory."
            features={['Hall, Gwinnett, Forsyth, DeKalb & Bryan County + Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs & Cherokee County', 'Permit digest emails (Mon, Wed & Fri)', 'Unlimited zip codes']}
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
                q: 'Where does the permit data come from?',
                a: 'We pull directly from the official public records of Hall, Gwinnett, Forsyth, DeKalb, Bryan, and Cherokee County — and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, and Sandy Springs — updated Monday, Wednesday, and Friday.',
              },
              {
                q: 'How quickly will I get alerted?',
                a: 'Within minutes of our Monday scrape completing. You\'ll have the data before most people check their email.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. No contracts, no cancellation fees. Cancel from your dashboard at any time.',
              },
              {
                q: 'Will you add more areas?',
                a: 'Yes — we recently added Sandy Springs and Cherokee County and are actively expanding. Pro subscribers get early access to new areas.',
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

      {/* Browse by area */}
      <section className="py-16 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Browse permits by area</h2>
        <p className="text-gray-500 mb-8 text-sm">We cover 12 Georgia counties and cities. Click an area to see what's being built.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {LOCATIONS.map(loc => (
            <Link
              key={loc.slug}
              href={`/${loc.slug}`}
              className="px-5 py-2.5 rounded-full text-sm transition-colors font-medium border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
            >
              {loc.fullName}
            </Link>
          ))}
        </div>
      </section>

      {/* Monthly reports */}
      <section className="bg-gray-50 border-y border-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Free · No account needed</div>
            <h2 className="text-xl font-bold text-gray-900">Monthly permit activity reports</h2>
            <p className="text-gray-500 text-sm mt-1 max-w-md">
              See where construction is happening across Georgia — top zip codes, permit types, and month-over-month trends.
            </p>
          </div>
          <Link
            href="/reports"
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm"
          >
            Browse reports →
          </Link>
        </div>
      </section>

      {/* County Request */}
      <section className="py-16 max-w-xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Don't see your area?</h2>
        <p className="text-gray-500 mb-8 text-sm">Tell us where you work and we'll prioritize adding it.</p>
        <CountyRequestForm />
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to stay ahead?</h2>
        <p className="text-gray-500 mb-8">Join contractors and investors already tracking permits across Hall, Gwinnett, Forsyth, DeKalb, Bryan, and Cherokee County — and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, and Sandy Springs.</p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-medium text-sm">
          Get started today
        </Link>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Permit Pulse · <ContactModal />
      </footer>
    </div>
  )
}

function CountyRequestForm() {
  return (
    <Suspense>
      <CountyRequestFormInner />
    </Suspense>
  )
}

function CountyRequestFormInner() {
  const params = useSearchParams()
  const status = params.get('county_request')

  if (status === 'thanks') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-5 text-green-800 text-sm font-medium">
        Thanks! We'll let you know when that county is available.
      </div>
    )
  }

  return (
    <form action="/api/county-request" method="POST" className="flex flex-col gap-3">
      <input
        name="county"
        required
        placeholder="County name (e.g. Forsyth County, GA)"
        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        name="email"
        type="email"
        placeholder="Your email (optional — we'll notify you when it's live)"
        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {status === 'invalid' && (
        <p className="text-red-500 text-xs">Please enter a valid county name.</p>
      )}
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium"
      >
        Request this county
      </button>
    </form>
  )
}

function MockPermitCard({ type, status, statusStyle, number, county, address, description, contractor, date, value }: {
  type: string; status: string; statusStyle: string; number: string; county: string
  address: string; description: string; contractor: string; date: string; value: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{type}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle}`}>{status}</span>
            <span className="text-xs text-gray-400">{number}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{county}</span>
          </div>
          <p className="text-xs font-medium text-gray-900">{address}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{description}</p>
          <p className="text-xs text-gray-400 mt-1"><span className="font-medium text-gray-500">Contractor:</span> {contractor}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400">{date}</p>
          <p className="text-xs font-medium text-gray-700 mt-0.5">{value}</p>
        </div>
      </div>
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
