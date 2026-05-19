import type { Metadata } from 'next'
import AffiliatedJobApplicationsClient from '@/components/mypage/personal/AffiliatedJobApplicationsClient'

export const metadata: Metadata = { title: '소속 공고 지원 현황' }

export default function AffiliatedJobApplicationsPage() {
  return <AffiliatedJobApplicationsClient />
}
