'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ProjectFilterBar from './ProjectFilterBar'
import ProjectCard from './ProjectCard'
import CommonPagination from '@/components/community/CommonPagination'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import type { ProjectItem, ProjectSearchParams } from '@/types'

const PAGE_SIZE = 12

export default function ProjectListClient() {
  const router = useRouter()
  const { isLoggedIn } = useUserStore()
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<ProjectSearchParams>({
    sortBy: 'project_start_dt',
    sortOrder: 'desc',
    page: 1,
    size: PAGE_SIZE,
  })

  const fetchProjects = useCallback(async (params: ProjectSearchParams) => {
    setLoading(true)
    try {
      const { data } = await api.get('/projects', {
        params: { ...params, size: PAGE_SIZE },
      })
      const output = data.output ?? data
      setProjects(output.projects ?? output.content ?? [])
      setTotalPages(output.totalPages ?? Math.ceil((output.totalElements ?? 0) / PAGE_SIZE))
    } catch {
      toast.error('프로젝트 목록을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects(searchParams)
  }, [fetchProjects, searchParams])

  function handleSearch(params: ProjectSearchParams) {
    const next = { ...params, size: PAGE_SIZE, page: 1 }
    setCurrentPage(1)
    setSearchParams(next)
  }

  function handlePageChange(page: number) {
    setCurrentPage(page)
    setSearchParams((prev) => ({ ...prev, page }))
  }

  function handleCardClick(sq: number) {
    const project = projects.find((p) => p.projectSq === sq)
    if (!project) return
    router.push(`/projects/user/${sq}`)
  }

  async function handleScrap(sq: number, current: 0 | 1) {
    if (!isLoggedIn()) {
      toast.error('로그인이 필요합니다.')
      return
    }
    try {
      await api.post(`/projects/${sq}/scraps`, {
        hasScrapped: current === 1,
        target: 'project',
      })
      setProjects((prev) =>
        prev.map((p) =>
          p.projectSq === sq
            ? {
                ...p,
                isScrap: (current === 1 ? 0 : 1) as 0 | 1,
                projectScrapCnt: p.projectScrapCnt + (current === 1 ? -1 : 1),
              }
            : p,
        ),
      )
    } catch {
      toast.error('스크랩 처리 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <ProjectFilterBar onSearch={handleSearch} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">검색 결과가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.projectSq}
              project={project}
              onClick={handleCardClick}
              onScrap={handleScrap}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <CommonPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
