import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const formData = await req.formData()
  const zipCode = (formData.get('zip_code') as string)?.trim()

  if (zipCode && /^\d{5}$/.test(zipCode)) {
    await supabase.from('watchlists').upsert({
      user_id: user.id,
      zip_code: zipCode,
      county: 'Hall',
    }, { onConflict: 'user_id,zip_code' })
  }

  return NextResponse.redirect(new URL('/dashboard', req.url))
}
