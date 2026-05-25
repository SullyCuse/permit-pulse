'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Logo } from '@/components/Logo'
import { LOCATIONS } from '@/lib/locations'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Logo />
        <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          Hall · Gwinnett · Forsyth · Savannah · Alpharetta, GA · Updated Mon, Wed &amp; Fri
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Be first on every permit<br />filed in your market.
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          Permit Pulse monitors every building permit filed across Hall, Gwinnett &amp; Forsyth County — plus Savannah and Alpharetta — and sends Pro subscribers a permit digest every Monday, Wednesday, and Friday when new filings match their zip codes.
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
              { step: '2', title: 'We monitor for you', desc: 'Our system checks Hall, Gwinnett, and Forsyth County — and the cities of Savannah and Alpharetta — for new filings automatically each week.' },
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

      {/* Pricing */}
      <section id="pricing" className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">One subscription. Every permit in your market.</h2>
        <p className="text-center text-gray-500 mb-12">Less than the profit on a single lead. No contracts. Cancel anytime.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <PricingCard
            name="Basic"
            price={29}
            description="Perfect for contractors focused on one area."
            features={['Hall, Gwinnett & Forsyth County + Savannah & Alpharetta', 'Permit feed dashboard', 'Up to 3 zip codes']}
            highlight={false}
          />
          <PricingCard
            name="Pro"
            price={49}
            description="For investors and teams tracking more territory."
            features={['Hall, Gwinnett & Forsyth County + Savannah & Alpharetta', 'Permit digest emails (Mon, Wed & Fri)', 'Unlimited zip codes']}
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
                a: 'We pull directly from the official public records of Hall, Gwinnett, and Forsyth County — and the cities of Savannah and Alpharetta — updated Monday, Wednesday, and Friday.',
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
                a: 'Yes — we recently added the cities of Savannah and Alpharetta and are actively expanding. Pro subscribers get early access to new areas.',
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
        <p className="text-gray-500 mb-8 text-sm">We cover 5 Georgia counties and cities. Click an area to see what's being built.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {LOCATIONS.map(loc => (
            <Link
              key={loc.slug}
              href={`/${loc.slug}`}
              className="border border-gray-200 hover:border-blue-400 hover:text-blue-600 px-5 py-2.5 rounded-full text-sm text-gray-600 transition-colors font-medium"
            >
              {loc.fullName}
            </Link>
          ))}
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
        <p className="text-gray-500 mb-8">Join contractors and investors already tracking permits across Hall, Gwinnett, and Forsyth County — and the cities of Savannah and Alpharetta.</p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-medium text-sm">
          Get started today
        </Link>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Permit Pulse · <a href="mailto:kevin@kpsullivan.com" className="hover:text-gray-600">Contact</a>
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
