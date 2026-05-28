import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import SubscribeButton from './SubscribeButton'
import { Logo } from '@/components/Logo'

const PAGE_SIZE = 50
const COUNTIES = ['All', 'Hall', 'Gwinnett', 'Forsyth', 'Savannah', 'Alpharetta', 'Bryan County', 'DeKalb County', 'Augusta', 'Johns Creek'] as const

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ county?: string; page?: string; type?: string; error?: string; search?: string; sort?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const activeCounty = COUNTIES.includes(params.county as any) ? params.county! : 'All'
  const zipLimitReached = params.error === 'zip_limit'
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE
  const activeSearch = params.search?.trim() ?? ''
  const activeSort = params.sort === 'asc' ? 'asc' : 'desc'

  const admin = createAdminClient()

  const { data: userData } = await admin
    .from('users')
    .select('is_active, plan')
    .eq('auth_id', user.id)
    .single()

  const isActive = userData?.is_active ?? false
  const pageSize = isActive ? PAGE_SIZE : 5

  const { data: typeRows } = await admin.rpc('get_permit_types', {
    p_county: activeCounty !== 'All' ? activeCounty : null,
  })
  const permitTypes = ['All', ...((typeRows ?? []) as { permit_type: string }[]).map(r => r.permit_type)]
  const activeType = permitTypes.includes(params.type ?? '') ? params.type! : 'All'

  let query = admin
    .from('permits')
    .select('*', { count: 'exact' })
    .order('date_filed', { ascending: activeSort === 'asc' })
    .range(offset, offset + pageSize - 1)

  if (activeCounty !== 'All') query = query.eq('county', activeCounty)
  if (activeType !== 'All') query = query.eq('permit_type', activeType)
  if (activeSearch) {
    query = query.or(
      `address.ilike.%${activeSearch}%,permit_number.ilike.%${activeSearch}%`
    )
  }

  const { data: permits, count: totalCount } = await query

  const totalPages = isActive ? Math.ceil((totalCount ?? 0) / pageSize) : 1

  const { data: watchlist } = await admin
    .from('watchlists')
    .select('*')
    .eq('user_id', user.id)

  function buildHref(overrides: { county?: string; type?: string; page?: number; search?: string; sort?: string }) {
    const q = new URLSearchParams()
    const county = overrides.county ?? activeCounty
    const type = overrides.type ?? activeType
    const pg = overrides.page ?? 1
    const search = 'search' in overrides ? (overrides.search ?? '') : activeSearch
    const sort = overrides.sort ?? activeSort

    if (county !== 'All') q.set('county', county)
    if (type !== 'All') q.set('type', type)
    if (pg > 1) q.set('page', String(pg))
    if (search) q.set('search', search)
    if (sort === 'asc') q.set('sort', 'asc')
    const qs = q.toString()
    return `/dashboard${qs ? `?${qs}` : ''}`
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

          {/* Search bar */}
          <form method="GET" action="/dashboard" className="relative mb-3">
            {activeCounty !== 'All' && <input type="hidden" name="county" value={activeCounty} />}
            {activeType !== 'All' && <input type="hidden" name="type" value={activeType} />}
            {activeSort === 'asc' && <input type="hidden" name="sort" value="asc" />}
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              name="search"
              type="text"
              defaultValue={activeSearch}
              placeholder="Search by address or permit number…"
              className="w-full pl-9 pr-10 py-2 text-sm border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {activeSearch && (
              <Link
                href={buildHref({ search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </Link>
            )}
          </form>

          {/* County filter tabs — subscribers only, scrollable */}
          {isActive && (
            <div className="flex gap-1 overflow-x-auto mb-3 bg-gray-100 p-1 rounded-lg" style={{ scrollbarWidth: 'none' }}>
              {COUNTIES.map(county => (
                <Link
                  key={county}
                  href={buildHref({ county, type: 'All', page: 1 })}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
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

          {/* Type filter + sort toggle — subscribers only */}
          {isActive && (
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <form method="GET" action="/dashboard" className="flex items-center gap-0">
                {activeCounty !== 'All' && <input type="hidden" name="county" value={activeCounty} />}
                {activeSearch && <input type="hidden" name="search" value={activeSearch} />}
                {activeSort === 'asc' && <input type="hidden" name="sort" value="asc" />}
                <select
                  name="type"
                  defaultValue={activeType}
                  className="text-sm border border-gray-200 rounded-l-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 max-w-[220px] truncate"
                >
                  {permitTypes.map(type => (
                    <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="text-sm border border-l-0 border-gray-200 rounded-r-lg px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 font-medium"
                >
                  Apply
                </button>
                {activeType !== 'All' && (
                  <Link
                    href={buildHref({ type: 'All', page: 1 })}
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </Link>
                )}
              </form>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg flex-shrink-0">
                <Link
                  href={buildHref({ sort: 'desc', page: 1 })}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeSort === 'desc'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Newest
                </Link>
                <Link
                  href={buildHref({ sort: 'asc', page: 1 })}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeSort === 'asc'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  Oldest
                </Link>
              </div>
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
                        href={buildHref({ page: page - 1 })}
                        className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
                      >
                        ← Previous
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link
                        href={buildHref({ page: page + 1 })}
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
              {activeSearch ? `No permits found matching "${activeSearch}".` : 'No permits found yet.'}
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
              {zipLimitReached && (
                <p className="mt-3 text-xs text-red-600">Basic plan is limited to 3 zip codes. <a href="/dashboard" className="underline">Upgrade to Pro</a> for unlimited.</p>
              )}
              <WatchlistForm userId={user.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  'Complete':   'bg-green-50 text-green-700',
  'Finaled':    'bg-green-50 text-green-700',
  'Issued':     'bg-blue-50 text-blue-700',
  'Active':     'bg-blue-50 text-blue-700',
  'Approved':   'bg-blue-50 text-blue-700',
  'Expired':    'bg-red-50 text-red-600',
  'Voided':     'bg-red-50 text-red-600',
  'Cancelled':  'bg-red-50 text-red-600',
  'Pending':    'bg-yellow-50 text-yellow-700',
  'Applied':    'bg-yellow-50 text-yellow-700',
  'In Review':  'bg-yellow-50 text-yellow-700',
  'On Hold':    'bg-yellow-50 text-yellow-700',
}

// Normalize raw status strings from various county sources to display values
function normalizeStatus(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined
  const s = raw.trim()
  const lower = s.toLowerCase()
  if (lower.includes('final') || lower.includes('complet') || lower === 'cls') return 'Finaled'
  if (lower.includes('void') || lower.includes('cancel') || lower.includes('withdraw')) return 'Voided'
  if (lower.includes('expir') || lower.includes('lapse')) return 'Expired'
  if (lower.includes('hold')) return 'On Hold'
  if (lower.includes('approv') || lower === 'approved') return 'Approved'
  if (lower === 'issued' || lower === 'permit issued' || lower.includes('issue')) return 'Issued'
  if (lower === 'active' || lower === 'in progress') return 'Active'
  if (lower.includes('review') || lower.includes('plan check')) return 'In Review'
  if (lower.includes('pending') || lower === 'applied' || lower.includes('submit')) return 'Applied'
  // Return title-cased original if no match
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function PermitCard({ permit }: { permit: any }) {
  const contractor = permit.contractor_name
  const applicant = permit.applicant_name
  const estimatedValue = permit.raw_data?.estimated_value ?? permit.raw_data?.Permit_Value ?? permit.raw_data?.WORKCOST
  const rawStatus =
    permit.raw_data?.PermitStatus ??   // Forsyth, Savannah
    permit.raw_data?.PERMIT_STATUS ??  // Augusta
    permit.raw_data?.JobStatus ??      // Johns Creek
    permit.raw_data?.STATUS_CODE ??    // Alpharetta
    null
  const permitStatus = normalizeStatus(rawStatus)
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
          {applicant && (
            <p className="text-xs text-gray-400 mt-1">
              <span className="font-medium text-gray-500">Applicant:</span> {applicant}
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
          {permit.source_url && (
            <a
              href={permit.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700 mt-1 block"
            >
              View source →
            </a>
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
