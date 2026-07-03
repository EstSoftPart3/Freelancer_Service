'use client'

// Vue 원본 ResumeSelectModal.vue(role=PERSONAL) 이식 — 이력서 제목 클릭 시 상세 미리보기(A1)
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import CommonPagination from '@/components/community/CommonPagination'
import ResumeDetailModal from '@/components/mypage/personal/ResumeDetailModal'
import api from '@/lib/api'
import type { ResumeItem } from '@/types'

const PAGE_SIZE = 5

interface Props {
  open: boolean
  projectSq: number
  onClose: () => void
  onApplied: () => void
}

export default function ResumeSelectDialog({ open, projectSq, onClose, onApplied }: Props) {
  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [detailSq, setDetailSq] = useState<number | null>(null)

  const fetchResumes = useCallback(async (page = 1) => {
    try {
      const { data } = await api.get('/mypage/resume/select-list', { params: { currentPage: page, size: PAGE_SIZE } })
      const output = data.output ?? {}
      const list: ResumeItem[] = Array.isArray(output.output) ? output.output : Array.isArray(output) ? output : []
      setResumes(list)
      setTotalPages(output.totalCount ? Math.max(1, Math.ceil(output.totalCount / PAGE_SIZE)) : 1)
      const rep = list.find((r) => r.resumeIsRepresentativeYn === 'Y')
      if (rep) setSelected(rep.resumeSq)
    } catch {
      toast.error('이력서 목록을 불러올 수 없습니다.')
    }
  }, [])

  useEffect(() => {
    if (open) fetchResumes(currentPage)
  }, [open, currentPage, fetchResumes])

  async function handleConfirm() {
    if (selected == null) {
      toast.error('이력서를 선택해주세요.')
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/projects/applications/${projectSq}`, {
        resumeSq: [selected],
        projectApplicationTyp: 'PERSONAL',
      })
      toast.success('프로젝트 지원에 성공하였습니다.')
      onApplied()
      onClose()
    } catch {
      toast.error('프로젝트 지원에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>이력서 선택</DialogTitle>
        </DialogHeader>

        {resumes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">등록된 이력서가 없습니다.</p>
        ) : (
          <ul className="divide-y">
            {resumes.map((resume) => (
              <li key={resume.resumeSq} className="flex items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailSq(resume.resumeSq)}
                      className="truncate text-sm font-medium hover:underline cursor-pointer"
                    >
                      {resume.resumeTtl}
                    </button>
                    {resume.resumeIsRepresentativeYn === 'Y' && <Badge className="shrink-0">대표 이력서</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    등록일자 | {resume.resumeCreatedAtDtm?.substring(0, 10).replaceAll('-', '.')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={selected === resume.resumeSq ? 'default' : 'outline'}
                  onClick={() => setSelected(resume.resumeSq)}
                >
                  {selected === resume.resumeSq ? '선택됨' : '선택하기'}
                </Button>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <CommonPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>닫기</Button>
          <Button onClick={handleConfirm} disabled={submitting}>선택 완료</Button>
        </DialogFooter>
      </DialogContent>

      {/* A1: 이력서 상세 미리보기 */}
      <ResumeDetailModal resumeSq={detailSq} onClose={() => setDetailSq(null)} />
    </Dialog>
  )
}
