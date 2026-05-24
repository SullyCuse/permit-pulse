import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-bold text-lg">Permit Pulse</span>
        <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          Hall County, GA · Updated every Monday
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Know about new permits<br />before your competition
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          Permit Pulse tracks every building permit filed in Hall County and sends you instant alerts when new filings match your zip codes — so you can be first on the job.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-sm">
            Get started
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
            { value: '83+', label: 'Permits tracked' },
            { value: 'Weekly', label: 'Monday updates' },
            { value: '5 min', label: 'Alert delivery' },
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
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Built for Hall County professionals</h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">Whether you're chasing new construction leads or tracking neighborhood development, Permit Pulse keeps you ahead.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🔨',
              title: 'Contractors & Builders',
              desc: 'Get notified the moment a new residential or commercial permit is filed in your service area. Beat competitors to the quote.',
            },
            {
              icon: '🏠',
              title: 'Real Estate Investors',
              desc: 'Spot development trends before they hit the market. Track new construction, additions, and remodels by zip code.',
            },
            {
              icon: '📊',
              title: 'Inspectors & Suppliers',
              desc: 'Know what\'s being built and where. Plan your schedule and sales calls around real permit data, not guesses.',
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
              { step: '2', title: 'We monitor for you', desc: 'Our system checks Hall County for new filings every Monday morning automatically.' },
              { step: '3', title: 'Get alerted instantly', desc: 'Receive a clear email alert the moment a matching permit is filed — with address, type, and value.' },
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
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Simple pricing</h2>
        <p className="text-center text-gray-500 mb-12">No contracts. Cancel anytime.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <PricingCard
            name="Basic"
            price={29}
            description="Perfect for contractors focused on one area."
            features={['Hall County coverage', 'Weekly digest email', 'Up to 3 zip codes', 'Permit feed dashboard']}
            highlight={false}
          />
          <PricingCard
            name="Pro"
            price={49}
            description="For investors and teams tracking more territory."
            features={['Hall County coverage', 'Instant alerts', 'Unlimited zip codes', 'Priority support']}
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
                a: 'We pull directly from Hall County\'s official public records, updated every Monday morning.',
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
                q: 'Will you add more counties?',
                a: 'Yes — Gwinnett, Forsyth, and Jackson are on the roadmap. Pro subscribers get early access.',
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

      {/* Bottom CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to stay ahead?</h2>
        <p className="text-gray-500 mb-8">Join contractors and investors already tracking Hall County permits.</p>
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
