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
import type { CompanyMember } from '@/types'

const PAGE_SIZE = 5

export default function AffiliatedMembersClient() {
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [searchType, setSearchType] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [fireTarget, setFireTarget] = useState<number | null>(null)

  const fetchMembers = useCallback(async (page = 1, sType = searchType, kw = searchText) => {
    try {
      const { data } = await api.get('/companies', {
        params: {
          page,
          size: PAGE_SIZE,
          searchType: sType !== 'all' ? sType : undefined,
          keyword: kw.trim() || undefined,
        },
      })
      const out = data.output ?? {}
      setMembers(out.members ?? [])
      setCurrentPage(out.page ?? page)
      setTotalPages(Math.max(1, out.totalPages ?? 1))
    } catch {
      toast.error('소속 인원 목록을 불러올 수 없습니다.')
    }
  }, [searchType, searchText])

  useEffect(() => { fetchMembers(currentPage) }, [fetchMembers, currentPage])

  async function doFire() {
    if (fireTarget === null) return
    try {
      await api.patch('/companies', { userSq: fireTarget, newStatus: '퇴사' })
      toast.success('퇴사 처리되었습니다.')
      fetchMembers(currentPage)
    } catch {
      toast.error('퇴사 처리에 실패했습니다.')
    } finally {
      setFireTarget(null)
    }
  }

  const searchOptions = [
    { value: 'all', label: '전체' },
    { value: 'name', label: '이름' },
    { value: 'skill', label: '사용 기술' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">소속 인원 목록</h2>

      <div className="flex gap-2 justify-end flex-wrap">
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
        <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchMembers(1)} placeholder="검색어 입력" className="w-40" />
        <Button size="sm" onClick={() => { setCurrentPage(1); fetchMembers(1) }}>검색</Button>
      </div>

      <hr />

      {members.length === 0 && (
        <p className="text-muted-foreground text-sm py-4">소속 인원이 없습니다.</p>
      )}

      <ul className="divide-y">
        {members.map((member) => (
          <li key={member.userSq} className="py-4 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-medium">{member.userNm}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">{member.resumeTtl}</span>
              </div>
              {member.leavedYn === 401
                ? <Button size="sm" variant="outline" onClick={() => setFireTarget(member.userSq)}>퇴사 처리</Button>
                : <Badge variant="secondary">퇴사</Badge>
              }
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-4">
                <span><span className="font-semibold text-foreground">경력</span> | {member.careerYr}년차</span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="font-semibold text-foreground">사용 기술</span>
                  <span>|</span>
                  {member.skillTagNms.slice(0, 6).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                  {member.skillTagNms.length > 6 && (
                    <Badge variant="outline" className="text-xs">+{member.skillTagNms.length - 6}</Badge>
                  )}
                </div>
              </div>
              <span className="whitespace-nowrap">
                <span className="font-semibold text-foreground">{member.careerEndDt ? '퇴사일자' : '입사일자'}</span>
                {' '}| {member.careerEndDt || member.careerStartDt}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <CommonPagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />

      <ConfirmDialog
        open={fireTarget !== null}
        title="소속 인원 퇴사 처리"
        message="해당 인원을 퇴사처리 하겠습니까?"
        onConfirm={doFire}
        onClose={() => setFireTarget(null)}
      />
    </div>
  )
}
