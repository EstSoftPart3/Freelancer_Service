import type { Metadata } from 'next'
import ProjectPostClient from '@/components/mypage/company/ProjectPostClient'

export const metadata: Metadata = { title: '프로젝트 등록' }

export default function ProjectPostPage() {
  return <ProjectPostClient />
}
