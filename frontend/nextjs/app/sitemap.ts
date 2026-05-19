import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://freelancer-service.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/projects`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/affiliation`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/board`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/qna`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/notice`, changeFrequency: 'weekly', priority: 0.6 },
  ]

  // Dynamic project/board pages are excluded here;
  // add a DB-backed loop if crawl budget allows it in the future.
  return staticRoutes
}
