import { Suspense } from 'react'
import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: '로그인',
  robots: { index: false }, // 인증 페이지 — 색인 불필요 (robots.txt disallow와 이중 방어)
}

export default function LoginPage() {
  return (
    // LoginForm이 useSearchParams()로 ?redirect=를 읽어 CSR bailout이 발생 — 정적 프리렌더가
    // 이를 Suspense 경계 없이는 빌드 에러로 취급한다(Next.js 16).
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
