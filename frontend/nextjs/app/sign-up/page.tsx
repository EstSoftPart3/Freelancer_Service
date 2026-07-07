import type { Metadata } from 'next'
import { Suspense } from 'react'
import SignUpPageClient from '@/components/auth/SignUpPageClient'

export const metadata: Metadata = {
  title: '회원가입',
  robots: { index: false }, // 인증 페이지 — 색인 불필요 (robots.txt disallow와 이중 방어)
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpPageClient />
    </Suspense>
  )
}
