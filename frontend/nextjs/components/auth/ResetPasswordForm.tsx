'use client'
// Mirrors vue_js/src/fo/views/login&signup/ResetPasswordPage.vue
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { getApiErrorMessage } from '@/lib/errors'
import { focusInvalidElement } from '@/hooks/useFormErrors'
import { formatMmSs } from '@/components/auth/VerifyTimer'

const FieldLabel = ({ label, valid }: { label: string; valid: boolean }) => (
  <label className="mb-1 flex items-center gap-1 text-sm font-medium">
    {label} {valid && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
  </label>
)

// until = 재설정 토큰 쿠키(5분) 만료 시각(ms), isCompany = 끝난 뒤 기업 로그인으로 보낼지. 둘 다 계정 찾기 화면이 넘긴다.
export default function ResetPasswordForm({ until, isCompany }: { until: number; isCompany: boolean }) {
  const router = useRouter()
  const [remaining, setRemaining] = useState<number | null>(null)
  useEffect(() => {
    if (!until) return
    const tick = () => {
      const left = Math.max(0, Math.ceil((until - Date.now()) / 1000))
      setRemaining(left)
      return left
    }
    if (tick() === 0) return
    const id = setInterval(() => { if (tick() === 0) clearInterval(id) }, 1000)
    return () => clearInterval(id)
  }, [until])
  const expired = remaining === 0
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordValid, setPasswordValid] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [confirmValid, setConfirmValid] = useState(false)
  const passwordRef = useRef<HTMLInputElement | null>(null)
  const confirmRef = useRef<HTMLInputElement | null>(null)

  const validatePassword = (val = password) => {
    setPasswordError(''); setPasswordValid(false)
    if (!val) { setPasswordError('비밀번호를 입력해주세요.'); return false }
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(val)) {
      setPasswordError('8자 이상, 영문·숫자·특수문자를 조합해 입력해주세요.'); return false
    }
    setPasswordValid(true); return true
  }

  const validateConfirm = (val = confirmPassword, pw = password) => {
    setConfirmError(''); setConfirmValid(false)
    if (!val) { setConfirmError('비밀번호 확인을 입력해주세요.'); return false }
    if (val !== pw) { setConfirmError('비밀번호가 일치하지 않습니다.'); return false }
    setConfirmValid(true); return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pwOk = validatePassword()
    const cpwOk = validateConfirm()
    if (!pwOk || !cpwOk) {
      alertStore.show('입력 정보를 확인해주세요.', 'danger')
      // 화면 순서대로 첫 미충족 필드로 스크롤·포커스한다.
      focusInvalidElement(pwOk ? confirmRef.current : passwordRef.current)
      return
    }

    try {
      await api.post('/reset-password', { newPassword: password }, { withCredentials: true })
      alertStore.show('비밀번호 재설정 완료', 'success')
      router.push(isCompany ? '/login?loginType=COMPANY' : '/login')
    } catch (err) {
      // 토큰 없음 / 유효하지 않은 토큰 / 기존 비밀번호와 동일 — 사유를 그대로 보여준다.
      alertStore.show(getApiErrorMessage(err, '서버 요청 중 오류가 발생했습니다.'), 'danger')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">비밀번호 재설정</h1>
        <div className="rounded-xl border bg-card p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <FieldLabel label="새로운 비밀번호" valid={passwordValid} />
              <Input
                ref={passwordRef}
                aria-invalid={!!passwordError || undefined}
                type="password"
                value={password}
                maxLength={32}
                onChange={(e) => {
                  setPassword(e.target.value)
                  validatePassword(e.target.value)
                  if (confirmPassword) validateConfirm(confirmPassword, e.target.value)
                }}
              />
              {passwordError && <p className="mt-1 text-xs text-destructive">{passwordError}</p>}
            </div>
            <div>
              <FieldLabel label="비밀번호 확인" valid={confirmValid} />
              <Input
                ref={confirmRef}
                aria-invalid={!!confirmError || undefined}
                type="password"
                value={confirmPassword}
                maxLength={32}
                onChange={(e) => { setConfirmPassword(e.target.value); validateConfirm(e.target.value) }}
              />
              {confirmError && <p className="mt-1 text-xs text-destructive">{confirmError}</p>}
            </div>
            {remaining !== null && (
              <p className={`text-xs ${expired ? 'text-destructive' : 'text-muted-foreground'}`} aria-live="polite">
                {expired
                  ? <>재설정 유효 시간이 지났습니다. <Link href="/find-account?tab=resetPassword" className="underline">비밀번호 찾기</Link>부터 다시 해 주세요.</>
                  : `${formatMmSs(remaining)} 안에 재설정을 완료해 주세요.`}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={expired}>비밀번호 재설정</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
