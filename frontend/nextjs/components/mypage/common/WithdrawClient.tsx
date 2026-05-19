'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import PasswordCheck from '@/components/mypage/PasswordCheck'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'

const NOTICE_TEXT = `※ 회원 탈퇴 전 꼭 확인해주세요.

1. 탈퇴 시 해당 계정으로 등록된 모든 정보는 삭제되며, 복구가 불가능합니다.
2. 탈퇴 후에는 동일한 아이디로 재가입이 제한될 수 있습니다.
3. 작성하신 게시물, 댓글 등 일부 콘텐츠는 탈퇴 후에도 사이트에 남아있을 수 있습니다.
4. 유료 서비스 이용 중 탈퇴할 경우, 잔여 이용 기간에 대한 보상 또는 환불은 제공되지 않습니다.

위의 내용을 충분히 확인하신 후 탈퇴를 진행해 주세요.`

export default function WithdrawClient() {
  const router = useRouter()
  const { clearUser } = useUserStore()

  const [confirmed, setConfirmed] = useState(false)
  const [userId, setUserId] = useState('')
  const [applicantName, setApplicantName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({ userId: false, name: false, agree: false })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = {
      userId: !userId.trim(),
      name: !applicantName.trim(),
      agree: !agreed,
    }
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return
    setShowConfirm(true)
  }

  async function doWithdraw() {
    try {
      await api.post('/mypage/withdraw', { userId, userNm: applicantName })
      clearUser()
      toast.success('회원 탈퇴가 완료되었습니다.')
      router.push('/')
    } catch {
      toast.error('회원 탈퇴 처리에 실패했습니다.')
    }
  }

  if (!confirmed) {
    return <PasswordCheck title="회원 탈퇴" onConfirmed={() => setConfirmed(true)} />
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold">회원 탈퇴</h2>

      <textarea
        readOnly
        rows={8}
        className="w-full text-sm border rounded-md p-3 bg-muted resize-none"
        value={NOTICE_TEXT}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">아이디</label>
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          {errors.userId && (
            <p className="text-sm text-destructive">아이디를 입력해 주세요.</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">탈퇴 신청자</label>
          <Input
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
          />
          {errors.name && (
            <p className="text-sm text-destructive">탈퇴 신청자명을 입력해 주세요.</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
            />
            <label htmlFor="agree" className="text-sm cursor-pointer leading-snug">
              회원 탈퇴 안내 사항을 모두 읽었으며, 이에 동의합니다.
            </label>
          </div>
          {errors.agree && (
            <p className="text-sm text-destructive pl-6">
              안내 사항에 동의해야 탈퇴가 가능합니다.
            </p>
          )}
        </div>

        <Button type="submit" variant="destructive">
          탈퇴하기
        </Button>
      </form>

      <ConfirmDialog
        open={showConfirm}
        title="회원 탈퇴 확인"
        message="정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onConfirm={doWithdraw}
        onClose={() => setShowConfirm(false)}
      />
    </div>
  )
}
