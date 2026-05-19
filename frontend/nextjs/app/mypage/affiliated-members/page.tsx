import type { Metadata } from 'next'
import AffiliatedMembersClient from '@/components/mypage/company/AffiliatedMembersClient'

export const metadata: Metadata = { title: '소속 인원 목록' }

export default function AffiliatedMembersPage() {
  return <AffiliatedMembersClient />
}
