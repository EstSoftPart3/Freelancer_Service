import type { Metadata } from 'next'
import ProjectPostClient from '@/components/mypage/company/ProjectPostClient'

export const metadata: Metadata = { title: '프로젝트 수정' }

export default async function ProjectPostEditPage({
  params,
}: {
  params: Promise<{ project_sq: string }>
}) {
  const { project_sq } = await params
  return <ProjectPostClient projectSq={Number(project_sq)} />
}
