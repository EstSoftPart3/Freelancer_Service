'use client'

// Vue 원본 AffiliationMemberModal.vue 이식 — 이름 클릭 이력서 상세(B3), '이력서 변경' 대표 이력서 변경(B1)
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import CommonPagination from '@/components/community/CommonPagination'
import ResumeDetailModal from '@/components/mypage/personal/ResumeDetailModal'
import MemberResumeSelectDialog from '@/components/project/MemberResumeSelectDialog'
import api from '@/lib/api'
import type { CompanyMember } from '@/types'
import { useFormErrors } from '@/hooks/useFormErrors'
import { InvalidFrame } from '@/components/ui/invalid-frame'

const PAGE_SIZE = 5

interface Props {
  open: boolean
  projectSq: number
  onClose: () => void
  onApplied: () => void
}

interface SelectedMember {
  userSq: number
  userNm: string
  resumeSq: number
}

const SEARCH_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'name', label: '이름' },
  { value: 'skill', label: '사용 기술' },
]

export default function AffiliationApplyDialog({ open, projectSq, onClose, onApplied }: Props) {
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [searchType, setSearchType] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState<SelectedMember[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [detailSq, setDetailSq] = useState<number | null>(null)
  const [resumeChangeUserSq, setResumeChangeUserSq] = useState<number | null>(null)
  const { markInvalid, bindRef, isInvalid, clearField } = useFormErrors<'members'>()

  const fetchMembers = useCallback(async (page = 1) => {
    try {
      const { data } = await api.get('/companies', {
        params: {
          page,
          size: PAGE_SIZE,
          searchType: searchType !== 'all' ? searchType : undefined,
          keyword: searchText.trim() || undefined,
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

  useEffect(() => {
    if (open) fetchMembers(1)
  }, [open, fetchMembers])

  function isSelected(userSq: number) {
    return selected.some((m) => m.userSq === userSq)
  }

  async function toggleSelection(member: CompanyMember) {
    if (isSelected(member.userSq)) {
      setSelected((prev) => prev.filter((m) => m.userSq !== member.userSq))
      return
    }
    if (!member.resumeSq) {
      toast.error('대표 이력서를 먼저 선택해주세요.')
      return
    }
    try {
      const { data } = await api.get(`/projects/applications/${projectSq}/check`, { params: { userSq: member.userSq } })
      if (data.output) {
        toast.error('이미 지원한 이력 있는 사용자입니다.')
        return
      }
      clearField('members')
      setSelected((prev) => [...prev, { userSq: member.userSq, userNm: member.userNm, resumeSq: member.resumeSq }])
    } catch {
      toast.error('지원 여부 확인 중 오류가 발생했습니다.')
    }
  }

  function removeSelected(userSq: number) {
    setSelected((prev) => prev.filter((m) => m.userSq !== userSq))
  }

  function handleConfirm() {
    if (selected.length === 0) {
      markInvalid(['members'], '소속 인원을 선택해주세요.')
      return
    }
    setConfirmOpen(true)
  }

  async function submitApplication() {
    setSubmitting(true)
    try {
      await api.post(`/projects/applications/${projectSq}`, {
        resumeSq: selected.map((m) => m.resumeSq),
        projectApplicationTyp: 'COMPANY',
      })
      toast.success('프로젝트 지원에 성공하였습니다.')
      onApplied()
      onClose()
    } catch {
      toast.error('지원 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>소속 인원 선택</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap justify-end gap-2">
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
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchMembers(1)}
            placeholder="검색어 입력"
            className="w-40"
          />
          <Button size="sm" onClick={() => fetchMembers(1)}>검색</Button>
        </div>

        {selected.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">현재 선택한 인원 :</p>
            <div className="flex flex-wrap gap-2">
              {selected.map((m) => (
                <span key={m.userSq} className="flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs">
                  {m.userNm}
                  <button onClick={() => removeSelected(m.userSq)} className="text-muted-foreground hover:text-foreground">×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {members.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
        ) : (
          <InvalidFrame ref={bindRef('members')} invalid={isInvalid('members')}>
          <ul className="max-h-80 divide-y overflow-y-auto">
            {members.map((member) => (
              <li key={member.userSq} className="flex items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      type="button"
                      disabled={!member.resumeSq}
                      onClick={() => member.resumeSq && setDetailSq(member.resumeSq)}
                      className="font-medium hover:underline disabled:no-underline disabled:cursor-default cursor-pointer"
                    >
                      {member.userNm}
                    </button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{member.resumeTtl || '이력서를 선택하세요'}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    경력 | {member.careerYr}년차 · 사용 기술 | {member.skillTagNms.join(', ') || '-'}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant={isSelected(member.userSq) ? 'default' : 'outline'}
                    onClick={() => toggleSelection(member)}
                  >
                    {isSelected(member.userSq) ? '선택됨' : '선택하기'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setResumeChangeUserSq(member.userSq)}>이력서 변경</Button>
                </div>
              </li>
            ))}
          </ul>
          </InvalidFrame>
        )}

        {totalPages > 1 && (
          <CommonPagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchMembers} />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>닫기</Button>
          <Button onClick={handleConfirm} disabled={submitting}>선택 완료</Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={confirmOpen}
        title="프로젝트 지원"
        message="해당 프로젝트에 지원하시겠습니까?"
        onConfirm={submitApplication}
        onClose={() => setConfirmOpen(false)}
      />

      {/* B3: 소속원 이력서 상세보기 */}
      <ResumeDetailModal resumeSq={detailSq} onClose={() => setDetailSq(null)} />

      {/* B1: 소속원 대표 이력서 변경 */}
      <MemberResumeSelectDialog
        open={resumeChangeUserSq !== null}
        userSq={resumeChangeUserSq}
        onClose={() => setResumeChangeUserSq(null)}
        onChanged={() => fetchMembers(currentPage)}
      />
    </Dialog>
  )
}
