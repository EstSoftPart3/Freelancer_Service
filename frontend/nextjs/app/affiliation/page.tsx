// Mirrors vue_js/src/fo/views/company/AffiliationListPage.vue
import type { Metadata } from 'next'
import AffiliationListPage from '@/components/company/AffiliationListPage'

export const metadata: Metadata = {
  title: '소속 모집 공고',
  description: '기업 소속 모집 공고를 확인하고 신청하세요.',
}

export default function Page() {
  return <AffiliationListPage />
}
