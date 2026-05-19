import type { Metadata } from 'next'
import AffiliationEditClient from '@/components/mypage/company/AffiliationEditClient'

export const metadata: Metadata = { title: '소속 정보 수정' }

export default function AffiliationEditPage() {
  return <AffiliationEditClient />
}
