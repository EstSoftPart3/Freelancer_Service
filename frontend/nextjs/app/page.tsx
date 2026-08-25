// Mirrors vue_js/src/fo/views/MainPage.vue
import type { Metadata } from 'next'
import MainPage, { type PopularProject } from '@/components/main/MainPage'
import JsonLd from '@/components/seo/JsonLd'
import { organizationJsonLd, webSiteJsonLd } from '@/lib/jsonld'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo'

const HOME_DESCRIPTION =
  'IT 프리랜서와 기업을 연결하는 프로젝트 매칭 플랫폼. 프리랜서 프로젝트 공고, 개발자 커뮤니티, 소속 모집까지 한 곳에서.'

export const metadata: Metadata = {
  // 홈은 title template('%s | ' + SITE_NAME)를 쓰지 않고 사이트명 자체를 노출
  title: { absolute: `${SITE_NAME} — ${SITE_DESCRIPTION}` },
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: SITE_NAME,
    description: HOME_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: { card: 'summary', title: SITE_NAME, description: HOME_DESCRIPTION },
}

// /projects/popular 는 ApiResponse 래퍼 없이 List<>를 직접 반환해 safeGet(output 언래핑)을 못 쓴다
async function fetchInitialPopularProjects(): Promise<PopularProject[]> {
  try {
    // 서버 전용 — 컨테이너 내부 주소 우선(lib/fetchers.ts 와 같은 규칙)
    const baseUrl =
      process.env.API_INTERNAL_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      'http://localhost:8080/api'
    const res = await fetch(`${baseUrl}/projects/popular?sortType=views`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as PopularProject[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export default async function Page() {
  // 인기 프로젝트를 서버에서 조회해 초기 HTML에 포함 — 홈에서 상세로 이어지는 크롤링 경로
  const initialProjects = await fetchInitialPopularProjects()
  return (
    <>
      {/* 사이트 전역 구조화 데이터 — 홈에 1회만 삽입 */}
      <JsonLd data={webSiteJsonLd()} />
      <JsonLd data={organizationJsonLd()} />
      <MainPage initialProjects={initialProjects} />
    </>
  )
}
