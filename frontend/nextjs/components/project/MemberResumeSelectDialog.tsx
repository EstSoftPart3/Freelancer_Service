'use client'

// Vue ResumeSelectModal.vue(role=COMPANY) 이식 — 소속원의 대표 이력서 변경
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import ResumeDetailModal from '@/components/mypage/personal/ResumeDetailModal'
import api from '@/lib/api'
import type { ResumeItem } from '@/types'

interface Props {
  open: boolean
  userSq: number | null
  onClose: () => void
  onChanged: () => void
}

export default function MemberResumeSelectDialog({ open, userSq, onClose, onChanged }: Props) {
  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [detailSq, setDetailSq] = useState<number | null>(null)

  const fetchResumes = useCallback(async () => {
    if (userSq == null) return
    try {
      const { data } = await api.get(`/mypage/resume/list/${userSq}`)
      const list: ResumeItem[] = Array.isArray(data.output) ? data.output : []
      setResumes(list)
      const rep = list.find((r) => r.resumeIsRepresentativeYn === 'Y')
      setSelected(rep ? rep.resumeSq : null)
    } catch {
      toast.error('이력서 목록을 불러올 수 없습니다.')
    }
  }, [userSq])

  useEffect(() => {
    if (open) fetchResumes()
  }, [open, fetchResumes])

  async function handleConfirm() {
    if (selected == null) {
      toast.error('이력서를 선택해주세요.')
      return
    }
    setSubmitting(true)
    try {
      await api.patch(`/mypage/resume/representative/${selected}`, { memberSq: userSq })
      toast.success('대표 이력서가 변경되었습니다.')
      onChanged()
      onClose()
    } catch {
      toast.error('대표 이력서 변경에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>대표 이력서 변경</DialogTitle>
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>닫기</Button>
          <Button onClick={handleConfirm} disabled={submitting}>변경 완료</Button>
        </DialogFooter>
      </DialogContent>

      <ResumeDetailModal resumeSq={detailSq} onClose={() => setDetailSq(null)} />
    </Dialog>
  )
}
