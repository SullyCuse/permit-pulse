'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function CallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function handleCallback() {
      const next = searchParams.get('next') ?? '/dashboard'

      // createBrowserClient with detectSessionInUrl:true (the default) automatically
      // handles all three flows on init:
      //   - PKCE:       exchanges ?code= for a session
      //   - Hash:       reads #access_token= and calls setSession
      //   - token_hash: not auto-handled, so we do it explicitly below
      //
      // Give the client one tick to finish its async URL detection before we check.
      await new Promise(resolve => setTimeout(resolve, 0))

      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type') as 'magiclink' | 'email' | null
      if (tokenHash && type) {
        await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace(next)
        return
      }

      router.replace('/login?error=auth')
    }

    handleCallback()
  }, [])

  return null
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center hero-pattern">
      <Suspense>
        <CallbackHandler />
      </Suspense>
      <p className="text-gray-400 text-sm">Signing in…</p>
    </div>
  )
}
