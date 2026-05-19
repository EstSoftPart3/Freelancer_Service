import type { Metadata } from 'next'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: '비밀번호 재설정',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
