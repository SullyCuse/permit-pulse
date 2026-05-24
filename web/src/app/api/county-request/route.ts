import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const county = (formData.get('county') as string)?.trim()
  const email = (formData.get('email') as string)?.trim() || null

  if (!county || county.length < 2 || county.length > 100) {
    return NextResponse.redirect(new URL('/?county_request=invalid', req.url))
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('county_requests').insert({
    county,
    email: email || null,
  })

  if (error) {
    console.error('county-request insert error:', JSON.stringify(error))
  }

  return NextResponse.redirect(new URL('/?county_request=thanks', req.url))
}
