import type { Metadata } from 'next'
import WithdrawClient from '@/components/mypage/common/WithdrawClient'

export const metadata: Metadata = { title: '회원 탈퇴' }

export default function WithdrawPage() {
  return <WithdrawClient />
}
