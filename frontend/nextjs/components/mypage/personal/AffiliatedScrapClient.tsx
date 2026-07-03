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
import api from '@/lib/api'
import type { ScrapCompanyItem } from '@/types'

const PAGE_SIZE = 10

export default function AffiliatedScrapClient() {
  const [scraps, setScraps] = useState<ScrapCompanyItem[]>([])
  const [searchType, setSearchType] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const fetchScraps = useCallback(async (page = 1, sType = searchType, kw = keyword) => {
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE }
      if (kw?.trim()) {
        params.searchType = sType
        params.keyword = kw.trim()
      }
      const { data } = await api.get('/mypage/applications/scraps', { params })
      const out = data.output ?? {}
      setScraps(out.companies ?? [])
      const total = out.totalElements ?? 0
      setTotalPages(total ? Math.ceil(total / PAGE_SIZE) : 1)
    } catch {
      toast.error('스크랩 내역을 불러올 수 없습니다.')
    }
  }, [searchType, keyword])

  useEffect(() => { fetchScraps(currentPage) }, [fetchScraps, currentPage])

  async function doDelete() {
    if (deleteTarget === null) return
    try {
      await api.post(`/affiliation/${deleteTarget}/scrap`)
      toast.success('스크랩이 삭제되었습니다.')
      fetchScraps(currentPage)
    } catch {
      toast.error('스크랩 삭제에 실패했습니다.')
    } finally {
      setDeleteTarget(null)
    }
  }

  const searchOptions = [
    { value: 'all', label: '전체' },
    { value: 'company', label: '회사명' },
    { value: 'tag', label: '태그' },
    { value: 'content', label: '소개' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">소속 스크랩 내역</h2>

      <div className="flex gap-2 justify-end flex-wrap">
        <Select value={searchType} onValueChange={(v) => { if (v) setSearchType(v) }} items={searchOptions}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {searchOptions.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(1); fetchScraps(1, searchType, keyword) } }} placeholder="검색어 입력" className="w-40" />
        <Button size="sm" onClick={() => { setCurrentPage(1); fetchScraps(1, searchType, keyword) }}>검색</Button>
      </div>

      <hr />

      {scraps.length === 0 && (
        <p className="text-muted-foreground text-sm py-4">스크랩 내역이 없습니다.</p>
      )}

      <ul className="divide-y">
        {scraps.map((scrap) => (
          <li key={scrap.id} className="py-4 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-base font-medium">{scrap.companyNm}</span>
              <div className="flex gap-2">
                {scrap.isRecruitingYn === 'Y'
                  ? <Badge>모집 중</Badge>
                  : <Badge variant="secondary">모집 마감</Badge>
                }
                <Button variant="outline" size="sm" onClick={() => setDeleteTarget(scrap.sq ?? scrap.id)}>삭제</Button>
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <span><span className="font-semibold text-foreground">소속 직원 수</span> | {scrap.memberCnt}</span>
              {scrap.openDt && <span><span className="font-semibold text-foreground">개업일자</span> | {scrap.openDt}</span>}
            </div>
            {scrap.tags && scrap.tags.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">태그</span> | {scrap.tags.join(' / ')}
              </div>
            )}
          </li>
        ))}
      </ul>

      <CommonPagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="소속 스크랩 삭제"
        message="해당 스크랩 내역을 삭제하시겠습니까?"
        onConfirm={doDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
