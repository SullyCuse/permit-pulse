'use client'

import { useEffect } from 'react'

export default function CheckoutConversion() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('event', 'conversion', {
        send_to: 'AW-18204694435/J_WqCNT9trccEKOv1uhD',
        value: 1.0,
        currency: 'USD',
      })
    }
  }, [])

  return null
}
