// Mirrors vue_js/src/fo/views/company/AffiliationListPage.vue
import type { Metadata } from 'next'
import AffiliationListPage, { type AffiliationItem } from '@/components/company/AffiliationListPage'
import { buildPageMetadata } from '@/lib/seo'
import { safeGet } from '@/lib/fetchers'

export const metadata: Metadata = buildPageMetadata({
  title: '소속 모집 공고',
  description: '기업 소속 모집 공고를 확인하고 신청하세요.',
  path: '/affiliation',
})

export default async function Page() {
  // 첫 페이지(기본 정렬)를 서버에서 조회해 초기 HTML에 목록 포함
  const initial = await safeGet<{ companies: AffiliationItem[]; totalElements: number } | null>(
    '/affiliation?page=1&size=8&sortType=latest',
    null,
  )
  return <AffiliationListPage initialData={initial} />
}
