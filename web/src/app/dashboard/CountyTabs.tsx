'use client'

import { useRef } from 'react'
import Link from 'next/link'

interface Tab {
  label: string
  href: string
}

interface Props {
  tabs: Tab[]
  activeCounty: string
}

export default function CountyTabs({ tabs, activeCounty }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' })
  }

  return (
    <div className="relative flex items-center mb-3">
      <button
        onClick={() => scroll('left')}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-700 focus:outline-none"
        aria-label="Scroll left"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto bg-gray-100 p-1 rounded-lg flex-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeCounty === label
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <button
        onClick={() => scroll('right')}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-700 focus:outline-none"
        aria-label="Scroll right"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
