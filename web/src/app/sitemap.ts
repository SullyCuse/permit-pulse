import type { MetadataRoute } from 'next'
import { LOCATIONS } from '@/lib/locations'
import { COUNTY_META, buildSlug, getAllReportSummaries } from '@/lib/reports'

// Sitemap calls Supabase — must be dynamic so it isn't pre-rendered at build time
// (Supabase env vars are only available at runtime, not in preview builds)
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://permitpulse.io'

  const locationPages = LOCATIONS.map(loc => ({
    url: `${base}/${loc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const summaries = await getAllReportSummaries()
  const reportPages = summaries
    .filter(s => s.count > 0 && COUNTY_META[s.county])
    .map(s => ({
      url: `${base}/reports/${buildSlug(s.county, s.year, s.month)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/reports`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    ...locationPages,
    ...reportPages,
  ]
}
