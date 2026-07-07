import type { Metadata } from 'next'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: '비밀번호 재설정',
  robots: { index: false }, // 인증 페이지 — 색인 불필요 (robots.txt disallow와 이중 방어)
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
