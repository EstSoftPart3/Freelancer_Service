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
import type { AffiliationApplyItem } from '@/types'

const PAGE_SIZE = 10

function formatDate(s?: string) {
  if (!s) return ''
  const d = new Date(s)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function AffiliatedJobApplicationsClient() {
  const [applies, setApplies] = useState<AffiliationApplyItem[]>([])
  const [readType, setReadType] = useState('all')
  const [searchType, setSearchType] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [counts, setCounts] = useState({ all: 0, read: 0, unread: 0 })
  const [cancelTarget, setCancelTarget] = useState<number | null>(null)
  const [detailTarget, setDetailTarget] = useState<number | null>(null)

  const fetchApplies = useCallback(async (page = 1, rType = readType, sType = searchType, kw = keyword) => {
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE }
      if (kw?.trim()) { params.searchType = sType; params.keyword = kw.trim() }
      if (rType !== 'all') params.readType = rType
      const { data } = await api.get('/mypage/applications/user', { params })
      const out = data.output ?? {}
      setApplies(out.applies ?? [])
      const total = out.totalElements ?? 0
      const readCnt = out.readElements ?? 0
      const unreadCnt = total - readCnt
      setCounts({ all: total, read: readCnt, unread: unreadCnt })
      const cnt = rType === 'read' ? readCnt : rType === 'unread' ? unreadCnt : total
      setTotalPages(cnt ? Math.ceil(cnt / PAGE_SIZE) : 1)
    } catch {
      toast.error('지원 현황을 불러올 수 없습니다.')
    }
  }, [readType, searchType, keyword])

  useEffect(() => { fetchApplies(currentPage) }, [fetchApplies, currentPage])

  async function doCancel() {
    if (cancelTarget === null) return
    try {
      const { data } = await api.patch(`/mypage/applications/${cancelTarget}`)
      if (data.status === 'OK') {
        toast.success('지원이 취소되었습니다.')
        fetchApplies(currentPage)
      }
    } catch {
      toast.error('지원 취소에 실패했습니다.')
    } finally {
      setCancelTarget(null)
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
    { value: 'name', label: '회사명' },
    { value: 'greeting', label: '인사말' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">소속 공고 지원 현황</h2>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {filterLabels.map(({ type, label }) => (
            <Button
              key={type}
              size="sm"
              variant={readType === type ? 'default' : 'outline'}
              onClick={() => { setReadType(type); setCurrentPage(1); fetchApplies(1, type, searchType, keyword) }}
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
          <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchApplies(1)} placeholder="검색어 입력" className="w-40" />
          <Button size="sm" onClick={() => { setCurrentPage(1); fetchApplies(1) }}>검색</Button>
        </div>
      </div>

      <hr />

      {applies.length === 0 && (
        <p className="text-muted-foreground text-sm py-4">지원 내역이 없습니다.</p>
      )}

      <ul className="divide-y">
        {applies.map((apply) => (
          <li key={apply.applicationSq} className="py-4 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button type="button" className="text-base font-medium text-primary hover:underline text-left" onClick={() => setDetailTarget(apply.applicationSq)}>{apply.companyNm}</button>
              <div className="flex gap-2">
                {apply.isDeleted === 'Y' && <Badge variant="secondary">지원 취소 완료</Badge>}
                {apply.isDeleted !== 'Y' && apply.statusCd === 501 && (
                  <>
                    <Badge>지원중</Badge>
                    <Button variant="outline" size="sm" onClick={() => setCancelTarget(apply.applicationSq)}>지원 취소</Button>
                  </>
                )}
                {apply.statusCd === 502 && <Badge variant="secondary">합격</Badge>}
                {apply.statusCd === 503 && <Badge variant="secondary">불합격</Badge>}
              </div>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <span><span className="font-semibold text-foreground">지원일자</span> | {formatDate(apply.createdAt)}</span>
              <span><span className="font-semibold text-foreground">지원자 수</span> | {apply.applicantCnt}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <span><span className="font-semibold text-foreground">지원 이력서</span> | {apply.resumeTtl}</span>
              <span><span className="font-semibold text-foreground">열람일자</span> | {apply.readAt ? formatDate(apply.readAt) : '미열람'}</span>
            </div>
          </li>
        ))}
      </ul>

      <CommonPagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />

      <ConfirmDialog
        open={cancelTarget !== null}
        title="지원 상태 변경"
        message="해당 소속에 지원 취소하시겠습니까?"
        onConfirm={doCancel}
        onClose={() => setCancelTarget(null)}
      />

      <AffiliationRequestDetailModal applicationSq={detailTarget} onClose={() => setDetailTarget(null)} />
    </div>
  )
}
