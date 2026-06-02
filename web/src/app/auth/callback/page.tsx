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
      const code = searchParams.get('code')
      const next = searchParams.get('next') ?? '/dashboard'

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.replace(next)
          return
        }
        router.replace('/login?error=auth')
        return
      }

      // Hash-based flow: Supabase redirects with #access_token=...&refresh_token=...
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.slice(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          if (!error) {
            router.replace(next)
            return
          }
        }
      }

      // token_hash flow (some Supabase email configs)
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type') as 'magiclink' | 'email' | null
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (!error) {
          router.replace(next)
          return
        }
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
