'use client'

import { useState } from 'react'

export default function SubscribeButton({ plan, label, highlight }: {
  plan: 'basic' | 'pro'
  label: string
  highlight: boolean
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { alert('Server error: ' + text); setLoading(false); return }
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'Something went wrong')
        setLoading(false)
      }
    } catch (err: any) {
      alert('Network error: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-opacity ${
        highlight
          ? 'text-white hover:opacity-90'
          : 'border border-stone-300 hover:bg-stone-50 text-gray-700'
      }`}
      style={highlight ? { backgroundColor: '#2d5a27' } : undefined}
    >
      {loading ? 'Loading…' : label}
    </button>
  )
}
