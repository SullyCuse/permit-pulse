import { NextRequest, NextResponse } from 'next/server'
import { getResend, FROM } from '@/lib/resend'
import { createAdminClient } from '@/lib/supabase/server'

const TYPE_LABELS: Record<string, string> = {
  county_request: 'County/City Request',
  issue_report: 'Issue Report',
  general: 'General Feedback',
}

export async function POST(req: NextRequest) {
  const { type, message, email, name } = await req.json()

  if (!message || message.trim().length < 2) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  if (!TYPE_LABELS[type]) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error: dbError } = await supabase.from('contact_submissions').insert({
    type,
    message: message.trim(),
    email: email?.trim() || null,
    name: name?.trim() || null,
  })

  if (dbError) {
    console.error('contact_submissions insert error:', JSON.stringify(dbError))
  }

  const sender = name?.trim() || email?.trim() || 'Anonymous'

  const { error: emailError } = await getResend().emails.send({
    from: FROM,
    to: 'contact@permitpulse.io',
    subject: `[Permit Pulse] ${TYPE_LABELS[type]} from ${sender}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#111">
  <h2 style="color:#2d5a27">New Contact Submission</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:6px 0;color:#6b7280;width:80px">Type</td><td style="padding:6px 0"><strong>${TYPE_LABELS[type]}</strong></td></tr>
    ${name?.trim() ? `<tr><td style="padding:6px 0;color:#6b7280">Name</td><td style="padding:6px 0">${name.trim()}</td></tr>` : ''}
    ${email?.trim() ? `<tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>` : ''}
  </table>
  <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb">
  <p style="color:#6b7280;font-size:13px;margin-bottom:4px">Message:</p>
  <p style="white-space:pre-wrap;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;font-size:14px">${message.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
</body>
</html>`,
  })

  if (emailError) {
    console.error('contact email send error:', JSON.stringify(emailError))
  }

  return NextResponse.json({ ok: true })
}
