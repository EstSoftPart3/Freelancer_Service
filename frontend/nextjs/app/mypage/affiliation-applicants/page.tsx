import type { Metadata } from 'next'
import AffiliationApplicantsClient from '@/components/mypage/company/AffiliationApplicantsClient'

export const metadata: Metadata = { title: '소속 공고 지원자 현황' }

export default function AffiliationApplicantsPage() {
  return <AffiliationApplicantsClient />
}
