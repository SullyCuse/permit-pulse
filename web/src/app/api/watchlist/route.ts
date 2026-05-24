import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const formData = await req.formData()
  const zipCode = (formData.get('zip_code') as string)?.trim()
  const action = (formData.get('action') as string) ?? 'add'

  if (zipCode && /^\d{5}$/.test(zipCode)) {
    const admin = createAdminClient()

    if (action === 'remove') {
      const { data: existing } = await admin
        .from('watchlists')
        .select('id, zip_codes')
        .eq('user_id', user.id)
        .single()
      if (existing) {
        const updated = (existing.zip_codes ?? []).filter((z: string) => z !== zipCode)
        const { error } = await admin
          .from('watchlists')
          .update({ zip_codes: updated })
          .eq('id', existing.id)
        if (error) console.error('watchlist remove error:', JSON.stringify(error))
      }
    } else {
      // Ensure user row exists in public.users (may not exist if they haven't subscribed yet)
      const { error: userError } = await admin.from('users').upsert({
        id: user.id,
        auth_id: user.id,
        email: user.email,
        is_active: false,
      }, { onConflict: 'id', ignoreDuplicates: true })
      if (userError) console.error('users upsert error:', JSON.stringify(userError))

      // Check if user already has a watchlist row
      const { data: existing } = await admin
        .from('watchlists')
        .select('id, zip_codes')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        const currentZips: string[] = existing.zip_codes ?? []
        if (!currentZips.includes(zipCode)) {
          const { error } = await admin
            .from('watchlists')
            .update({ zip_codes: [...currentZips, zipCode] })
            .eq('id', existing.id)
          if (error) console.error('watchlist update error:', JSON.stringify(error))
        }
      } else {
        const { error } = await admin.from('watchlists').insert({
          user_id: user.id,
          county: 'Hall',
          zip_codes: [zipCode],
          permit_types: [],
        })
        if (error) console.error('watchlist insert error:', JSON.stringify(error))
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', req.url))
}
