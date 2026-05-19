import type { Metadata } from 'next'
import ResumeFormClient from '@/components/mypage/personal/ResumeFormClient'

export const metadata: Metadata = { title: '이력서 등록' }

export default function ResumeNewPage() {
  return <ResumeFormClient />
}
