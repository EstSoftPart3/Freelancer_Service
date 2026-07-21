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
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import type { ScrapProjectItem } from '@/types'

const PAGE_SIZE = 5

function formatDate(s?: string) {
  if (!s) return ''
  const d = new Date(s)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function ProjectScrapClient() {
  const router = useRouter()
  const { getUserType } = useUserStore()
  const userType = getUserType()

  const [scraps, setScraps] = useState<ScrapProjectItem[]>([])
  const [searchType, setSearchType] = useState('전체')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const fetchScraps = useCallback(async (page = 1, sType = searchType, kw = searchKeyword) => {
    try {
      const { data } = await api.get('/mypage/projectScrap', {
        params: { searchType: sType, searchKeyword: kw || undefined, page, size: PAGE_SIZE },
      })
      const output = data.output ?? {}
      setScraps(Array.isArray(output.content) ? output.content : [])
      setTotalPages(Math.max(1, Math.ceil((output.totalCount ?? 0) / PAGE_SIZE)))
    } catch (err: unknown) {
      // 백엔드는 스크랩이 없을 때 ApiResponse(status:"NOT_FOUND")를 반환하는데,
      // ResponseEntity가 아니라 ApiResponse를 직접 반환하므로 실제 HTTP는 200이다.
      // (api.ts 인터셉터가 본문 status!=OK를 reject → err.response.status는 200)
      // 따라서 HTTP 코드가 아니라 '본문의 status/message'로 빈 목록을 판별한다 — 에러 아님.
      const res = (err as { response?: { status?: number; data?: { status?: string } } })?.response
      const isEmpty = res?.data?.status === 'NOT_FOUND' || res?.status === 404
      if (isEmpty) {
        setScraps([])
        setTotalPages(1)
      } else {
        toast.error('스크랩 목록을 불러올 수 없습니다.')
      }
    }
  }, [searchType, searchKeyword])

  useEffect(() => { fetchScraps(currentPage) }, [fetchScraps, currentPage])

  function handleSearch() {
    setCurrentPage(1)
    fetchScraps(1, searchType, searchKeyword)
  }

  async function doDelete() {
    if (deleteTarget === null) return
    try {
      await api.delete(`/mypage/projectScrap/${deleteTarget}`)
      toast.success('스크랩이 삭제되었습니다.')
      fetchScraps(currentPage)
    } catch {
      toast.error('스크랩 삭제에 실패했습니다.')
    } finally {
      setDeleteTarget(null)
    }
  }

  function goToProject(projectSq: number) {
    router.push(userType === 'PERSONAL' ? `/projects/user/${projectSq}` : `/projects/company/${projectSq}`)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">프로젝트 스크랩 내역</h2>

      <div className="flex gap-2 justify-end flex-wrap">
        <Select value={searchType} onValueChange={(v) => { if (v) setSearchType(v) }}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['전체', '제목', '회사명'].map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="검색어 입력" className="w-40" />
        <Button size="sm" onClick={handleSearch}>검색</Button>
      </div>

      <hr />

      {scraps.length === 0 && (
        <p className="text-muted-foreground text-sm py-4">스크랩 내역이 없습니다.</p>
      )}

      <ul className="divide-y">
        {scraps.map((item) => (
          <li key={item.projectSq} className="py-4 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                className="text-base font-medium hover:underline text-left"
                onClick={() => goToProject(item.projectSq)}
              >
                {item.projectTtl} / <span>{item.company.companyNm}</span>
              </button>
              <div className="flex gap-2">
                {item.dday !== null && item.dday >= 0
                  ? <Badge>채용중 <span className="ml-1">D-{item.dday}</span></Badge>
                  : <Badge variant="secondary">채용 마감</Badge>
                }
                <Button variant="outline" size="sm" onClick={() => setDeleteTarget(item.projectSq)}>삭제</Button>
              </div>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <span><span className="font-semibold text-foreground">등록일자</span> | {formatDate(item.createdAt)}</span>
              <span><span className="font-semibold text-foreground">지원자 수</span> | {item.candidateCnt}</span>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <div>
                <span className="font-semibold text-foreground">지원 자격</span>
                {' '}| {item.address.parentSigungu} {item.address.sigungu} / {item.developerGrade} / {item.requiredEducation}
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.skillTags.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
              <span className="whitespace-nowrap"><span className="font-semibold text-foreground">채용기간</span> | {item.recruitStartDt} ~ {item.recruitEndDt}</span>
            </div>
          </li>
        ))}
      </ul>

      <CommonPagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="스크랩 삭제"
        message="해당 스크랩을 삭제하시겠습니까?"
        onConfirm={doDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
