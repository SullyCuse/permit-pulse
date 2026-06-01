'use client'

import { useEffect } from 'react'

export default function CheckoutConversion() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('event', 'conversion', {
        send_to: 'AW-970099736/z1LxCOKa67YcEJiYys4D',
        value: 1.0,
        currency: 'USD',
      })
    }
  }, [])

  return null
}
