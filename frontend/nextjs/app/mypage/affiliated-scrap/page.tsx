import type { Metadata } from 'next'
import AffiliatedScrapClient from '@/components/mypage/personal/AffiliatedScrapClient'

export const metadata: Metadata = { title: '소속 스크랩 내역' }

export default function AffiliatedScrapPage() {
  return <AffiliatedScrapClient />
}
