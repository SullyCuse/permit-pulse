import { NextRequest, NextResponse } from 'next/server'
import { getResend, FROM } from '@/lib/resend'
import { createAdminClient } from '@/lib/supabase/server'
import { COUNTY_META } from '@/lib/reports'

type Permit = {
  permit_number: string | null
  address: string | null
  zip_code: string | null
  permit_type: string | null
  date_filed: string | null
  county: string | null
  raw_data: Record<string, any> | null
}

function emailToToken(email: string) {
  return Buffer.from(email).toString('base64url')
}

const DIGEST_PREVIEW_LIMIT = 50

function coveredAreasSection() {
  const areas = Object.values(COUNTY_META).map(m => m.display).sort()
  const COLS = 4
  const rows: string[][] = []
  for (let i = 0; i < areas.length; i += COLS) {
    rows.push(areas.slice(i, i + COLS))
  }
  const colWidth = Math.floor(100 / COLS)
  const tableRows = rows.map(row => {
    const cells = row.map(a => `<td style="padding:3px 8px 3px 0;font-size:13px;color:#2d5a27;width:${colWidth}%">${a}</td>`).join('')
    const empty = Array(COLS - row.length).fill(`<td style="width:${colWidth}%"></td>`).join('')
    return `<tr>${cells}${empty}</tr>`
  }).join('')
  return `
  <div style="background:#f0f7ee;border:1px solid #c6dfc2;border-radius:8px;padding:14px 16px;margin-bottom:20px">
    <p style="margin:0 0 10px;font-weight:600;color:#1e4a1c">Areas covered by Permit Pulse</p>
    <table style="width:100%;border-collapse:collapse">${tableRows}</table>
  </div>`
}

function digestHtml(permits: Permit[], totalCount: number, sinceDate: string, unsubscribeUrl: string) {
  const preview = permits.slice(0, DIGEST_PREVIEW_LIMIT)
  const truncated = totalCount > DIGEST_PREVIEW_LIMIT

  const rows = preview.map(p => {
    const estValue = p.raw_data?.estimated_value
    return `
    <tr>
      <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6">${p.permit_number ?? '—'}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6">${p.permit_type ?? '—'}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6">${p.address ?? '—'}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6">${p.zip_code ?? '—'}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6">${p.county ?? '—'}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6">${estValue ? `$${Number(estValue).toLocaleString()}` : '—'}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6">${p.date_filed ? new Date(p.date_filed + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
    </tr>`
  }).join('')

  const moreNote = truncated
    ? `<p style="margin:12px 0 0;font-size:13px;color:#374151">Showing <strong>${DIGEST_PREVIEW_LIMIT} of ${totalCount} permits</strong> added since ${sinceDate}. <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color:#2d5a27">View all ${totalCount} on your dashboard →</a></p>`
    : `<p style="margin:12px 0 0;font-size:13px;color:#374151"><strong>${totalCount} permit${totalCount === 1 ? '' : 's'}</strong> added since ${sinceDate}.</p>`

  return `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:700px;margin:0 auto;padding:20px;color:#111">
  <h2 style="color:#2d5a27">Permit Pulse — Permit Digest</h2>
  ${coveredAreasSection()}
  <p style="color:#6b7280">New permits filed since ${sinceDate}. <strong>${totalCount} permit${totalCount === 1 ? '' : 's'}</strong> added to your feed.</p>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead>
      <tr style="background:#f9fafb">
        <th style="padding:8px 6px;text-align:left;color:#6b7280;font-weight:500">Permit #</th>
        <th style="padding:8px 6px;text-align:left;color:#6b7280;font-weight:500">Type</th>
        <th style="padding:8px 6px;text-align:left;color:#6b7280;font-weight:500">Address</th>
        <th style="padding:8px 6px;text-align:left;color:#6b7280;font-weight:500">Zip</th>
        <th style="padding:8px 6px;text-align:left;color:#6b7280;font-weight:500">County</th>
        <th style="padding:8px 6px;text-align:left;color:#6b7280;font-weight:500">Est. Value</th>
        <th style="padding:8px 6px;text-align:left;color:#6b7280;font-weight:500">Filed</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  ${moreNote}
  <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb">
  <p style="font-size:12px;color:#9ca3af">View your full dashboard at <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Permit Pulse</a>. · <a href="${unsubscribeUrl}" style="color:#9ca3af">Unsubscribe</a></p>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const since = new Date()
  since.setDate(since.getDate() - 7)
  const sinceStr = since.toISOString().split('T')[0]

  const { data: allPermits, error: permitsError } = await supabase
    .from('permits')
    .select('permit_number, address, zip_code, permit_type, date_filed, county, raw_data')
    .gte('date_filed', sinceStr)
    .order('date_filed', { ascending: false })

  if (permitsError) {
    console.error('send-digest: permits query error:', permitsError)
    return NextResponse.json({ error: permitsError.message }, { status: 500 })
  }

  if (!allPermits?.length) {
    return NextResponse.json({ sent: 0, message: `No permits since ${sinceStr}` })
  }

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email')
    .eq('is_active', true)
    .eq('plan', 'pro')
    .eq('email_opted_out', false)

  if (usersError) {
    console.error('send-digest: users query error:', usersError)
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

  const { data: watchlists } = await supabase
    .from('watchlists')
    .select('user_id, zip_codes')

  const zipsByUser = new Map<string, Set<string>>()
  for (const w of watchlists ?? []) {
    if (w.zip_codes?.length) {
      zipsByUser.set(w.user_id, new Set(w.zip_codes))
    }
  }

  let sent = 0

  for (const user of users ?? []) {
    if (!user.email) continue

    const watchedZips = zipsByUser.get(user.id)
    const permits = watchedZips
      ? allPermits.filter((p: Permit) => p.zip_code && watchedZips.has(p.zip_code))
      : allPermits

    if (!permits.length) continue

    const totalCount = permits.length

    try {
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${emailToToken(user.email)}`
      const subject = `Permit Pulse — ${totalCount} new permit${totalCount === 1 ? '' : 's'} in your area`
      await getResend().emails.send({
        from: FROM,
        to: user.email,
        subject,
        html: digestHtml(permits, totalCount, sinceStr, unsubscribeUrl),
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
      sent++
    } catch (err: any) {
      console.error(`send-digest: failed to email ${user.email}:`, err.message)
    }
  }

  return NextResponse.json({ sent, permits_found: allPermits.length })
}
