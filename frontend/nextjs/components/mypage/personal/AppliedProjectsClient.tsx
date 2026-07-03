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
import ResumeDetailModal from '@/components/mypage/personal/ResumeDetailModal'
import InterviewSelectModal, { type InterviewTime } from '@/components/mypage/common/InterviewSelectModal'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import type { ApplicationItem } from '@/types'

interface Counts { all: number; read: number; unread: number }
const PAGE_SIZE = 5

const SEARCH_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'title', label: '제목' },
  { value: 'company', label: '회사명' },
]

function formatDate(s?: string) {
  if (!s) return ''
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function AppliedProjectsClient() {
  const router = useRouter()
  const { getUserType } = useUserStore()
  const userType = getUserType()

  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [counts, setCounts] = useState<Counts>({ all: 0, read: 0, unread: 0 })
  const [readType, setReadType] = useState('all')
  const [searchType, setSearchType] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [appliedSearch, setAppliedSearch] = useState({ type: 'all', keyword: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [cancelTarget, setCancelTarget] = useState<number | null>(null)
  const [resumeDetail, setResumeDetail] = useState<{ resumeSq: number; projectSq: number; applicationSq: number } | null>(null)
  const [interview, setInterview] = useState<{ open: boolean; applicationSq: number | null; times: InterviewTime[] }>({ open: false, applicationSq: null, times: [] })

  const fetchList = useCallback(async (page = 1, rType = readType, sType = appliedSearch.type, kw = appliedSearch.keyword) => {
    try {
      const endpoint = userType === 'COMPANY' ? '/projects/applications/corporate' : '/projects/applications'
      const { data } = await api.get(endpoint, {
        params: {
          offset: (page - 1) * PAGE_SIZE,
          size: PAGE_SIZE,
          searchType: sType,
          keyword: kw || undefined,
          readType: rType !== 'all' ? rType : undefined,
        },
      })
      const out = data.output ?? {}
      setApplications(out.applications ?? [])
      setTotalPages(Math.max(1, Math.ceil((out.totalCount ?? 0) / PAGE_SIZE)))
      if (out.counts) setCounts(out.counts)
    } catch {
      toast.error('지원 현황을 불러올 수 없습니다.')
    }
  }, [userType, readType, appliedSearch])

  useEffect(() => { fetchList(currentPage) }, [fetchList, currentPage])

  function handleSearch() {
    setAppliedSearch({ type: searchType, keyword: searchKeyword })
    setCurrentPage(1)
    fetchList(1, readType, searchType, searchKeyword)
  }

  function handleReadFilter(type: string) {
    setReadType(type)
    setCurrentPage(1)
    fetchList(1, type, appliedSearch.type, appliedSearch.keyword)
  }

  async function doCancel() {
    if (cancelTarget === null) return
    try {
      await api.patch(`/projects/applications/${cancelTarget}`, { status: '지원취소' })
      toast.success('지원이 취소되었습니다.')
      fetchList(currentPage)
    } catch {
      toast.error('지원 취소에 실패했습니다.')
    } finally {
      setCancelTarget(null)
    }
  }

  function goToProject(projectSq: number) {
    const path = userType === 'PERSONAL' ? `/projects/user/${projectSq}` : `/projects/company/${projectSq}`
    router.push(path)
  }

  async function openInterview(projectSq: number, applicationSq: number) {
    try {
      const { data } = await api.get(`/projects/applications/interviews/${projectSq}`)
      setInterview({ open: true, applicationSq, times: data.output ?? [] })
    } catch {
      toast.error('인터뷰 시간을 불러올 수 없습니다.')
    }
  }

  const filterLabels: Array<{ type: string; label: string }> = [
    { type: 'all', label: '전체' },
    { type: 'read', label: '열람' },
    { type: 'unread', label: '미열람' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">프로젝트 지원 현황</h2>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {filterLabels.map(({ type, label }) => (
            <Button
              key={type}
              size="sm"
              variant={readType === type ? 'default' : 'outline'}
              onClick={() => handleReadFilter(type)}
            >
              {label}
              <Badge variant="secondary" className="ml-1">
                {counts[type as keyof Counts]}
              </Badge>
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Select value={searchType} onValueChange={(v) => { if (v) setSearchType(v) }} items={SEARCH_OPTIONS}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEARCH_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="검색어 입력" className="w-40" />
          <Button size="sm" onClick={handleSearch}>검색</Button>
        </div>
      </div>

      <hr />

      {applications.length === 0 && (
        <p className="text-muted-foreground text-sm py-4">지원한 프로젝트가 없습니다.</p>
      )}

      <ul className="divide-y">
        {applications.map((item) => (
          <li key={item.applicationSq} className="py-4 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                className="text-base font-medium hover:underline text-left"
                onClick={() => goToProject(item.projectSq)}
              >
                {item.projectTitle} / {item.companyTitle}
              </button>
              <div className="flex gap-2 items-center">
                {item.applicantType === '지원중' && (
                  <>
                    <Badge>지원중</Badge>
                    <Button variant="outline" size="sm" onClick={() => setCancelTarget(item.applicationSq)}>지원취소</Button>
                  </>
                )}
                {item.applicantType === '합격' && <Badge variant="secondary">합격</Badge>}
                {item.applicantType === '불합격' && <Badge variant="secondary">불합격</Badge>}
                {item.applicantType === '지원취소' && <Badge variant="secondary">지원 취소됨</Badge>}
                {item.applicantType === '인터뷰확정' && <Badge>인터뷰 확정 {item.interviewDt ? `(${formatDate(item.interviewDt)})` : ''}</Badge>}
                {item.applicantType === '인터뷰요청중' && (
                  <Button variant="outline" size="sm" onClick={() => openInterview(item.projectSq, item.applicationSq)}>인터뷰 요청중</Button>
                )}
                {item.isRecruitEnded && <Badge variant="secondary">지원 마감</Badge>}
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <span><span className="font-semibold text-foreground">지원일자</span> | {formatDate(item.appliedDt)}</span>
              <span><span className="font-semibold text-foreground">지원자 수</span> | {item.applicantCnt}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <span>
                <span className="font-semibold text-foreground">지원 이력서</span>{' | '}
                <button
                  className="text-muted-foreground hover:text-primary hover:underline cursor-pointer"
                  onClick={() => item.resumeSq && setResumeDetail({ resumeSq: item.resumeSq, projectSq: item.projectSq, applicationSq: item.applicationSq })}
                >
                  {userType === 'COMPANY' && item.applicantName ? `${item.applicantName} / ${item.resumeTitle}` : item.resumeTitle}
                </button>
              </span>
              <span><span className="font-semibold text-foreground">열람일자</span> | {item.readApplicationDt ? formatDate(item.readApplicationDt) : '미열람'}</span>
            </div>
          </li>
        ))}
      </ul>

      <CommonPagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />

      <ResumeDetailModal
        resumeSq={resumeDetail?.resumeSq ?? null}
        projectSq={resumeDetail?.projectSq ?? null}
        applicationSq={resumeDetail?.applicationSq ?? null}
        onClose={() => setResumeDetail(null)}
      />
      <InterviewSelectModal
        open={interview.open}
        applicationSq={interview.applicationSq}
        interviewTimes={interview.times}
        onClose={() => setInterview((s) => ({ ...s, open: false }))}
        onConfirm={() => fetchList(currentPage)}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        title="프로젝트 지원 취소"
        message="취소한 프로젝트 내역은 복구할 수 없습니다. 취소하시겠습니까?"
        onConfirm={doCancel}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  )
}
