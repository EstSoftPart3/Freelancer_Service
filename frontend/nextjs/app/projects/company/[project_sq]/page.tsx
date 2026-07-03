import type { Metadata } from 'next'
import ProjectSpec from '@/components/project/ProjectSpec'

// 사용자별(isApplied/userRole) 데이터라 정적 생성 부적합 — Windows dev의 static-paths worker 크래시(Jest worker) 회피
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ project_sq: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project_sq } = await params
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api'
    const res = await fetch(`${baseUrl}/projects/${project_sq}/details`, { cache: 'no-store' })
    if (res.ok) {
      const data = (await res.json()) as { output: { projectTtl: string } }
      if (data.output?.projectTtl) return { title: data.output.projectTtl }
    }
  } catch {}
  return { title: '프로젝트 상세' }
}

export default async function CompanyProjectSpecPage({ params }: Props) {
  const { project_sq } = await params
  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectSpec projectSq={project_sq} variant="company" />
    </div>
  )
}
