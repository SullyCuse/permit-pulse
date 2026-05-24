import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM } from '@/lib/resend'
import { createAdminClient } from '@/lib/supabase/server'

function alertHtml(permit: {
  permit_number: string | null
  address: string | null
  zip_code: string | null
  permit_type: string | null
  description: string | null
  date_filed: string | null
  raw_data: Record<string, any> | null
}) {
  const estValue = permit.raw_data?.estimated_value
  const contractor = permit.raw_data?.contractor
  return `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#111">
  <h2 style="color:#2563eb">New Permit Alert — ${permit.zip_code ?? 'Hall County'}</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:6px 0;color:#6b7280;width:140px">Permit #</td><td style="padding:6px 0"><strong>${permit.permit_number ?? '—'}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Type</td><td style="padding:6px 0">${permit.permit_type ?? '—'}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Address</td><td style="padding:6px 0">${permit.address ?? '—'}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Filed</td><td style="padding:6px 0">${permit.date_filed ?? '—'}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Est. Value</td><td style="padding:6px 0">${estValue ? `$${Number(estValue).toLocaleString()}` : '—'}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Contractor</td><td style="padding:6px 0">${contractor ?? '—'}</td></tr>
    ${permit.description ? `<tr><td style="padding:6px 0;color:#6b7280">Description</td><td style="padding:6px 0">${permit.description}</td></tr>` : ''}
  </table>
  <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb">
  <p style="font-size:12px;color:#9ca3af">You're receiving this because you have a watchlist alert set up at <a href="${process.env.NEXT_PUBLIC_APP_URL}">Permit Pulse</a>.</p>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const runDate: string = body.run_date ?? new Date().toISOString().split('T')[0]

  const supabase = createAdminClient()

  const { data: permits, error: permitsError } = await supabase
    .from('permits')
    .select('id, permit_number, address, zip_code, permit_type, description, date_filed, raw_data')
    .eq('date_filed', runDate)

  if (permitsError) {
    console.error('send-alerts: permits query error:', permitsError)
    return NextResponse.json({ error: permitsError.message }, { status: 500 })
  }

  if (!permits?.length) {
    return NextResponse.json({ sent: 0, message: `No permits for ${runDate}` })
  }

  const { data: watchlists } = await supabase
    .from('watchlists')
    .select('user_id, zip_code, permit_types')

  if (!watchlists?.length) {
    return NextResponse.json({ sent: 0, message: 'No watchlists configured' })
  }

  const permitIds = (permits as { id: string }[]).map(p => p.id)
  const { data: alreadySentRaw } = await supabase
    .from('alert_log')
    .select('user_id, permit_id')
    .in('permit_id', permitIds)
    .eq('channel', 'email')

  const alreadySent = (alreadySentRaw ?? []) as { user_id: string; permit_id: string }[]
  const sentSet = new Set(alreadySent.map(a => `${a.user_id}:${a.permit_id}`))

  const userIds = [...new Set((watchlists as { user_id: string; zip_code: string; permit_types: string[] | null }[]).map(w => w.user_id))]
  const { data: usersRaw } = await supabase
    .from('users')
    .select('id, email, is_active')
    .in('id', userIds)
    .eq('is_active', true)

  type UserRow = { id: string; email: string; is_active: boolean }
  const userMap = new Map((usersRaw ?? [] as UserRow[]).map((u: UserRow) => [u.id, u]))

  let sent = 0
  const logEntries: { user_id: string; permit_id: string; channel: string; sent_at: string }[] = []

  type WatchlistRow = { user_id: string; zip_code: string; permit_types: string[] | null }
  type PermitRow = { id: string; permit_number: string | null; address: string | null; zip_code: string | null; permit_type: string | null; description: string | null; date_filed: string | null; raw_data: Record<string, any> | null }

  for (const watchlist of watchlists as WatchlistRow[]) {
    const user = userMap.get(watchlist.user_id) as UserRow | undefined
    if (!user?.email) continue

    for (const permit of permits as PermitRow[]) {
      if (permit.zip_code !== watchlist.zip_code) continue

      if (watchlist.permit_types && watchlist.permit_types.length > 0 && !watchlist.permit_types.includes(permit.permit_type ?? '')) continue

      const key = `${watchlist.user_id}:${permit.id}`
      if (sentSet.has(key)) continue

      try {
        await resend.emails.send({
          from: FROM,
          to: user.email,
          subject: `New ${permit.permit_type ?? 'permit'} in ${permit.zip_code} — Permit Pulse`,
          html: alertHtml(permit),
        })
        logEntries.push({ user_id: watchlist.user_id, permit_id: permit.id, channel: 'email', sent_at: new Date().toISOString() })
        sentSet.add(key)
        sent++
      } catch (err: any) {
        console.error(`send-alerts: failed to email ${user.email}:`, err.message)
      }
    }
  }

  if (logEntries.length > 0) {
    const { error: logError } = await supabase.from('alert_log').insert(logEntries)
    if (logError) console.error('send-alerts: alert_log insert error:', logError)
  }

  return NextResponse.json({ sent, permits_checked: permits.length })
}
