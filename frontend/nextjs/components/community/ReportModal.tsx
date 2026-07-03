'use client'
import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useBoardStore } from '@/stores/boardStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'

interface ReportReason {
  commonCodeSq: number
  commonCodeNm: string
}

interface Props {
  open: boolean
  reportTypeCd: number
  sq: number
  onClose: () => void
}

export default function ReportModal({ open, reportTypeCd, sq, onClose }: Props) {
  const { viewerSq } = useBoardStore()
  const [reasons, setReasons] = useState<ReportReason[]>([])
  const [selectedReasonSq, setSelectedReasonSq] = useState<number | null>(null)
  const [customContent, setCustomContent] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelectedReasonSq(null)
    setCustomContent('')
    api
      .get<{ status: string; output: ReportReason[] }>('/report/codes/2800')
      .then(({ data }) => {
        if (data.status === 'OK') setReasons(data.output)
      })
      .catch(() => alertStore.show('신고 사유를 불러오지 못했습니다.', 'danger'))
  }, [open])

  const submit = async () => {
    try {
      const { data } = await api.post<{ status: string }>('/report', {
        userSq: viewerSq,
        sq,
        reportTypeCd,
        reportReasonCd: selectedReasonSq,
        reportReasonTxt: customContent.trim(),
      })
      if (data.status === 'CREATED') {
        alertStore.show('신고가 정상적으로 접수되었습니다.', 'success')
        onClose()
      } else {
        alertStore.show('신고 등록에 실패하였습니다.', 'danger')
      }
    } catch {
      alertStore.show('신고 등록에 실패하였습니다.', 'danger')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
        <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>신고 하기</DialogTitle>
          </DialogHeader>

          {reasons.length === 0 ? (
            <p className="py-3 text-center text-sm text-muted-foreground">사유를 불러오는 중...</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm">신고 사유를 선택해주세요:</p>
              <div className="space-y-2">
                {reasons.map((item) => (
                  <label key={item.commonCodeSq} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="reportReason"
                      className="accent-primary"
                      value={item.commonCodeSq}
                      checked={selectedReasonSq === item.commonCodeSq}
                      onChange={() => setSelectedReasonSq(item.commonCodeSq)}
                    />
                    {item.commonCodeNm}
                  </label>
                ))}
              </div>
              <div className="space-y-1">
                <label htmlFor="customReason" className="text-sm font-medium">상세 내용 입력</label>
                <Textarea
                  id="customReason"
                  rows={3}
                  placeholder="추가적인 신고 사유가 있다면 입력해주세요."
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>닫기</Button>
            <Button disabled={!selectedReasonSq} onClick={() => setConfirmOpen(true)}>신고 제출</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="신고 등록"
        message="신고하시겠습니까?"
        onConfirm={submit}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  )
}
