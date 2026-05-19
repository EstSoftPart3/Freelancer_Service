import type { Metadata } from 'next'
import { Suspense } from 'react'
import FindAccountForm from '@/components/auth/FindAccountForm'

export const metadata: Metadata = {
  title: '아이디 / 비밀번호 찾기',
}

export default function FindAccountPage() {
  return (
    <Suspense>
      <FindAccountForm />
    </Suspense>
  )
}
