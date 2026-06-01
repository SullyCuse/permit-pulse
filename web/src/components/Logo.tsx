export function LogoIcon({ size = 40, color = '#2563eb' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document body */}
      <path d="M28 5 L47 5 L55 13 L55 55 L28 55 Z" stroke={color} strokeWidth="3.5" strokeLinejoin="round" fill="white"/>
      {/* Fold corner */}
      <path d="M47 5 L47 13 L55 13" stroke={color} strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Document lines */}
      <line x1="34" y1="24" x2="49" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="34" y1="32" x2="49" y2="32" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="34" y1="40" x2="49" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      {/* Pulse line */}
      <polyline
        points="2,30 10,30 17,10 25,50 28,30"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dots */}
      <circle cx="2" cy="30" r="2.5" fill={color}/>
      <circle cx="28" cy="30" r="2.5" fill={color}/>
    </svg>
  )
}

import Link from 'next/link'

export function Logo({ color = '#2563eb' }: { color?: string }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <LogoIcon size={36} color={color} />
      <span className="font-bold text-lg tracking-tight" style={{ color }}>
        PermitPulse<span className="font-normal text-gray-400">.io</span>
      </span>
    </Link>
  )
}
