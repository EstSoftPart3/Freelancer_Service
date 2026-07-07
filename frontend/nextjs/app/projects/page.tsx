import type { Metadata } from 'next'
import { Suspense } from 'react'
import ProjectListClient from '@/components/project/ProjectListClient'
import { buildPageMetadata } from '@/lib/seo'
import { safeGet } from '@/lib/fetchers'
import type { ProjectItem } from '@/types'

export const metadata: Metadata = buildPageMetadata({
  title: '프로젝트 목록',
  description: '모집 중인 IT 프리랜서 프로젝트 공고를 기술 스택·지역·경력별로 검색하고 지원하세요.',
  path: '/projects',
})

export default async function ProjectsPage() {
  // 첫 페이지(기본 정렬, ProjectListClient 초기 파라미터와 동일)를 서버에서 조회해
  // 초기 HTML에 목록 포함 — 크롤러가 상세 링크를 발견하는 경로
  const initial = await safeGet<{ projects: ProjectItem[]; totalCount: number } | null>(
    '/projects?page=1&size=5&sortBy=project_start_dt&sortOrder=desc',
    null,
  )
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">프로젝트 목록</h1>
      <Suspense>
        <ProjectListClient initialData={initial} />
      </Suspense>
    </div>
  )
}
