import type { Metadata } from 'next'
import { Suspense } from 'react'
import ProjectListClient from '@/components/project/ProjectListClient'

export const metadata: Metadata = { title: '프로젝트 목록' }

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">프로젝트 목록</h1>
      <Suspense>
        <ProjectListClient />
      </Suspense>
    </div>
  )
}
