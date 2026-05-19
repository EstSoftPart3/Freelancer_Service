import type { Metadata } from 'next'
import ProjectScrapClient from '@/components/mypage/personal/ProjectScrapClient'

export const metadata: Metadata = { title: '프로젝트 스크랩 내역' }

export default function ProjectScrapPage() {
  return <ProjectScrapClient />
}
