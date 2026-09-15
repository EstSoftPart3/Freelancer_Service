'use client'

// Vue 원본 ResumeSelectModal.vue(role=PERSONAL) 이식 — 이력서 제목 클릭 시 상세 미리보기(A1)
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import ResumeDetailModal from '@/components/mypage/personal/ResumeDetailModal'
import api from '@/lib/api'
import type { ResumeItem } from '@/types'
import { useFormErrors } from '@/hooks/useFormErrors'
import { InvalidFrame } from '@/components/ui/invalid-frame'

interface Props {
  open: boolean
  projectSq: number
  onClose: () => void
  onApplied: () => void
}

export default function ResumeSelectDialog({ open, projectSq, onClose, onApplied }: Props) {
  const router = useRouter()
  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [detailSq, setDetailSq] = useState<number | null>(null)
  const { markInvalid, bindRef, isInvalid, clearField } = useFormErrors<'resume'>()

  // GET /mypage/resume/select-list 는 페이지네이션을 받지 않고 전체 목록을 그대로 반환한다(ResumeController#getAllResumes).
  const fetchResumes = useCallback(async () => {
    try {
      const { data } = await api.get('/mypage/resume/select-list')
      const list: ResumeItem[] = Array.isArray(data.output) ? data.output : []
      setResumes(list)
      const rep = list.find((r) => r.resumeIsRepresentativeYn === 'Y')
      if (rep) setSelected(rep.resumeSq)
    } catch {
      toast.error('이력서 목록을 불러올 수 없습니다.')
    }
  }, [])

  useEffect(() => {
    if (open) fetchResumes()
  }, [open, fetchResumes])

  async function handleConfirm() {
    if (selected == null) {
      markInvalid(['resume'], '이력서를 선택해주세요.')
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
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '프로젝트 지원에 실패했습니다.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>이력서 선택</DialogTitle>
        </DialogHeader>

        {resumes.length === 0 ? (
          <div className="space-y-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">등록된 이력서가 없습니다.</p>
            <Button onClick={() => { onClose(); router.push('/mypage/resume/new') }}>
              이력서 등록하러 가기
            </Button>
          </div>
        ) : (
          <InvalidFrame ref={bindRef('resume')} invalid={isInvalid('resume')}>
          <ul className="max-h-80 divide-y overflow-y-auto">
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
                  onClick={() => { clearField('resume'); setSelected(resume.resumeSq) }}
                >
                  {selected === resume.resumeSq ? '선택됨' : '선택하기'}
                </Button>
              </li>
            ))}
          </ul>
          </InvalidFrame>
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
