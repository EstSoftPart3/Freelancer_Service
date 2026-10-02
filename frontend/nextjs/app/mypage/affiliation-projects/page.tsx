import type { Metadata } from 'next'
import { Suspense } from 'react'
import AffiliationProjectsClient from '@/components/mypage/company/AffiliationProjectsClient'

export const metadata: Metadata = { title: '프로젝트 공고 목록' }

export default function AffiliationProjectsPage() {
  // useSearchParams(알림 ?projectSq=)는 Suspense 경계가 없으면 빌드 에러(Next.js 16).
  return (
    <Suspense fallback={null}>
      <AffiliationProjectsClient />
    </Suspense>
  )
}
