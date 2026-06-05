'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Logo } from '@/components/Logo'
import { ContactModal } from '@/components/ContactModal'
import { LOCATIONS } from '@/lib/locations'
import { GeorgiaMap } from '@/components/GeorgiaMap'

const FOREST = '#2d5a27'
const PLAYFAIR = 'var(--font-playfair), Georgia, serif'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Logo color={FOREST} />
          <div className="hidden md:flex items-center gap-8">
            <Link href="/reports" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Reports</Link>
            <a href="#pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Sign in</Link>
            <Link
              href="/login"
              className="text-white text-sm px-5 py-2.5 rounded-lg font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: FOREST }}
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — full-bleed aerial photo with left gradient overlay */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1448630360428-65456885c650?w=1400&q=85"
            alt="Aerial view of residential neighborhood"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(250,249,246,0.97) 45%, rgba(250,249,246,0.35) 100%)' }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-28">
          <div className="max-w-xl">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 mb-6 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Updated Mon · Wed · Fri</span>
            </div>

            <h1
              className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 mb-6"
              style={{ fontFamily: PLAYFAIR }}
            >
              Every permit.<br />Every market.<br />
              <span style={{ color: FOREST }}>First in your inbox.</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Real-time building permit intelligence for the Georgia professionals who can't afford to be second.
            </p>

            <div className="flex gap-3 flex-wrap">
              <Link
                href="/login"
                className="text-white px-8 py-4 rounded-xl font-semibold text-sm shadow-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: FOREST }}
              >
                Browse permits free →
              </Link>
              <a
                href="#pricing"
                className="bg-white border border-stone-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-colors"
              >
                View pricing
              </a>
            </div>

            {/* Stat pills */}
            <div className="flex gap-4 mt-10 flex-wrap">
              {[
                { value: '40,000+', label: 'permits tracked' },
                { value: '25', label: 'GA markets' },
                { value: '3×/wk', label: 'fresh data' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/80 backdrop-blur-sm border border-stone-200 rounded-xl px-4 py-2.5">
                  <span className="text-xl font-black text-gray-900">{stat.value}</span>
                  <span className="text-xs text-gray-500 block">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for — alternating horizontal persona cards */}
      <section className="hero-pattern py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2
              className="text-4xl font-black text-gray-900 mb-4"
              style={{ fontFamily: PLAYFAIR }}
            >
              Who's using Permit Pulse?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Three different professionals. One shared advantage: knowing what's happening before everyone else.
            </p>
          </div>

          <div className="space-y-6">
            <PersonaCard
              side="left"
              imageUrl="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80"
              imageAlt="Contractor reviewing blueprints on job site"
              emoji="🔨"
              audience="Contractors & Builders"
              headline="Land more jobs, faster."
              body="A new permit is a new job opportunity. Get a digest of every residential and commercial permit in your service area three times a week — and show up to quote before the competition even knows to call."
              stats={[
                { value: '3×', label: 'per week' },
                { value: 'ZIP', label: 'code alerts' },
                { value: '25', label: 'GA markets' },
              ]}
            />
            <PersonaCard
              side="right"
              imageUrl="https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=500&q=80"
              imageAlt="Investor reviewing real estate charts and documents"
              emoji="📈"
              audience="Real Estate Investors"
              headline="Find deals before Zillow does."
              body="Spot neighborhoods heating up before they hit the market. Track new construction, additions, and remodels by zip code to find your next deal while others are still guessing at prices."
              stats={[
                { value: '40K+', label: 'permits' },
                { value: '∞', label: 'zip codes' },
                { value: '$$$', label: 'value data' },
              ]}
            />
            <PersonaCard
              side="left"
              imageUrl="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80"
              imageAlt="Real estate agent with clients viewing a property"
              emoji="🏡"
              audience="Agents & Realtors"
              headline="Know your market cold."
              body="Know which streets are growing before your clients do. Use permit data to prospect smarter, impress sellers with real development insights, and answer questions no other agent can."
              stats={[
                { value: 'Live', label: 'data feed' },
                { value: '25', label: 'markets' },
                { value: 'Free', label: 'to browse' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2
            className="text-4xl font-black text-center text-gray-900 mb-16"
            style={{ fontFamily: PLAYFAIR }}
          >
            Three steps. Zero hassle.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Set your watchlist', desc: 'Pick the zip codes and permit types you care about. Takes 60 seconds.' },
              { step: '2', title: 'We monitor for you', desc: 'Our system checks all 25 Georgia markets for new filings automatically — Monday, Wednesday, and Friday.' },
              { step: '3', title: 'Get your digest', desc: 'Pro subscribers receive a clean email digest with every matching permit — address, type, value, and contractor included.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div
                  className="w-14 h-14 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto mb-5 shadow-md"
                  style={{ backgroundColor: FOREST }}
                >
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="hero-pattern py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2
            className="text-4xl font-black text-gray-900 mb-3"
            style={{ fontFamily: PLAYFAIR }}
          >
            One subscription. Every permit.
          </h2>
          <p className="text-gray-500 mb-12">Less than the profit on a single lead. No contracts, no lock-in.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <PricingCard
              name="Basic"
              price={29}
              description="One area, full access."
              features={['All 25 Georgia markets', 'Full permit feed dashboard', 'Up to 3 zip codes']}
              highlight={false}
            />
            <PricingCard
              name="Pro"
              price={49}
              description="For teams tracking more territory."
              features={['All 25 Georgia markets', 'Email digest Mon, Wed & Fri', 'Unlimited zip codes']}
              highlight={true}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-6">
          <h2
            className="text-3xl font-black text-center text-gray-900 mb-10"
            style={{ fontFamily: PLAYFAIR }}
          >
            Common questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Where does the permit data come from?',
                a: 'We pull directly from the official public records of Hall, Gwinnett, Forsyth, DeKalb, Bryan, Cherokee, Effingham, Camden, Franklin, Fayette, and Henry County — and Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Conyers, Smyrna, Cartersville, Austell, Bainbridge, Gainesville, Oakwood, and Marietta — updated Monday, Wednesday, and Friday.',
              },
              {
                q: 'How quickly will I get alerted?',
                a: "Within minutes of our Monday, Wednesday, and Friday scrapes completing. You'll have the data before most people check their email.",
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. No contracts, no cancellation fees. Cancel from your dashboard at any time.',
              },
              {
                q: 'Will you add more areas?',
                a: 'Yes — we recently added Fayette County, Henry County, Marietta, and several other Georgia markets and are actively expanding. Pro subscribers get early access to new areas.',
              },
            ].map(item => (
              <div key={item.q} className="border-b border-stone-200 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by area */}
      <section className="hero-pattern py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2
              className="text-2xl font-black text-gray-900 mb-3"
              style={{ fontFamily: PLAYFAIR }}
            >
              Browse permits by area
            </h2>
            <p className="text-gray-500 text-sm">We cover 25 Georgia counties and cities. Click an area to see what's being built.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Map */}
            <div className="flex-shrink-0 w-56 md:w-64">
              <div className="relative">
                <GeorgiaMap />
                <div className="flex items-center gap-3 mt-2 justify-center">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: FOREST }} />
                    Tracked
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0 bg-[#dce8dc]" />
                    Not yet covered
                  </span>
                </div>
              </div>
            </div>
            {/* Pills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 flex-1">
              {LOCATIONS.map(loc => (
                <Link
                  key={loc.slug}
                  href={`/${loc.slug}`}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border border-stone-300 text-gray-600 hover:border-[#2d5a27] hover:text-[#2d5a27] bg-white transition-colors"
                >
                  {loc.fullName}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Monthly reports banner */}
      <section className="border-y border-stone-200 py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: FOREST }}>Free · No account needed</div>
            <h2 className="text-xl font-bold text-gray-900">Monthly permit activity reports</h2>
            <p className="text-gray-500 text-sm mt-1 max-w-md">
              See where construction is happening across Georgia — top zip codes, permit types, and month-over-month trends.
            </p>
          </div>
          <Link
            href="/reports"
            className="flex-shrink-0 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: FOREST }}
          >
            Browse reports →
          </Link>
        </div>
      </section>

      {/* County request */}
      <section className="py-16 max-w-xl mx-auto px-6 text-center">
        <h2
          className="text-2xl font-black text-gray-900 mb-3"
          style={{ fontFamily: PLAYFAIR }}
        >
          Don't see your area?
        </h2>
        <p className="text-gray-500 mb-8 text-sm">Tell us where you work and we'll prioritize adding it.</p>
        <CountyRequestForm />
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center px-6 hero-pattern">
        <h2
          className="text-4xl font-black text-gray-900 mb-4"
          style={{ fontFamily: PLAYFAIR }}
        >
          Ready to stay ahead?
        </h2>
        <p className="text-gray-500 mb-8 max-w-xl mx-auto">
          Join contractors, investors, and agents already tracking permits across 25 Georgia markets — from Metro Atlanta to the coast.
        </p>
        <Link
          href="/login"
          className="text-white px-10 py-3.5 rounded-xl font-semibold text-sm inline-block transition-opacity hover:opacity-90 shadow-lg"
          style={{ backgroundColor: FOREST }}
        >
          Get started today
        </Link>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Permit Pulse · <ContactModal />
      </footer>
    </div>
  )
}

// ─── Persona Card ────────────────────────────────────────────────────────────

function PersonaCard({
  side, imageUrl, imageAlt, emoji, audience, headline, body, stats,
}: {
  side: 'left' | 'right'
  imageUrl: string
  imageAlt: string
  emoji: string
  audience: string
  headline: string
  body: string
  stats: { value: string; label: string }[]
}) {
  const image = (
    <div className={`relative md:w-72 h-56 md:h-auto flex-shrink-0 overflow-hidden`}>
      <img src={imageUrl} alt={imageAlt} className="w-full h-full object-cover" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundColor: FOREST }} />
    </div>
  )

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:-translate-y-1 transition-transform duration-200" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 16px 32px rgba(0,0,0,0.05)' }}>
      <div className={`flex flex-col ${side === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        {image}
        <div className="p-8 flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: '#f0f7ee' }}>
              {emoji}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: FOREST }}>{audience}</span>
          </div>
          <h3
            className="text-2xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: PLAYFAIR }}
          >
            {headline}
          </h3>
          <p className="text-gray-500 leading-relaxed mb-6 text-sm">{body}</p>
          <div className="flex gap-4">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl px-3 py-2 text-center" style={{ backgroundColor: '#f0f7ee' }}>
                <div className="font-bold text-lg" style={{ color: FOREST }}>{s.value}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Pricing Card ────────────────────────────────────────────────────────────

function PricingCard({ name, price, description, features, highlight }: {
  name: string
  price: number
  description: string
  features: string[]
  highlight: boolean
}) {
  if (highlight) {
    return (
      <div className="rounded-2xl p-8 text-left relative shadow-xl text-white" style={{ backgroundColor: FOREST }}>
        <span className="absolute -top-3 left-6 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#b8860b', color: 'white' }}>
          Most Popular
        </span>
        <h3 className="text-xl font-bold mt-2">{name}</h3>
        <p className="text-green-200 text-sm mt-1 mb-5">{description}</p>
        <div className="mb-6">
          <span className="text-4xl font-black">${price}</span>
          <span className="text-green-300 text-sm">/mo</span>
        </div>
        <ul className="space-y-2.5 mb-8">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-green-100">
              <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              {f}
            </li>
          ))}
        </ul>
        <Link
          href="/login"
          className="block w-full text-center py-3 rounded-xl font-semibold text-sm bg-white hover:bg-green-50 transition-colors"
          style={{ color: FOREST }}
        >
          Get started
        </Link>
      </div>
    )
  }

  return (
    <div className="border border-stone-200 rounded-2xl p-8 text-left bg-white hover:border-stone-300 transition-colors shadow-sm">
      <h3 className="text-xl font-bold mt-2 text-gray-900">{name}</h3>
      <p className="text-gray-500 text-sm mt-1 mb-5">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-black text-gray-900">${price}</span>
        <span className="text-gray-400 text-sm">/mo</span>
      </div>
      <ul className="space-y-2.5 mb-8">
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
        className="block w-full text-center py-3 rounded-xl text-sm font-semibold border-2 border-stone-200 hover:bg-stone-50 text-gray-700 transition-colors"
      >
        Get started
      </Link>
    </div>
  )
}

// ─── County Request Form ─────────────────────────────────────────────────────

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
        className="border border-stone-300 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 bg-white"
        style={{ ['--tw-ring-color' as string]: FOREST } as React.CSSProperties}
      />
      <input
        name="email"
        type="email"
        placeholder="Your email (optional — we'll notify you when it's live)"
        className="border border-stone-300 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 bg-white"
      />
      {status === 'invalid' && (
        <p className="text-red-500 text-xs">Please enter a valid county name.</p>
      )}
      <button
        type="submit"
        className="text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: FOREST }}
      >
        Request this county
      </button>
    </form>
  )
}
