import type { Metadata } from 'next'
import { Suspense } from 'react'
import FindAccountForm from '@/components/auth/FindAccountForm'

export const metadata: Metadata = {
  title: '아이디 / 비밀번호 찾기',
  robots: { index: false }, // 인증 페이지 — 색인 불필요 (robots.txt disallow와 이중 방어)
}

export default function FindAccountPage() {
  return (
    <Suspense>
      <FindAccountForm />
    </Suspense>
  )
}
