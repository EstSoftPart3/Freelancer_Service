'use client'

// Vue CompanyVerificationModal.vue 이식 — 기업 실명 인증(사업자 정보 → /mypage/edit/verify-enterprise)
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { alertStore } from '@/stores/alertStore'
import { companyAgreementText } from '@/lib/terms'
import api from '@/lib/api'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CompanyVerificationModal({ open, onClose, onSuccess }: Props) {
  const [companyName, setCompanyName] = useState('')
  const [ceoName, setCeoName] = useState('')
  const [openDate, setOpenDate] = useState('') // yyyy-MM-dd
  const [bizNumber, setBizNumber] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 입력이 바뀌면 인증 상태 초기화 (Vue handleInputChange)
  function resetVerified() {
    if (isVerified) setIsVerified(false)
  }

  async function handleVerify() {
    if (!companyName.trim() || !ceoName.trim() || !openDate || !bizNumber.trim()) {
      alertStore.show('모든 정보를 정확히 입력 후 인증해주세요.', 'danger')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post<{ status: string; output: boolean; message?: string }>(
        '/mypage/edit/verify-enterprise',
        {
          companyNm: companyName,
          companyCeoNm: ceoName,
          companyBizNum: bizNumber,
          companyOpenDt: openDate,
        },
      )
      if (data.status === 'OK' && data.output === true) {
        setIsVerified(true)
        alertStore.show('기업 실명 인증이 성공했습니다.', 'success')
      } else {
        setIsVerified(false)
        alertStore.show(data.message || '기업 인증 실패', 'danger')
      }
    } catch (err) {
      setIsVerified(false)
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alertStore.show(msg || '서버 오류로 인증에 실패했습니다.', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  function handleConfirm() {
    if (!isVerified || !termsAgreed) {
      alertStore.show('약관 동의와 기업인증이 모두 완료되어야 합니다.', 'danger')
      return
    }
    onSuccess()
    alertStore.show('기업 인증 완료되었습니다.', 'success')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            기업 인증
            {isVerified && <CheckCircle2 className="h-4 w-4 text-primary" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">기업명</label>
              <Input value={companyName} onChange={(e) => { setCompanyName(e.target.value); resetVerified() }} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">대표자명</label>
              <Input value={ceoName} onChange={(e) => { setCeoName(e.target.value); resetVerified() }} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">개업일자</label>
            <Input
              type="date"
              value={openDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => { setOpenDate(e.target.value); resetVerified() }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">사업자 번호</label>
            <div className="flex gap-2">
              <Input
                value={bizNumber}
                onChange={(e) => { setBizNumber(e.target.value.replace(/[^0-9]/g, '')); resetVerified() }}
                placeholder="숫자만 입력"
              />
              <Button type="button" onClick={handleVerify} disabled={submitting}>
                {submitting ? '인증 중...' : '인증하기'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="company-terms" checked={termsAgreed} onCheckedChange={(c) => setTermsAgreed(c === true)} />
            <label htmlFor="company-terms" className="text-sm">약관에 동의합니다.</label>
            <button type="button" className="text-sm text-primary underline" onClick={() => setTermsOpen(true)}>
              이용약관
            </button>
          </div>

          <Button className="w-full" onClick={handleConfirm} disabled={!isVerified || !termsAgreed}>
            기업 인증 완료
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>닫기</Button>
        </DialogFooter>
      </DialogContent>

      {/* 이용약관 */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>기업정보 수집 및 이용 동의서</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">
            {companyAgreementText}
          </div>
          <DialogFooter>
            <Button onClick={() => { setTermsAgreed(true); setTermsOpen(false) }}>동의</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
