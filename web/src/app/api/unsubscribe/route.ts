import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Simple HMAC-free token: base64(email) — sufficient for unsubscribe (low-stakes action)
function emailToToken(email: string) {
  return Buffer.from(email).toString('base64url')
}

function tokenToEmail(token: string) {
  try {
    return Buffer.from(token, 'base64url').toString('utf8')
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/?unsubscribe=invalid', req.url))
  }

  const email = tokenToEmail(token)
  if (!email) {
    return NextResponse.redirect(new URL('/?unsubscribe=invalid', req.url))
  }

  const admin = createAdminClient()
  await admin
    .from('users')
    .update({ email_opted_out: true })
    .eq('email', email)

  return NextResponse.redirect(new URL(`/?unsubscribe=success`, req.url))
}

export { emailToToken }
