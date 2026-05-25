import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import SubscribeButton from './SubscribeButton'
import { Logo } from '@/components/Logo'

const PAGE_SIZE = 50
const COUNTIES = ['All', 'Hall', 'Gwinnett', 'Forsyth', 'Savannah', 'Alpharetta'] as const

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ county?: string; page?: string; type?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const activeCounty = COUNTIES.includes(params.county as any) ? params.county! : 'All'
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  // Fetch user subscription status
  const { data: userData } = await supabase
    .from('users')
    .select('is_active, plan')
    .eq('auth_id', user.id)
    .single()

  const isActive = userData?.is_active ?? false
  const pageSize = isActive ? PAGE_SIZE : 2

  // Fetch permits (admin client bypasses RLS — permits are public county data)
  const admin = createAdminClient()

  // Fetch distinct permit types for the active county filter via RPC (index-backed, returns only type strings)
  const { data: typeRows } = await admin.rpc('get_permit_types', {
    p_county: activeCounty !== 'All' ? activeCounty : null,
  })
  const permitTypes = ['All', ...((typeRows ?? []) as { permit_type: string }[]).map(r => r.permit_type)]
  const activeType = permitTypes.includes(params.type ?? '') ? params.type! : 'All'

  let query = admin
    .from('permits')
    .select('*', { count: 'exact' })
    .order('date_filed', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (activeCounty !== 'All') {
    query = query.eq('county', activeCounty)
  }
  if (activeType !== 'All') {
    query = query.eq('permit_type', activeType)
  }

  const { data: permits, count: totalCount } = await query

  const totalPages = isActive ? Math.ceil((totalCount ?? 0) / pageSize) : 1

  // Fetch user's watchlist (admin client bypasses RLS — user already authenticated above)
  const { data: watchlist } = await admin
    .from('watchlists')
    .select('*')
    .eq('user_id', user.id)

  function filterHref(county: string, type: string, p = 1) {
    const q = new URLSearchParams()
    if (county !== 'All') q.set('county', county)
    if (type !== 'All') q.set('type', type)
    if (p > 1) q.set('page', String(p))
    const qs = q.toString()
    return `/dashboard${qs ? `?${qs}` : ''}`
  }

  function countyHref(county: string, p = 1) {
    return filterHref(county, 'All', p)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <form action="/auth/signout" method="POST">
              <button className="text-sm text-gray-500 hover:text-gray-900">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      {!isActive && (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-blue-900">Start your subscription to get permit alerts</p>
              <p className="text-sm text-blue-700 mt-0.5">Choose a plan to unlock email alerts and full access.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <div className="w-32">
                <SubscribeButton plan="basic" label="Basic — $29/mo" highlight={false} />
              </div>
              <div className="w-32">
                <SubscribeButton plan="pro" label="Pro — $49/mo" highlight={true} />
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Permit feed */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Permits</h2>
            <span className="text-sm text-gray-400">{totalCount?.toLocaleString() ?? 0} total</span>
          </div>

          {/* County filter tabs — subscribers only */}
          {isActive && (
            <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-lg w-fit">
              {COUNTIES.map(county => (
                <Link
                  key={county}
                  href={countyHref(county)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeCounty === county
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {county}
                </Link>
              ))}
            </div>
          )}

          {permits && permits.length > 0 ? (
            <>
              <div className="space-y-3">
                {permits.map((permit: any) => (
                  <PermitCard key={permit.id} permit={permit} />
                ))}
              </div>

              {/* Free user upsell */}
              {!isActive && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
                  <p className="text-sm font-medium text-blue-900">
                    Showing {permits?.length} of {totalCount?.toLocaleString()} permits
                  </p>
                  <p className="text-sm text-blue-700 mt-1 mb-4">Subscribe to unlock the full feed and email alerts.</p>
                  <div className="flex justify-center gap-3">
                    <div className="w-32">
                      <SubscribeButton plan="basic" label="Basic — $29/mo" highlight={false} />
                    </div>
                    <div className="w-32">
                      <SubscribeButton plan="pro" label="Pro — $49/mo" highlight={true} />
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <span className="text-sm text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Link
                        href={filterHref(activeCounty, activeType, page - 1)}
                        className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
                      >
                        ← Previous
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link
                        href={filterHref(activeCounty, activeType, page + 1)}
                        className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
                      >
                        Next →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              No permits found yet.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Watchlist */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Watchlist</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {watchlist && watchlist.length > 0 && (watchlist as any[]).flatMap((w: any) => w.zip_codes ?? []).length > 0 ? (
                <ul className="space-y-2">
                  {(watchlist as any[]).flatMap((w: any) => w.zip_codes ?? []).map((zip: string) => (
                    <li key={zip} className="text-sm text-gray-600 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        {zip}
                      </div>
                      <form action="/api/watchlist" method="POST">
                        <input type="hidden" name="zip_code" value={zip} />
                        <input type="hidden" name="action" value="remove" />
                        <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors text-sm font-bold leading-none">✕</button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No watchlist zones yet.</p>
              )}
              <WatchlistForm userId={user.id} />
            </div>
          </div>

          {/* Permit type filter — subscribers only */}
          {isActive && <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Type</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <form method="GET" action="/dashboard" className="space-y-2">
                {activeCounty !== 'All' && (
                  <input type="hidden" name="county" value={activeCounty} />
                )}
                <select
                  name="type"
                  defaultValue={activeType}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {permitTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <button type="submit" className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                  Apply
                </button>
              </form>
              {activeType !== 'All' && (
                <Link
                  href={filterHref(activeCounty, 'All')}
                  className="mt-3 block text-xs text-center text-blue-600 hover:text-blue-800"
                >
                  Clear filter
                </Link>
              )}
            </div>
          </div>}
        </div>
      </main>
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  'Complete':  'bg-green-50 text-green-700',
  'Issued':    'bg-blue-50 text-blue-700',
  'Active':    'bg-blue-50 text-blue-700',
  'Expired':   'bg-red-50 text-red-600',
  'Voided':    'bg-red-50 text-red-600',
  'Pending':   'bg-yellow-50 text-yellow-700',
  'On Hold':   'bg-yellow-50 text-yellow-700',
}

function PermitCard({ permit }: { permit: any }) {
  const contractor = permit.raw_data?.contractor
  const estimatedValue = permit.raw_data?.estimated_value
  const permitStatus = permit.raw_data?.PermitStatus as string | undefined
  const filedDate = permit.date_filed
    ? new Date(permit.date_filed + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {permit.permit_type ?? 'Unknown type'}
            </span>
            {permitStatus && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[permitStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                {permitStatus}
              </span>
            )}
            <span className="text-xs text-gray-400">{permit.permit_number}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{permit.county}</span>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {permit.address ?? 'No address'}
            {permit.zip_code && !(permit.address ?? '').includes(permit.zip_code) ? `, ${permit.zip_code}` : ''}
          </p>
          {permit.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{permit.description}</p>
          )}
          {contractor && (
            <p className="text-xs text-gray-400 mt-1.5">
              <span className="font-medium text-gray-500">Contractor:</span> {contractor}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400">{filedDate}</p>
          {estimatedValue && (
            <p className="text-xs font-medium text-gray-700 mt-1">
              ${Number(estimatedValue).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function WatchlistForm({ userId }: { userId: string }) {
  return (
    <form className="mt-4 space-y-2" action="/api/watchlist" method="POST">
      <input type="hidden" name="user_id" value={userId} />
      <input
        name="zip_code"
        placeholder="Add zip code (e.g. 30501)"
        maxLength={5}
        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
      >
        Add to watchlist
      </button>
    </form>
  )
}
