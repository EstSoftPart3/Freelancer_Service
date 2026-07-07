'use client'
// Mirrors vue_js/src/fo/components/login&signup/CompanySignUpForm.vue
import { useCallback, useRef, useState } from 'react'
import Script from 'next/script'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEmailVerification } from '@/hooks/useEmailVerification'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { loadKakaoMaps } from '@/lib/kakao'
import { companyAgreementText } from '@/lib/terms'
import { DaumPostcodeResult } from '@/types'

const EMAIL_DOMAINS = ['naver.com', 'gmail.com', 'daum.net', 'nate.com', 'hotmail.com', 'yahoo.com']

interface Props {
  onSubmit: (data: Record<string, unknown>) => void
}

const FieldLabel = ({ label, valid }: { label: string; valid: boolean }) => (
  <label className="mb-1 flex items-center gap-1 text-sm font-medium">
    {label} {valid && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
  </label>
)
const ErrorMsg = ({ msg }: { msg: string }) =>
  msg ? <p className="mt-1 text-xs text-destructive">{msg}</p> : null

function useField(initialValue = '') {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')
  const [valid, setValid] = useState(false)
  return { value, setValue, error, setError, valid, setValid }
}

export default function CompanySignUpForm({ onSubmit }: Props) {
  const idField = useField()
  const pwField = useField()
  const cpwField = useField()
  const nameField = useField()        // 담당자 이름
  const phoneField = useField()
  const companyNameField = useField() // 기업명
  const addressField = useField()
  const [addressDetail, setAddressDetail] = useState('')
  const [postcode, setPostcode] = useState('')
  const [sigunguCode, setSigunguCode] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const emailIdField = useField()
  const [emailDomain, setEmailDomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [isCustomDomain, setIsCustomDomain] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [terms, setTerms] = useState(false)
  const [termsError, setTermsError] = useState('')
  const [termsOpen, setTermsOpen] = useState(false)
  const idDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const emailVerify = useEmailVerification({ sendCodeEndpoint: '/email/send-code' })
  const fullEmail = () => `${emailIdField.value}@${isCustomDomain ? customDomain : emailDomain}`

  // 실시간 검증: 인자값을 검사하고 boolean 반환 (submit이 stale 플래그를 읽지 않도록)
  const validateId = useCallback(async (val: string): Promise<boolean> => {
    if (!val) { idField.setError('아이디를 입력해주세요.'); idField.setValid(false); return false }
    if (!/^[a-zA-Z0-9]{5,20}$/.test(val)) { idField.setError('영문 또는 숫자 5~20자로 입력해주세요.'); idField.setValid(false); return false }
    try {
      const { data } = await api.get<boolean>(`/check-id?userId=${val}`)
      if (data) { idField.setError('이미 사용 중인 아이디입니다.'); idField.setValid(false); return false }
      idField.setError(''); idField.setValid(true); return true
    } catch { idField.setError('서버 오류가 발생했습니다.'); idField.setValid(false); return false }
  }, [idField])

  const onIdChange = (val: string) => {
    idField.setValue(val)
    if (idDebounce.current) clearTimeout(idDebounce.current)
    idDebounce.current = setTimeout(() => validateId(val), 500)
  }

  const validatePw = (val = pwField.value) => {
    if (!val) { pwField.setError('비밀번호를 입력해주세요.'); pwField.setValid(false); return false }
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(val)) {
      pwField.setError('8자 이상, 영문·숫자·특수문자를 조합해 입력해주세요.'); pwField.setValid(false); return false
    }
    pwField.setError(''); pwField.setValid(true); return true
  }

  const validateCpw = (val = cpwField.value, pw = pwField.value) => {
    if (!val) { cpwField.setError('비밀번호 확인을 입력해주세요.'); cpwField.setValid(false); return false }
    if (val !== pw) { cpwField.setError('비밀번호가 일치하지 않습니다.'); cpwField.setValid(false); return false }
    if (!validatePw(pw)) {
      cpwField.setError('비밀번호가 조건을 만족하지 않습니다.'); cpwField.setValid(false); return false
    }
    cpwField.setError(''); cpwField.setValid(true); return true
  }

  const validateName = (val = nameField.value) => {
    if (!val) { nameField.setError('담당자 이름을 입력해주세요.'); nameField.setValid(false); return false }
    if (!/^[가-힣a-zA-Z]{2,20}$/.test(val)) {
      nameField.setError('한글 또는 영문 2~20자로 입력해주세요. (숫자·특수문자·공백 불가)')
      nameField.setValid(false); return false
    }
    nameField.setError(''); nameField.setValid(true); return true
  }

  const validateCompanyName = (val = companyNameField.value) => {
    if (!val) { companyNameField.setError('기업명을 입력해주세요.'); companyNameField.setValid(false); return false }
    companyNameField.setError(''); companyNameField.setValid(true); return true
  }

  const validatePhone = (val = phoneField.value) => {
    if (!val) { phoneField.setError('휴대폰 번호를 입력해주세요.'); phoneField.setValid(false); return false }
    if (!/^01\d{8,9}$/.test(val)) {
      phoneField.setError('올바른 휴대폰 번호가 아닙니다. (01로 시작, 10~11자리 숫자)')
      phoneField.setValid(false); return false
    }
    phoneField.setError(''); phoneField.setValid(true); return true
  }

  const validateAddress = (val = addressField.value) => {
    if (!val) { addressField.setError('주소를 입력해주세요.'); addressField.setValid(false); return false }
    addressField.setError(''); addressField.setValid(true); return true
  }

  const validateEmail = (val = emailIdField.value) => {
    const email = `${val}@${isCustomDomain ? customDomain : emailDomain}`
    if (!val) { emailIdField.setError('이메일 아이디를 입력해주세요.'); emailIdField.setValid(false); return false }
    if (isCustomDomain && !customDomain) { emailIdField.setError('도메인을 입력해주세요.'); emailIdField.setValid(false); return false }
    if (!/\S+@\S+\.\S+/.test(email)) { emailIdField.setError('올바른 이메일 주소 형식이 아닙니다.'); emailIdField.setValid(false); return false }
    emailIdField.setError(''); emailIdField.setValid(true); return true
  }

  const openPostcode = () => {
    if (!window.daum) return
    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeResult) => {
        const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
        setPostcode(data.zonecode)
        addressField.setValue(addr); addressField.setError(''); addressField.setValid(true)
        setSigunguCode(data.sigunguCode); setAddressDetail('')
        loadKakaoMaps().then(() => {
          new window.kakao.maps.services.Geocoder().addressSearch(addr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              setLatitude(result[0].y); setLongitude(result[0].x)
            } else {
              setLatitude(''); setLongitude('')
            }
          })
        })
      },
    }).open()
  }

  // 이메일 주소가 바뀌면 이전 인증 상태가 새 주소에 그대로 남아 인증번호 입력이
  // "인증 완료"로 잠기는 문제를 막기 위해 인증 상태를 초기화한다.
  const resetEmailVerification = () => {
    emailVerify.reset()
    setVerifyCode('')
    setVerifyError('')
  }

  const handleDomainChange = (val: string) => {
    resetEmailVerification()
    if (val === 'custom') { setIsCustomDomain(true); setCustomDomain(''); setEmailDomain('custom') }
    else { setIsCustomDomain(false); setEmailDomain(val) }
  }

  const handleVerifyCode = async () => {
    const ok = await emailVerify.verifyCode(fullEmail(), verifyCode)
    if (ok) setVerifyError('')   // 인증 성공 시 이전 에러 문구 제거
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // stale state를 읽지 않도록 각 검사의 반환값으로 판정한다.
    const okId = await validateId(idField.value)
    const okPw = validatePw()
    const okCpw = validateCpw()
    const okName = validateName()
    const okPhone = validatePhone()
    const okCompany = validateCompanyName()
    const okAddr = validateAddress()
    const okEmail = validateEmail()
    const vcOk = emailVerify.verified || (setVerifyError('인증을 완료해주세요.'), false)
    const tOk = terms || (setTermsError('필수 약관에 동의해주세요.'), false)

    const allValid =
      okId && okPw && okCpw && okName && okPhone && okCompany && okAddr &&
      okEmail && vcOk && tOk

    if (!allValid) { alertStore.show('입력 정보를 확인해주세요.', 'danger'); return }

    onSubmit({
      id: idField.value, password: pwField.value, name: nameField.value,
      phone: phoneField.value, companyName: companyNameField.value,
      address: addressField.value, addressDetail, postcode, sigunguCode, latitude, longitude,
      emailId: emailIdField.value,
      emailDomain: isCustomDomain ? customDomain : emailDomain,
      terms, typeCode: 302, signupTypeCode: 204,
    })
  }

  return (
    <>
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 아이디 */}
        <div>
          <FieldLabel label="아이디" valid={idField.valid} />
          <Input value={idField.value} onChange={(e) => onIdChange(e.target.value)} placeholder="영문·숫자 5~20자" />
          <ErrorMsg msg={idField.error} />
        </div>

        {/* 비밀번호 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel label="비밀번호" valid={pwField.valid} />
            <Input
              type="password"
              value={pwField.value}
              onChange={(e) => {
                const v = e.target.value
                pwField.setValue(v)
                validatePw(v)
                if (cpwField.value) validateCpw(cpwField.value, v)
              }}
            />
            <ErrorMsg msg={pwField.error} />
          </div>
          <div>
            <FieldLabel label="비밀번호 확인" valid={cpwField.valid} />
            <Input type="password" value={cpwField.value} onChange={(e) => { cpwField.setValue(e.target.value); validateCpw(e.target.value) }} />
            <ErrorMsg msg={cpwField.error} />
          </div>
        </div>

        {/* 담당자 이름 / 휴대폰 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel label="담당자 이름" valid={nameField.valid} />
            <Input value={nameField.value} onChange={(e) => { nameField.setValue(e.target.value); validateName(e.target.value) }} />
            <ErrorMsg msg={nameField.error} />
          </div>
          <div>
            <FieldLabel label="휴대폰 번호" valid={phoneField.valid} />
            <Input
              value={phoneField.value}
              inputMode="numeric"
              maxLength={11}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 11)
                phoneField.setValue(v)
                validatePhone(v)
              }}
              placeholder="숫자만 입력 (하이픈 제외)"
            />
            <ErrorMsg msg={phoneField.error} />
          </div>
        </div>

        {/* 기업명 */}
        <div>
          <FieldLabel label="기업명" valid={companyNameField.valid} />
          <Input value={companyNameField.value} onChange={(e) => { companyNameField.setValue(e.target.value); validateCompanyName(e.target.value) }} />
          <ErrorMsg msg={companyNameField.error} />
        </div>

        {/* 주소 */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <FieldLabel label="회사 주소" valid={addressField.valid} />
            <Input value={addressField.value} readOnly onClick={openPostcode} placeholder="클릭하여 검색" className="cursor-pointer" />
            <ErrorMsg msg={addressField.error} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">상세 주소</label>
            <Input value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} />
          </div>
        </div>

        {/* 이메일 */}
        <div>
          <FieldLabel label="이메일 주소" valid={emailIdField.valid} />
          <div className="flex flex-wrap gap-1">
            <Input className="w-28 min-w-0 flex-1" value={emailIdField.value} onChange={(e) => { emailIdField.setValue(e.target.value); validateEmail(e.target.value); resetEmailVerification() }} placeholder="아이디" />
            <span className="flex items-center px-1 text-sm">@</span>
            <Input className="w-28 min-w-0 flex-1" value={isCustomDomain ? customDomain : emailDomain} readOnly={!isCustomDomain} onChange={(e) => { setCustomDomain(e.target.value); if (emailIdField.value) validateEmail(emailIdField.value); resetEmailVerification() }} placeholder="도메인" />
            <select value={isCustomDomain ? 'custom' : emailDomain} onChange={(e) => handleDomainChange(e.target.value)} className="h-8 cursor-pointer rounded-lg border border-border bg-background px-2 text-sm">
              <option value="" disabled>선택</option>
              {EMAIL_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              <option value="custom">직접입력</option>
            </select>
            <Button type="button" size="sm" onClick={async () => { validateEmail(); await emailVerify.sendCode(fullEmail()) }} disabled={emailVerify.sending}>
              {emailVerify.sending ? '전송 중...' : '인증 요청'}
            </Button>
          </div>
          <ErrorMsg msg={emailIdField.error} />
        </div>

        {/* 인증번호 */}
        <div>
          <FieldLabel label="인증번호" valid={emailVerify.verified} />
          <div className="flex gap-2">
            <Input value={verifyCode} onChange={(e) => { setVerifyCode(e.target.value); if (verifyError) setVerifyError('') }} placeholder="인증번호 입력" disabled={emailVerify.verified} />
            <Button type="button" size="sm" onClick={handleVerifyCode} disabled={emailVerify.verifying || emailVerify.verified}>
              {emailVerify.verified ? '인증 완료' : emailVerify.verifying ? '확인 중...' : '확인'}
            </Button>
          </div>
          <ErrorMsg msg={verifyError} />
        </div>

        {/* 약관 */}
        <div>
          <div className="flex items-center gap-2 text-sm">
            <Checkbox checked={terms} onCheckedChange={(v) => { setTerms(!!v); if (v) setTermsError('') }} />
            <span>약관에 동의합니다.</span>
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className="cursor-pointer text-primary underline underline-offset-2 hover:opacity-80"
            >
              이용약관
            </button>
          </div>
          <ErrorMsg msg={termsError} />
        </div>

        <Button type="submit" className="w-full">회원가입</Button>
      </form>

      {/* 이용약관 Dialog */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>기업정보 수집 및 이용 동의서</DialogTitle>
          </DialogHeader>
          <div
            className="prose prose-sm max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: companyAgreementText }}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setTermsOpen(false)}>닫기</Button>
            <Button onClick={() => { setTerms(true); setTermsError(''); setTermsOpen(false) }}>
              동의합니다
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
