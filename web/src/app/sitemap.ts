import type { MetadataRoute } from 'next'
import { LOCATIONS } from '@/lib/locations'
import { COUNTIES, COUNTY_META, getAllMonths, buildSlug } from '@/lib/reports'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://permitpulse.io'

  const locationPages = LOCATIONS.map(loc => ({
    url: `${base}/${loc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const months = getAllMonths()
  const reportPages = COUNTIES.flatMap(county =>
    months
      .filter(({ year, month }) => COUNTY_META[county] && buildSlug(county, year, month))
      .map(({ year, month }) => ({
        url: `${base}/reports/${buildSlug(county, year, month)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
  )

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
