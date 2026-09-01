'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import CommonPagination from '@/components/community/CommonPagination'
import ApplyStatusModal from '@/components/mypage/company/ApplyStatusModal'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import { getRecruitStatus } from '@/lib/recruit'
import type { CompanyProject } from '@/types'

const PAGE_SIZE = 5

interface StatusCounts { allCount: number; recruiting: number; closed: number; scheduled: number }

export default function AffiliationProjectsClient() {
  const router = useRouter()
  const { companyAuthStatusCd } = useUserStore()
  const [authConfirm, setAuthConfirm] = useState(false)
  const [applyStatus, setApplyStatus] = useState<{ open: boolean; projectSq: number | null; projectTtl: string }>({ open: false, projectSq: null, projectTtl: '' })

  // Vue ProjectListPage.handleRegisterClick — 미인증(2501)이면 인증 페이지 이동 확인 모달
  function handleRegister() {
    if (String(companyAuthStatusCd) === '2501') { setAuthConfirm(true); return }
    router.push('/mypage/project-post')
  }

  const [projects, setProjects] = useState<CompanyProject[]>([])
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({ allCount: 0, recruiting: 0, closed: 0, scheduled: 0 })
  const [currentFilter, setCurrentFilter] = useState('all')
  const [searchType, setSearchType] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const fetchStatusCounts = useCallback(async (filter = currentFilter, sType = searchType, kw = searchText) => {
    try {
      const { data } = await api.get('/projects/companies/status', {
        params: { keyword: kw || undefined, searchType: sType !== 'all' ? sType : undefined, status: filter !== 'all' ? filter : undefined },
      })
      setStatusCounts(data.output ?? { allCount: 0, recruiting: 0, closed: 0, scheduled: 0 })
    } catch {
      // non-critical
    }
  }, [currentFilter, searchType, searchText])

  const fetchProjects = useCallback(async (page = 1, filter = currentFilter, sType = searchType, kw = searchText) => {
    try {
      const { data } = await api.get('/projects/companies', {
        params: { page, size: PAGE_SIZE, searchType: sType !== 'all' ? sType : undefined, keyword: kw || undefined, status: filter },
      })
      const out = data.output ?? {}
      setProjects(out.projects ?? [])
      setTotalPages(Math.max(1, out.totalPages ?? 1))
    } catch {
      toast.error('프로젝트 목록을 불러올 수 없습니다.')
    }
  }, [currentFilter, searchType, searchText])

  useEffect(() => {
    fetchProjects(currentPage)
    fetchStatusCounts()
  }, [fetchProjects, fetchStatusCounts, currentPage])

  async function doDelete() {
    if (deleteTarget === null) return
    try {
      await api.delete(`/projects/${deleteTarget}`)
      toast.success('프로젝트가 삭제되었습니다.')
      fetchProjects(currentPage)
      fetchStatusCounts()
    } catch {
      toast.error('프로젝트 삭제에 실패했습니다.')
    } finally {
      setDeleteTarget(null)
    }
  }

  const filters = [
    { type: 'all', label: '전체', count: statusCounts.allCount },
    { type: 'recruiting', label: '채용중', count: statusCounts.recruiting },
    { type: 'closed', label: '지원 마감', count: statusCounts.closed },
    { type: 'scheduled', label: '예정', count: statusCounts.scheduled },
  ]

  const searchOptions = [
    { value: 'all', label: '전체' },
    { value: 'title', label: '제목' },
    { value: 'content', label: '내용' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">프로젝트 공고 목록</h2>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2 flex-wrap">
          {filters.map(({ type, label, count }) => (
            <Button
              key={type}
              size="sm"
              variant={currentFilter === type ? 'default' : 'outline'}
              onClick={() => { setCurrentFilter(type); setCurrentPage(1); fetchProjects(1, type); fetchStatusCounts(type) }}
            >
              {label}
              <Badge variant="secondary" className="ml-1">{count}</Badge>
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Select value={searchType} onValueChange={(v) => { if (v) setSearchType(v) }} items={searchOptions}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {searchOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchProjects(1)} placeholder="검색어 입력" className="w-40" />
          <Button size="sm" onClick={() => { setCurrentPage(1); fetchProjects(1); fetchStatusCounts() }}>검색</Button>
        </div>
      </div>

      <hr />

      {projects.length === 0 && (
        <p className="text-muted-foreground text-sm py-4">검색 조건을 만족하는 프로젝트가 없습니다.</p>
      )}

      <ul className="divide-y">
        {projects.map((post) => {
          const status = getRecruitStatus(post.recruitStartDt, post.recruitEndDt)
          return (
            <li key={post.projectSq} className="py-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button
                  className="text-base font-medium hover:underline text-left"
                  onClick={() => router.push(`/projects/company/${post.projectSq}`)}
                >
                  {post.projectTtl} / {post.companyNm}
                </button>
                <div className="flex gap-2">
                  {status.status === '채용중'
                    ? <Badge>{status.status} <span className="ml-1">{status.dDay}</span></Badge>
                    : <Badge variant="secondary">{status.status}</Badge>
                  }
                  <Button variant="outline" size="sm" onClick={() => router.push(`/mypage/project-post/${post.projectSq}`)}>수정</Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteTarget(post.projectSq)}>삭제</Button>
                </div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground flex-wrap gap-2">
                <span><span className="font-semibold text-foreground">등록일자</span> | {post.projectCreatedDt}</span>
                <span className="flex items-center gap-2">
                  <span><span className="font-semibold text-foreground">지원자 수</span> | {post.applicantCnt}</span>
                  <Button size="sm" variant="outline" onClick={() => setApplyStatus({ open: true, projectSq: post.projectSq, projectTtl: post.projectTtl })}>지원현황 바로가기</Button>
                </span>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground flex-wrap gap-2">
                <div className="space-y-1">
                  <div><span className="font-semibold text-foreground">지원 자격</span> | {post.address} / {post.devGradeNm} / {post.requiredEduLvl}</div>
                  <div className="flex flex-wrap gap-1">
                    {post.reqSkills.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                </div>
                <span className="whitespace-nowrap"><span className="font-semibold text-foreground">채용기간</span> | {post.recruitStartDt} ~ {post.recruitEndDt}</span>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="flex justify-end mt-4">
        <Button onClick={handleRegister}>프로젝트 등록하기</Button>
      </div>

      <CommonPagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="프로젝트 삭제"
        message="한 번 삭제한 프로젝트는 복구할 수 없습니다. 삭제하시겠습니까?"
        onConfirm={doDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={authConfirm}
        title="기업 인증 필요"
        message="인증 페이지로 이동하시겠습니까?"
        onConfirm={() => router.push('/mypage/affiliation-edit')}
        onClose={() => setAuthConfirm(false)}
      />

      <ApplyStatusModal
        open={applyStatus.open}
        projectSq={applyStatus.projectSq}
        projectTtl={applyStatus.projectTtl}
        onClose={() => setApplyStatus((s) => ({ ...s, open: false }))}
      />
    </div>
  )
}
