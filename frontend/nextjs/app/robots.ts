import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://freelancer-service.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/projects', '/board', '/qna', '/notice', '/affiliation'],
        disallow: ['/mypage/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
