import type { Metadata } from 'next'
import ProjectSpec from '@/components/project/ProjectSpec'
import { getProjectDetail } from '@/lib/fetchers'
import { buildPageMetadata, stripHtmlToExcerpt } from '@/lib/seo'

// 사용자별(isApplied/userRole) 데이터라 정적 생성 부적합 — Windows dev의 static-paths worker 크래시(Jest worker) 회피
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ project_sq: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project_sq } = await params
  const project = await getProjectDetail(project_sq)
  // 삭제/존재하지 않는 프로젝트는 색인 제외
  if (!project) return { title: '프로젝트 상세', robots: { index: false } }
  return buildPageMetadata({
    title: project.projectTtl,
    description: stripHtmlToExcerpt(
      `${project.companyNm} · ${project.formattedSalary} · ${project.projectDetail}`,
    ),
    // user/company 뷰는 동일 콘텐츠의 역할별 화면 — 비로그인 대표 경로인 user로 canonical 통일
    // (중복 콘텐츠 방지, JSON-LD도 canonical인 user 페이지에만 삽입)
    path: `/projects/user/${project_sq}`,
    ogType: 'article',
    images: project.companyImageUrl ? [project.companyImageUrl] : undefined,
  })
}

export default async function CompanyProjectSpecPage({ params }: Props) {
  const { project_sq } = await params
  // generateMetadata와 React cache()로 공유 — 실제 API 호출은 요청당 1회
  const project = await getProjectDetail(project_sq)
  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectSpec projectSq={project_sq} variant="company" initialData={project} />
    </div>
  )
}
