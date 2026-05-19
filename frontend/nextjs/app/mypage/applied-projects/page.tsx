import type { Metadata } from 'next'
import AppliedProjectsClient from '@/components/mypage/personal/AppliedProjectsClient'

export const metadata: Metadata = { title: '프로젝트 지원 현황' }

export default function AppliedProjectsPage() {
  return <AppliedProjectsClient />
}
