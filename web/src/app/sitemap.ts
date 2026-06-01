import type { MetadataRoute } from 'next'
import { LOCATIONS } from '@/lib/locations'
import { COUNTY_META, buildSlug, getAllReportSummaries } from '@/lib/reports'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://permitpulse.io'

  const locationPages = LOCATIONS.map(loc => ({
    url: `${base}/${loc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Use actual DB summaries so the sitemap exactly matches what exists —
  // includes historical Bryan County 2024 data, excludes months with no data.
  // Also exclude the current in-progress month (no permits yet).
  const now = new Date()
  const summaries = await getAllReportSummaries()
  const reportPages = summaries
    .filter(({ county, year, month }) =>
      COUNTY_META[county] &&
      (year < now.getFullYear() || month < now.getMonth())
    )
    .map(({ county, year, month }) => ({
      url: `${base}/reports/${buildSlug(county, year, month)}`,
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
