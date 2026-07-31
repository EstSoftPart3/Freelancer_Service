import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

// 색인 제외: 인증 필요/개인화 페이지 + 글 작성 폼 + API.
// 공개 경로는 allow '/' 하나로 통일 — 경로 나열식은 신규 공개 페이지 추가 시 누락 위험.
const DISALLOW = [
  '/mypage/',
  '/api/',
  '/login',
  '/sign-up',
  '/find-account',
  '/reset-password',
  '/board/register',
  '/qna/register',
  // 고객의 소리는 목록·상세·작성 전부 로그인 전용이라 트리 통째로 제외한다.
  '/voc',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 네이버(Yeti)·구글(Googlebot) 명시 허용 — 일부 크롤러가 '*' 규칙만으로는 소극적으로 수집하는 경우 대비
      { userAgent: ['Googlebot', 'Yeti'], allow: '/', disallow: DISALLOW },
      { userAgent: '*', allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
