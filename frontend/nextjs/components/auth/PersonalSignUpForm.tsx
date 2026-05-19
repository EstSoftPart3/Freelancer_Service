'use client'
// Mirrors vue_js/src/fo/components/login&signup/PersonalSignUpForm.vue
import { useCallback, useRef, useState } from 'react'
import Script from 'next/script'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useEmailVerification } from '@/hooks/useEmailVerification'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { DaumPostcodeResult } from '@/types'
import { cn } from '@/lib/utils'

const EMAIL_DOMAINS = ['naver.com', 'gmail.com', 'daum.net', 'nate.com', 'hotmail.com']

interface Props {
  onSubmit: (data: Record<string, unknown>) => void
}

// 필드별 에러 + 유효 상태를 단순화한 훅
function useField(initialValue = '') {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')
  const [valid, setValid] = useState(false)
  return { value, setValue, error, setError, valid, setValid }
}

export default function PersonalSignUpForm({ onSubmit }: Props) {
  const idField = useField()
  const pwField = useField()
  const cpwField = useField()
  const nameField = useField()
  const dobField = useField()
  const [gender, setGender] = useState('')
  const [genderError, setGenderError] = useState('')
  const [genderValid, setGenderValid] = useState(false)
  const phoneField = useField()
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
  const idDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const emailVerify = useEmailVerification({ sendCodeEndpoint: '/email/send-code' })

  const fullEmail = () =>
    `${emailIdField.value}@${isCustomDomain ? customDomain : emailDomain}`

  // --- 유효성 검사 함수들 ---
  const validateId = useCallback(async (val: string) => {
    idField.setError('')
    idField.setValid(false)
    if (!val) { idField.setError('아이디를 입력해주세요.'); return }
    if (!/^[a-zA-Z0-9]{5,20}$/.test(val)) {
      idField.setError('영문 또는 숫자 5~20자로 입력해주세요.')
      return
    }
    try {
      const { data } = await api.get<boolean>(`/check-id?userId=${val}`)
      if (data) { idField.setError('이미 사용 중인 아이디입니다.') }
      else idField.setValid(true)
    } catch { idField.setError('서버 오류가 발생했습니다.') }
  }, [idField])

  const onIdChange = (val: string) => {
    idField.setValue(val)
    if (idDebounce.current) clearTimeout(idDebounce.current)
    idDebounce.current = setTimeout(() => validateId(val), 500)
  }

  const validatePw = () => {
    pwField.setError('')
    pwField.setValid(false)
    if (!pwField.value) { pwField.setError('비밀번호를 입력해주세요.'); return }
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pwField.value)) {
      pwField.setError('8자 이상, 영문·숫자·특수문자를 조합해 입력해주세요.')
      return
    }
    pwField.setValid(true)
  }

  const validateCpw = () => {
    cpwField.setError('')
    cpwField.setValid(false)
    if (!cpwField.value) { cpwField.setError('비밀번호 확인을 입력해주세요.'); return }
    if (cpwField.value !== pwField.value) { cpwField.setError('비밀번호가 일치하지 않습니다.'); return }
    cpwField.setValid(true)
  }

  const validateName = () => {
    nameField.setError('')
    nameField.setValid(false)
    if (!nameField.value) { nameField.setError('이름을 입력해주세요.'); return }
    if (nameField.value.length < 2) { nameField.setError('이름은 두 글자 이상 입력해주세요.'); return }
    nameField.setValid(true)
  }

  const validateDob = () => {
    dobField.setError('')
    dobField.setValid(false)
    if (!dobField.value) { dobField.setError('생년월일을 입력해주세요.'); return }
    dobField.setValid(true)
  }

  const validateGender = () => {
    setGenderError('')
    setGenderValid(false)
    if (!gender) { setGenderError('성별을 선택해주세요.'); return }
    setGenderValid(true)
  }

  const validatePhone = () => {
    phoneField.setError('')
    phoneField.setValid(false)
    if (!phoneField.value) { phoneField.setError('휴대폰 번호를 입력해주세요.'); return }
    if (!/^\d{10,11}$/.test(phoneField.value)) {
      phoneField.setError('올바른 휴대폰 번호 형식이 아닙니다. (하이픈 제외)')
      return
    }
    phoneField.setValid(true)
  }

  const validateAddress = () => {
    addressField.setError('')
    addressField.setValid(false)
    if (!addressField.value) { addressField.setError('주소를 입력해주세요.'); return }
    addressField.setValid(true)
  }

  const validateEmail = () => {
    emailIdField.setError('')
    emailIdField.setValid(false)
    const email = fullEmail()
    if (!emailIdField.value) { emailIdField.setError('이메일 아이디를 입력해주세요.'); return }
    if (isCustomDomain && !customDomain) { emailIdField.setError('도메인을 입력해주세요.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { emailIdField.setError('올바른 이메일 주소 형식이 아닙니다.'); return }
    emailIdField.setValid(true)
  }

  const validateVerifyCode = () => {
    setVerifyError('')
    if (!verifyCode) { setVerifyError('인증번호를 입력하세요.'); return false }
    if (!emailVerify.verified) { setVerifyError('인증을 완료해주세요.'); return false }
    return true
  }

  const validateTerms = () => {
    setTermsError('')
    if (!terms) { setTermsError('필수 약관에 동의해주세요.'); return false }
    return true
  }

  const openPostcode = () => {
    if (!window.daum) { alertStore.show('주소 검색 서비스를 불러오는 중입니다.', 'danger'); return }
    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeResult) => {
        const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
        setPostcode(data.zonecode)
        addressField.setValue(addr)
        addressField.setError('')
        addressField.setValid(true)
        setSigunguCode(data.sigunguCode)
        setAddressDetail('')
        if (window.kakao?.maps) {
          const geocoder = new window.kakao.maps.services.Geocoder()
          geocoder.addressSearch(addr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              setLatitude(result[0].y)
              setLongitude(result[0].x)
            }
          })
        }
      },
    }).open()
  }

  const handleDomainChange = (val: string) => {
    if (val === 'custom') {
      setIsCustomDomain(true)
      setCustomDomain('')
      setEmailDomain('custom')
    } else {
      setIsCustomDomain(false)
      setEmailDomain(val)
    }
  }

  const handleSendCode = async () => {
    validateEmail()
    if (!emailIdField.valid && !(emailIdField.value && (emailDomain || customDomain))) return
    await emailVerify.sendCode(fullEmail())
  }

  const handleVerifyCode = async () => {
    await emailVerify.verifyCode(fullEmail(), verifyCode)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await validateId(idField.value)
    validatePw(); validateCpw(); validateName(); validateDob()
    validateGender(); validatePhone(); validateAddress(); validateEmail()
    const vcOk = validateVerifyCode()
    const tOk = validateTerms()

    const isValid =
      idField.valid && pwField.valid && cpwField.valid && nameField.valid &&
      dobField.valid && genderValid && phoneField.valid && addressField.valid &&
      emailIdField.valid && emailVerify.verified && vcOk && tOk

    if (!isValid) { alertStore.show('입력 정보를 확인해주세요.', 'danger'); return }

    onSubmit({
      id: idField.value,
      password: pwField.value,
      name: nameField.value,
      dob: dobField.value,
      gender,
      phone: phoneField.value,
      address: addressField.value,
      addressDetail,
      postcode,
      sigunguCode,
      latitude,
      longitude,
      emailId: emailIdField.value,
      emailDomain: isCustomDomain ? customDomain : emailDomain,
      terms,
      typeCode: 301,
      signupTypeCode: 204,
    })
  }

  const FieldLabel = ({ label, valid }: { label: string; valid: boolean }) => (
    <label className="mb-1 flex items-center gap-1 text-sm font-medium">
      {label}
      {valid && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
    </label>
  )

  const ErrorMsg = ({ msg }: { msg: string }) =>
    msg ? <p className="mt-1 text-xs text-destructive">{msg}</p> : null

  return (
    <>
      {/* Daum 우편번호 API */}
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 아이디 */}
        <div>
          <FieldLabel label="아이디" valid={idField.valid} />
          <Input
            value={idField.value}
            onChange={(e) => onIdChange(e.target.value)}
            placeholder="영문·숫자 5~20자"
          />
          <ErrorMsg msg={idField.error} />
        </div>

        {/* 비밀번호 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel label="비밀번호" valid={pwField.valid} />
            <Input type="password" value={pwField.value} onChange={(e) => pwField.setValue(e.target.value)} onBlur={validatePw} />
            <ErrorMsg msg={pwField.error} />
          </div>
          <div>
            <FieldLabel label="비밀번호 확인" valid={cpwField.valid} />
            <Input type="password" value={cpwField.value} onChange={(e) => cpwField.setValue(e.target.value)} onBlur={validateCpw} />
            <ErrorMsg msg={cpwField.error} />
          </div>
        </div>

        {/* 이름 */}
        <div>
          <FieldLabel label="이름" valid={nameField.valid} />
          <Input value={nameField.value} onChange={(e) => nameField.setValue(e.target.value)} onBlur={validateName} />
          <ErrorMsg msg={nameField.error} />
        </div>

        {/* 생년월일 / 성별 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel label="생년월일" valid={dobField.valid} />
            <Input type="date" value={dobField.value} onChange={(e) => dobField.setValue(e.target.value)} onBlur={validateDob} max={new Date().toISOString().split('T')[0]} />
            <ErrorMsg msg={dobField.error} />
          </div>
          <div>
            <FieldLabel label="성별" valid={genderValid} />
            <select
              value={gender}
              onChange={(e) => { setGender(e.target.value); setGenderValid(true); setGenderError('') }}
              className="flex h-8 w-full rounded-lg border border-border bg-background px-2 text-sm"
            >
              <option value="">선택</option>
              <option value="101">남성</option>
              <option value="102">여성</option>
            </select>
            <ErrorMsg msg={genderError} />
          </div>
        </div>

        {/* 휴대폰 */}
        <div>
          <FieldLabel label="휴대폰 번호" valid={phoneField.valid} />
          <Input value={phoneField.value} onChange={(e) => phoneField.setValue(e.target.value)} onBlur={validatePhone} placeholder="하이픈 제외" />
          <ErrorMsg msg={phoneField.error} />
        </div>

        {/* 주소 */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <FieldLabel label="주소" valid={addressField.valid} />
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
            <Input className="w-28 min-w-0 flex-1" value={emailIdField.value} onChange={(e) => emailIdField.setValue(e.target.value)} onBlur={validateEmail} placeholder="아이디" />
            <span className="flex items-center px-1 text-sm">@</span>
            <Input
              className="w-28 min-w-0 flex-1"
              value={isCustomDomain ? customDomain : emailDomain}
              readOnly={!isCustomDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="도메인"
            />
            <select
              value={isCustomDomain ? 'custom' : emailDomain}
              onChange={(e) => handleDomainChange(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
            >
              <option value="" disabled>선택</option>
              {EMAIL_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              <option value="custom">직접입력</option>
            </select>
            <Button type="button" size="sm" onClick={handleSendCode} disabled={emailVerify.sending}>
              {emailVerify.sending ? '전송 중...' : '인증 요청'}
            </Button>
          </div>
          <ErrorMsg msg={emailIdField.error} />
        </div>

        {/* 인증번호 */}
        <div>
          <FieldLabel label="인증번호" valid={emailVerify.verified} />
          <div className="flex gap-2">
            <Input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="인증번호 입력" />
            <Button type="button" size="sm" onClick={handleVerifyCode} disabled={emailVerify.verifying}>
              {emailVerify.verifying ? '확인 중...' : '확인'}
            </Button>
          </div>
          <ErrorMsg msg={verifyError} />
        </div>

        {/* 약관 */}
        <div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={terms} onCheckedChange={(v) => { setTerms(!!v); if (v) setTermsError('') }} />
            약관에 동의합니다.
          </label>
          <ErrorMsg msg={termsError} />
        </div>

        <Button type="submit" className="w-full">회원가입</Button>
      </form>
    </>
  )
}
