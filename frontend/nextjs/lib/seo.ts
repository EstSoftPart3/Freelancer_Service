// SEO 공용 유틸 — 메타데이터 조립과 발췌문 생성.
// SITE_URL은 layout.tsx metadataBase와 동일 로직(일원화).
import type { Metadata } from 'next'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://freelancer-service.com'
export const SITE_NAME = 'Freelancer Service'
export const SITE_DESCRIPTION = '프리랜서와 기업을 연결하는 서비스'

// HTML 본문에서 검색결과 미리보기용 발췌문 생성.
// lib/htmlContent.ts는 DOMParser 기반(클라이언트 전용)이라 서버에서는 정규식으로 처리한다.
// 네이버 검색결과는 약 80자만 노출되므로 핵심이 앞에 오도록 단순 앞부분 추출.
export function stripHtmlToExcerpt(html: string | null | undefined, maxLen = 160): string {
  if (!html) return ''
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text
}

interface PageMetadataInput {
  title: string
  description: string
  /** canonical 상대경로 — metadataBase(SITE_URL) 기준으로 절대 URL이 된다 */
  path: string
  ogType?: 'website' | 'article'
  images?: string[]
  /** ogType 'article'일 때만 사용 */
  publishedTime?: string
  noindex?: boolean
}

// title/description/canonical/OG/Twitter Card를 한 번에 조립.
// 루트 layout의 title template('%s | Freelancer Service')이 title에 적용된다.
export function buildPageMetadata({
  title,
  description,
  path,
  ogType = 'website',
  images,
  publishedTime,
  noindex,
}: PageMetadataInput): Metadata {
  const openGraph: Metadata['openGraph'] =
    ogType === 'article'
      ? { title, description, url: path, siteName: SITE_NAME, locale: 'ko_KR', type: 'article', publishedTime, images }
      : { title, description, url: path, siteName: SITE_NAME, locale: 'ko_KR', type: 'website', images }

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph,
    twitter: { card: 'summary', title, description },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  }
}
