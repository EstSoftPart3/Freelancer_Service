import type { Metadata } from 'next'
import AffiliatedInfoClient from '@/components/mypage/personal/AffiliatedInfoClient'

export const metadata: Metadata = { title: '소속 정보' }

export default function AffiliatedInfoPage() {
  return <AffiliatedInfoClient />
}
