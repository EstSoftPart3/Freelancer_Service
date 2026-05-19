'use client'
// Mirrors vue_js/src/fo/views/login&signup/ResetPasswordPage.vue
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'

export default function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordValid, setPasswordValid] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [confirmValid, setConfirmValid] = useState(false)

  const validatePassword = (val = password) => {
    setPasswordError(''); setPasswordValid(false)
    if (!val) { setPasswordError('비밀번호를 입력해주세요.'); return false }
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(val)) {
      setPasswordError('8자 이상, 영문·숫자·특수문자를 조합해 입력해주세요.'); return false
    }
    setPasswordValid(true); return true
  }

  const validateConfirm = (val = confirmPassword) => {
    setConfirmError(''); setConfirmValid(false)
    if (!val) { setConfirmError('비밀번호 확인을 입력해주세요.'); return false }
    if (val !== password) { setConfirmError('비밀번호가 일치하지 않습니다.'); return false }
    setConfirmValid(true); return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pwOk = validatePassword()
    const cpwOk = validateConfirm()
    if (!pwOk || !cpwOk) { alertStore.show('입력 정보를 확인해주세요.', 'danger'); return }

    try {
      const { data } = await api.post<{ status: string; message?: string }>(
        '/reset-password',
        { newPassword: password },
        { withCredentials: true },
      )
      if (data.status === 'OK') {
        alertStore.show('비밀번호 재설정 완료', 'success')
        router.push('/login')
      } else {
        alertStore.show(data.message ?? '비밀번호 재설정 실패', 'danger')
      }
    } catch { alertStore.show('서버 요청 중 오류가 발생했습니다.', 'danger') }
  }

  const FieldLabel = ({ label, valid }: { label: string; valid: boolean }) => (
    <label className="mb-1 flex items-center gap-1 text-sm font-medium">
      {label} {valid && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
    </label>
  )

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">비밀번호 재설정</h1>
        <div className="rounded-xl border bg-card p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <FieldLabel label="새로운 비밀번호" valid={passwordValid} />
              <Input
                type="password"
                value={password}
                maxLength={32}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => validatePassword()}
              />
              {passwordError && <p className="mt-1 text-xs text-destructive">{passwordError}</p>}
            </div>
            <div>
              <FieldLabel label="비밀번호 확인" valid={confirmValid} />
              <Input
                type="password"
                value={confirmPassword}
                maxLength={32}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => validateConfirm()}
              />
              {confirmError && <p className="mt-1 text-xs text-destructive">{confirmError}</p>}
            </div>
            <Button type="submit" className="w-full">비밀번호 재설정</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
