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
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Know about new permits<br />before anyone else
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          Permit Pulse monitors Hall County building permits daily and alerts you the moment new filings match your watchlist.
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

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { step: '1', title: 'Set your watchlist', desc: 'Choose the zip codes and permit types you care about.' },
              { step: '2', title: 'We monitor daily', desc: 'Our scraper checks Hall County for new filings every Monday morning.' },
              { step: '3', title: 'Get alerted instantly', desc: 'Receive email alerts the moment a matching permit is filed.' },
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
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Simple pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <PricingCard
            name="Basic"
            price={29}
            features={['1 county', 'Daily digest email', 'Up to 3 zip codes', 'Permit feed dashboard']}
            highlight={false}
          />
          <PricingCard
            name="Pro"
            price={49}
            features={['5 counties', 'Instant alerts', 'Unlimited zip codes', 'Priority support']}
            highlight={true}
          />
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Permit Pulse
      </footer>
    </div>
  )
}

function PricingCard({ name, price, features, highlight }: {
  name: string
  price: number
  features: string[]
  highlight: boolean
}) {
  return (
    <div className={`rounded-2xl border-2 p-8 ${highlight ? 'border-blue-600' : 'border-gray-200'}`}>
      {highlight && (
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Most popular</span>
      )}
      <h3 className="text-xl font-bold mt-2 text-gray-900">{name}</h3>
      <div className="mt-4 mb-6">
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
        className={`block w-full text-center py-2.5 rounded-lg text-sm font-medium ${
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
