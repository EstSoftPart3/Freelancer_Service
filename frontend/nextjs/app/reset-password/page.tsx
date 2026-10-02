import type { Metadata } from 'next'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: '비밀번호 재설정',
  robots: { index: false }, // 인증 페이지 — 색인 불필요 (robots.txt disallow와 이중 방어)
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ until?: string; loginType?: string }>
}) {
  const { until, loginType } = await searchParams
  return <ResetPasswordForm until={Number(until) || 0} isCompany={loginType === 'COMPANY'} />
}
