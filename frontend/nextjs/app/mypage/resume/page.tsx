import type { Metadata } from 'next'
import ResumeListClient from '@/components/mypage/personal/ResumeListClient'

export const metadata: Metadata = { title: '이력서 목록' }

export default function ResumeListPage() {
  return <ResumeListClient />
}
