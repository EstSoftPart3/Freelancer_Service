import type { Metadata } from 'next'
import AffiliationProjectsClient from '@/components/mypage/company/AffiliationProjectsClient'

export const metadata: Metadata = { title: '프로젝트 공고 목록' }

export default function AffiliationProjectsPage() {
  return <AffiliationProjectsClient />
}
