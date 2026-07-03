'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import CommonPagination from '@/components/community/CommonPagination'
import AffiliationRequestDetailModal from '@/components/mypage/personal/AffiliationRequestDetailModal'
import api from '@/lib/api'
import type { AffiliationApplicant } from '@/types'

const PAGE_SIZE = 10

function formatDate(s?: string) {
  if (!s) return ''
  const d = new Date(s)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function formatCareer(career: number) {
  if (!career || career <= 0) return '신입'
  const years = Math.floor(career / 12)
  const months = career % 12
  return `${years > 0 ? `${years}년 ` : ''}${months > 0 ? `${months}개월` : ''}`
}

export default function AffiliationApplicantsClient() {
  const [applicants, setApplicants] = useState<AffiliationApplicant[]>([])
  const [readType, setReadType] = useState('all')
  const [searchType, setSearchType] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [counts, setCounts] = useState({ all: 0, read: 0, unread: 0 })
  const [passTarget, setPassTarget] = useState<{ sq: number; cd: number } | null>(null)
  const [detailSq, setDetailSq] = useState<number | null>(null)

  const fetchApplicants = useCallback(async (page = 1, rType = readType, sType = searchType, kw = keyword) => {
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE }
      if (kw?.trim()) { params.searchType = sType; params.keyword = kw.trim() }
      if (rType !== 'all') params.readType = rType
      const { data } = await api.get('/mypage/applications/company', { params })
      const out = data.output ?? {}
      setApplicants(out.applicants ?? [])
      const total = out.totalElements ?? 0
      const readCnt = out.readElements ?? 0
      const unreadCnt = total - readCnt
      setCounts({ all: total, read: readCnt, unread: unreadCnt })
      const cnt = rType === 'read' ? readCnt : rType === 'unread' ? unreadCnt : total
      setTotalPages(cnt ? Math.ceil(cnt / PAGE_SIZE) : 1)
    } catch {
      toast.error('지원자를 불러올 수 없습니다.')
    }
  }, [readType, searchType, keyword])

  useEffect(() => { fetchApplicants(currentPage) }, [fetchApplicants, currentPage])

  function openApplicant(applicationSq: number) {
    // Vue handleOpenApplicant: 열람 처리 → 목록 갱신 → 상세 모달 오픈
    setDetailSq(applicationSq)
    api.put(`/mypage/applications/read/${applicationSq}`)
      .then(() => fetchApplicants(currentPage))
      .catch(() => {}) // 열람 처리 실패는 비치명적 — 모달은 그대로 노출
  }

  async function doPassFail() {
    if (!passTarget) return
    try {
      await api.put(`/mypage/applications/apply/${passTarget.sq}`, { companyApplicationStatusCd: passTarget.cd })
      toast.success(`${passTarget.cd === 502 ? '합격' : '불합격'} 처리되었습니다.`)
      fetchApplicants(currentPage)
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message
      toast.error(msg || '지원 상태 변경에 실패했습니다.')
    } finally {
      setPassTarget(null)
    }
  }

  const filterLabels: Array<{ type: string; label: string }> = [
    { type: 'all', label: '전체' },
    { type: 'read', label: '열람' },
    { type: 'unread', label: '미열람' },
  ]

  const searchOptions = [
    { value: 'all', label: '전체' },
    { value: 'title', label: '이력서 제목' },
    { value: 'name', label: '지원자명' },
    { value: 'greeting', label: '인사말' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">소속 공고 지원자 현황</h2>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {filterLabels.map(({ type, label }) => (
            <Button
              key={type}
              size="sm"
              variant={readType === type ? 'default' : 'outline'}
              onClick={() => { setReadType(type); setCurrentPage(1); fetchApplicants(1, type, searchType, keyword) }}
            >
              {label}
              <Badge variant="secondary" className="ml-1">{counts[type as keyof typeof counts]}</Badge>
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Select value={searchType} onValueChange={(v) => { if (v) setSearchType(v) }} items={searchOptions}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {searchOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchApplicants(1)} placeholder="검색어 입력" className="w-40" />
          <Button size="sm" onClick={() => { setCurrentPage(1); fetchApplicants(1) }}>검색</Button>
        </div>
      </div>

      <hr />

      {applicants.length === 0 && (
        <p className="text-muted-foreground text-sm py-4">지원자가 없습니다.</p>
      )}

      <ul className="divide-y">
        {applicants.map((applicant) => (
          <li key={applicant.applicationSq} className="py-4 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                className="font-medium hover:underline text-left"
                onClick={() => openApplicant(applicant.applicationSq)}
              >
                {applicant.userNm}
              </button>
              <div className="flex gap-2">
                {applicant.statusCd === 502 && <Badge variant="secondary">합격</Badge>}
                {applicant.statusCd === 503 && <Badge variant="secondary">불합격</Badge>}
                {applicant.statusCd !== 502 && applicant.statusCd !== 503 && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setPassTarget({ sq: applicant.applicationSq, cd: 502 })}>합격</Button>
                    <Button size="sm" variant="outline" onClick={() => setPassTarget({ sq: applicant.applicationSq, cd: 503 })}>불합격</Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <span><span className="font-semibold text-foreground">경력</span> | {formatCareer(applicant.career)}</span>
              <span><span className="font-semibold text-foreground">열람일자</span> | {applicant.readAt ? formatDate(applicant.readAt) : '미열람'}</span>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-semibold text-foreground">사용 기술</span>
                <span>|</span>
                {applicant.skills.map((s) => (
                  <Badge key={s.skillTagNm} variant="secondary" className="text-xs">{s.skillTagNm}</Badge>
                ))}
              </div>
              <span><span className="font-semibold text-foreground">지원일자</span> | {formatDate(applicant.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>

      <CommonPagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />

      <ConfirmDialog
        open={passTarget !== null}
        title="지원 상태 변경"
        message={`해당 지원자를 ${passTarget?.cd === 502 ? '합격' : '불합격'} 하시겠습니까?`}
        onConfirm={doPassFail}
        onClose={() => setPassTarget(null)}
      />

      <AffiliationRequestDetailModal applicationSq={detailSq} onClose={() => setDetailSq(null)} />
    </div>
  )
}
