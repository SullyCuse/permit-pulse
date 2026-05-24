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

    const { data: existing } = await admin
      .from('watchlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('zip_code', zipCode)
      .single()

    if (!existing) {
      const { error } = await admin.from('watchlists').insert({
        user_id: user.id,
        zip_code: zipCode,
        county: 'Hall',
      })
      if (error) console.error('watchlist insert error:', error)
    }
  }

  return NextResponse.redirect(new URL('/dashboard', req.url))
}
