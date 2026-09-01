'use client'
// Mirrors vue_js/src/fo/views/login&signup/FindAccountPage.vue
// + FindIdForm.vue + ResetPasswordForm.vue (탭 통합)
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEmailVerification } from '@/hooks/useEmailVerification'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { getApiErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

const EMAIL_DOMAINS = ['naver.com', 'gmail.com', 'daum.net', 'nate.com', 'hotmail.com', 'yahoo.com']

// 이메일 입력 + 도메인 선택 + 인증 요청 버튼 인라인 (Vue 원본과 동일)
function EmailVerifyRow({
  emailId, setEmailId, domain, setDomain,
  customDomain, setCustomDomain, isCustom, setIsCustom,
  onSendCode, sending, onBlur, error, valid,
}: {
  emailId: string; setEmailId: (v: string) => void
  domain: string; setDomain: (v: string) => void
  customDomain: string; setCustomDomain: (v: string) => void
  isCustom: boolean; setIsCustom: (v: boolean) => void
  onSendCode: () => void; sending: boolean
  onBlur?: () => void; error: string; valid: boolean
}) {
  const handleDomain = (val: string) => {
    if (val === 'custom') { setIsCustom(true); setCustomDomain(''); setDomain('custom') }
    else { setIsCustom(false); setDomain(val) }
  }
  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-sm font-medium">
        이메일 주소 {valid && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
      </label>
      <div className="flex flex-wrap gap-1">
        <Input className="w-24 min-w-0 flex-1" value={emailId} onChange={(e) => setEmailId(e.target.value)} onBlur={onBlur} placeholder="아이디" />
        <span className="flex items-center px-1 text-sm">@</span>
        <Input className="w-24 min-w-0 flex-1" value={isCustom ? customDomain : domain} readOnly={!isCustom} onChange={(e) => setCustomDomain(e.target.value)} placeholder="도메인" />
        <select value={isCustom ? 'custom' : domain} onChange={(e) => handleDomain(e.target.value)} className="h-8 cursor-pointer rounded-lg border border-border bg-background px-2 text-sm">
          <option value="" disabled>선택</option>
          {EMAIL_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
          <option value="custom">직접입력</option>
        </select>
        <Button type="button" size="sm" onClick={onSendCode} disabled={sending}>
          {sending ? '전송 중...' : '인증'}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ---------- 아이디 찾기 ----------
function FindIdForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailId, setEmailId] = useState('')
  const [domain, setDomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailValid, setEmailValid] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const ev = useEmailVerification({ sendCodeEndpoint: '/email/find/send-code' })
  const fullEmail = () => `${emailId}@${isCustom ? customDomain : domain}`

  const vName = () => {
    setNameError('')
    if (!name) { setNameError('이름을 입력해주세요.'); return false }
    if (name.length < 2) { setNameError('이름은 두 글자 이상 입력해주세요.'); return false }
    return true
  }
  const vEmail = () => {
    setEmailError(''); setEmailValid(false)
    const email = fullEmail()
    if (!emailId) { setEmailError('이메일 아이디를 입력해주세요.'); return false }
    if (!domain && !customDomain) { setEmailError('이메일 도메인을 선택해주세요.'); return false }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('올바른 이메일 주소 형식이 아닙니다.'); return false }
    setEmailValid(true); return true
  }
  const vCode = () => {
    setVerifyError('')
    if (!verifyCode) { setVerifyError('인증번호를 입력하세요.'); return false }
    if (!ev.verified) { setVerifyError('인증을 완료해주세요.'); return false }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vName() || !vEmail() || !vCode()) { alertStore.show('입력 정보를 확인해주세요.', 'danger'); return }
    try {
      const { data } = await api.post<{ output: { userId: string } }>('/find-id', {
        name, email: fullEmail(),
      })
      if (data.output?.userId) {
        router.push(`/find-account/result?output=${encodeURIComponent(JSON.stringify(data.output))}`)
      } else {
        alertStore.show('일치하는 회원 정보를 찾을 수 없습니다.', 'danger')
      }
    } catch (err) {
      alertStore.show(getApiErrorMessage(err, '아이디 찾기에 실패했습니다.'), 'danger')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">이름</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={vName} />
        {nameError && <p className="mt-1 text-xs text-destructive">{nameError}</p>}
      </div>
      <EmailVerifyRow
        emailId={emailId} setEmailId={setEmailId}
        domain={domain} setDomain={setDomain}
        customDomain={customDomain} setCustomDomain={setCustomDomain}
        isCustom={isCustom} setIsCustom={setIsCustom}
        onSendCode={async () => { if (vEmail()) await ev.sendCode(fullEmail()) }}
        sending={ev.sending} onBlur={vEmail} error={emailError} valid={emailValid}
      />
      <div>
        <label className="mb-1 flex items-center gap-1 text-sm font-medium">
          인증번호 {ev.verified && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
        </label>
        <div className="flex gap-2">
          <Input value={verifyCode} onChange={(e) => { setVerifyCode(e.target.value); if (verifyError) setVerifyError('') }} placeholder="인증번호 입력" disabled={ev.verified} />
          <Button type="button" size="sm" onClick={async () => { const ok = await ev.verifyCode(fullEmail(), verifyCode); if (ok) setVerifyError('') }} disabled={ev.verifying || ev.verified}>
            {ev.verified ? '인증 완료' : ev.verifying ? '확인 중...' : '확인'}
          </Button>
        </div>
        {verifyError && <p className="mt-1 text-xs text-destructive">{verifyError}</p>}
      </div>
      <Button type="submit" className="w-full">아이디 찾기</Button>
    </form>
  )
}

// ---------- 비밀번호 찾기 ----------
function ResetPasswordVerifyForm() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')
  const [emailId, setEmailId] = useState('')
  const [domain, setDomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailValid, setEmailValid] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const ev = useEmailVerification({ sendCodeEndpoint: '/email/find/send-code' })
  const fullEmail = () => `${emailId}@${isCustom ? customDomain : domain}`

  const vEmail = () => {
    setEmailError(''); setEmailValid(false)
    const email = fullEmail()
    if (!emailId) { setEmailError('이메일 아이디를 입력해주세요.'); return false }
    if (!domain && !customDomain) { setEmailError('이메일 도메인을 선택해주세요.'); return false }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('올바른 이메일 주소 형식이 아닙니다.'); return false }
    setEmailValid(true); return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!userId || userId.length < 4) errs.userId = '아이디를 입력해주세요.'
    if (!name || name.length < 2) errs.name = '이름을 입력해주세요.'
    if (!vEmail()) errs.email = emailError
    if (!ev.verified) { setVerifyError('인증을 완료해주세요.'); errs.verify = '인증 필요' }
    setErrors(errs)
    if (Object.keys(errs).length) { alertStore.show('입력 정보를 확인해주세요.', 'danger'); return }

    try {
      await api.post('/reset-password/verify', { userId, name, email: fullEmail() }, { withCredentials: true })
      // 인터셉터가 OK 상태만 통과시키므로 catch 없이 바로 이동
      alertStore.show('비밀번호 재설정 페이지로 이동합니다.', 'success')
      router.push('/reset-password')
    } catch (err) {
      alertStore.show(getApiErrorMessage(err, '일치하는 회원 정보를 찾을 수 없습니다.'), 'danger')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">아이디</label>
        <Input value={userId} onChange={(e) => setUserId(e.target.value)} />
        {errors.userId && <p className="mt-1 text-xs text-destructive">{errors.userId}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">이름</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
      </div>
      <EmailVerifyRow
        emailId={emailId} setEmailId={setEmailId}
        domain={domain} setDomain={setDomain}
        customDomain={customDomain} setCustomDomain={setCustomDomain}
        isCustom={isCustom} setIsCustom={setIsCustom}
        onSendCode={async () => { if (vEmail()) await ev.sendCode(fullEmail()) }}
        sending={ev.sending} onBlur={vEmail} error={emailError} valid={emailValid}
      />
      <div>
        <label className="mb-1 flex items-center gap-1 text-sm font-medium">
          인증번호 {ev.verified && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
        </label>
        <div className="flex gap-2">
          <Input value={verifyCode} onChange={(e) => { setVerifyCode(e.target.value); if (verifyError) setVerifyError('') }} placeholder="인증번호 입력" disabled={ev.verified} />
          <Button type="button" size="sm" onClick={async () => { const ok = await ev.verifyCode(fullEmail(), verifyCode); if (ok) setVerifyError('') }} disabled={ev.verifying || ev.verified}>
            {ev.verified ? '인증 완료' : ev.verifying ? '확인 중...' : '확인'}
          </Button>
        </div>
        {verifyError && <p className="mt-1 text-xs text-destructive">{verifyError}</p>}
      </div>
      <Button type="submit" className="w-full">비밀번호 찾기</Button>
    </form>
  )
}

// ---------- 메인 탭 컴포넌트 ----------
export default function FindAccountForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get('tab') === 'resetPassword' ? 'resetPassword' : 'findId'
  const [tab, setTab] = useState<'findId' | 'resetPassword'>(initialTab)

  const changeTab = (t: 'findId' | 'resetPassword') => {
    setTab(t)
    router.replace(`/find-account?tab=${t}`)
  }

  const tabCls = (active: boolean) =>
    cn('flex-1 cursor-pointer rounded-md py-2 text-sm font-medium transition-colors',
      active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">아이디 / 비밀번호 찾기</h1>
        <div className="rounded-xl border bg-card p-6 shadow-lg">
          <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
            <button className={tabCls(tab === 'findId')} onClick={() => changeTab('findId')}>아이디 찾기</button>
            <button className={tabCls(tab === 'resetPassword')} onClick={() => changeTab('resetPassword')}>비밀번호 찾기</button>
          </div>
          {tab === 'findId' ? <FindIdForm /> : <ResetPasswordVerifyForm />}
        </div>
      </div>
    </div>
  )
}
