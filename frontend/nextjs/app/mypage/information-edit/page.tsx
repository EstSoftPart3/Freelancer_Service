import type { Metadata } from 'next'
import InformationEditClient from '@/components/mypage/common/InformationEditClient'

export const metadata: Metadata = { title: '회원 정보 수정' }

export default function InformationEditPage() {
  return <InformationEditClient />
}
