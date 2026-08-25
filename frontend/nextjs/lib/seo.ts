// SEO 공용 유틸 — 메타데이터 조립과 발췌문 생성.
// SITE_URL은 layout.tsx metadataBase와 동일 로직(일원화).
import type { Metadata } from 'next'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://job.estsw.co.kr'

// 표시명. 공백과 '+' 가 있어 URL·파일명에는 그대로 못 쓴다 — 그럴 땐 SITE_SLUG 를 쓴다.
export const SITE_NAME = 'Ctrl + F'
export const SITE_SLUG = 'ctrl-f'
export const SITE_DESCRIPTION = 'IT 프리랜서와 기업을 연결하는 프로젝트 매칭 플랫폼'

// 조직 로고(JSON-LD organization.logo). 현재는 기업 기본이미지와 같은 파일을 쓰고 있다.
// 브랜딩 심볼(512×512 PNG)을 받으면 '/img/brand/brand-logo.png' 로 바꾸면 끝난다 —
// 둘을 같은 파일로 두면 기업 프로필 이미지를 바꿀 때 서비스 로고까지 같이 바뀜다.
export const BRAND_LOGO_PATH = '/img/logos/Company_logo.png'

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
// 루트 layout의 title template('%s | ' + SITE_NAME)이 title에 적용된다.
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
