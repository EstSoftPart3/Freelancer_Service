import type { Metadata } from 'next'
import { Suspense } from 'react'
import SignUpPageClient from '@/components/auth/SignUpPageClient'

export const metadata: Metadata = {
  title: '회원가입',
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpPageClient />
    </Suspense>
  )
}
