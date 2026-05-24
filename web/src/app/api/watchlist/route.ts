import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const formData = await req.formData()
  const zipCode = (formData.get('zip_code') as string)?.trim()

  if (zipCode && /^\d{5}$/.test(zipCode)) {
    const admin = createAdminClient()

    // Ensure user row exists in public.users (may not exist if they haven't subscribed yet)
    await admin.from('users').upsert({
      id: user.id,
      auth_id: user.id,
      email: user.email,
      is_active: false,
    }, { onConflict: 'id', ignoreDuplicates: true })

    const { data: existing } = await admin
      .from('watchlists')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('zip_code', zipCode)
      .single()

    if (!existing) {
      const { error } = await admin.from('watchlists').insert({
        user_id: user.id,
        zip_code: zipCode,
        county: 'Hall',
        permit_types: [],
      })
      if (error) console.error('watchlist insert error:', error.message, error.details)
    }
  }

  return NextResponse.redirect(new URL('/dashboard', req.url))
}
