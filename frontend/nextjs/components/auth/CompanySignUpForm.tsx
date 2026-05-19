'use client'
// Mirrors vue_js/src/fo/components/login&signup/CompanySignUpForm.vue
// Personal 폼과 구조 동일, 생년월일/성별 제거 + 기업 정보 추가
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

const EMAIL_DOMAINS = ['naver.com', 'gmail.com', 'daum.net', 'nate.com', 'hotmail.com']

interface Props {
  onSubmit: (data: Record<string, unknown>) => void
}

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
  const nameField = useField()      // 담당자 이름
  const phoneField = useField()
  const companyNameField = useField()
  const ceoNameField = useField()
  const bizNumField = useField()
  const openDateField = useField()
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
  const fullEmail = () => `${emailIdField.value}@${isCustomDomain ? customDomain : emailDomain}`

  const validateId = useCallback(async (val: string) => {
    idField.setError(''); idField.setValid(false)
    if (!val) { idField.setError('아이디를 입력해주세요.'); return }
    if (!/^[a-zA-Z0-9]{5,20}$/.test(val)) { idField.setError('영문 또는 숫자 5~20자로 입력해주세요.'); return }
    try {
      const { data } = await api.get<boolean>(`/check-id?userId=${val}`)
      if (data) idField.setError('이미 사용 중인 아이디입니다.')
      else idField.setValid(true)
    } catch { idField.setError('서버 오류가 발생했습니다.') }
  }, [idField])

  const onIdChange = (val: string) => {
    idField.setValue(val)
    if (idDebounce.current) clearTimeout(idDebounce.current)
    idDebounce.current = setTimeout(() => validateId(val), 500)
  }

  const validatePw = () => {
    pwField.setError(''); pwField.setValid(false)
    if (!pwField.value) { pwField.setError('비밀번호를 입력해주세요.'); return }
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pwField.value)) {
      pwField.setError('8자 이상, 영문·숫자·특수문자를 조합해 입력해주세요.'); return
    }
    pwField.setValid(true)
  }

  const validateCpw = () => {
    cpwField.setError(''); cpwField.setValid(false)
    if (!cpwField.value) { cpwField.setError('비밀번호 확인을 입력해주세요.'); return }
    if (cpwField.value !== pwField.value) { cpwField.setError('비밀번호가 일치하지 않습니다.'); return }
    cpwField.setValid(true)
  }

  const req = (field: ReturnType<typeof useField>, msg: string) => {
    field.setError(''); field.setValid(false)
    if (!field.value) { field.setError(msg); return false }
    field.setValid(true); return true
  }

  const validatePhone = () => {
    phoneField.setError(''); phoneField.setValid(false)
    if (!phoneField.value) { phoneField.setError('휴대폰 번호를 입력해주세요.'); return }
    if (!/^\d{10,11}$/.test(phoneField.value)) { phoneField.setError('올바른 휴대폰 번호 형식이 아닙니다. (하이픈 제외)'); return }
    phoneField.setValid(true)
  }

  const validateEmail = () => {
    emailIdField.setError(''); emailIdField.setValid(false)
    const email = fullEmail()
    if (!emailIdField.value) { emailIdField.setError('이메일 아이디를 입력해주세요.'); return }
    if (isCustomDomain && !customDomain) { emailIdField.setError('도메인을 입력해주세요.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { emailIdField.setError('올바른 이메일 주소 형식이 아닙니다.'); return }
    emailIdField.setValid(true)
  }

  const openPostcode = () => {
    if (!window.daum) return
    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeResult) => {
        const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
        setPostcode(data.zonecode)
        addressField.setValue(addr); addressField.setError(''); addressField.setValid(true)
        setSigunguCode(data.sigunguCode); setAddressDetail('')
        if (window.kakao?.maps) {
          new window.kakao.maps.services.Geocoder().addressSearch(addr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              setLatitude(result[0].y); setLongitude(result[0].x)
            }
          })
        }
      },
    }).open()
  }

  const handleDomainChange = (val: string) => {
    if (val === 'custom') { setIsCustomDomain(true); setCustomDomain(''); setEmailDomain('custom') }
    else { setIsCustomDomain(false); setEmailDomain(val) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await validateId(idField.value)
    validatePw(); validateCpw()
    req(nameField, '담당자 이름을 입력해주세요.')
    validatePhone()
    req(companyNameField, '기업명을 입력해주세요.')
    req(ceoNameField, '대표자 이름을 입력해주세요.')
    req(bizNumField, '사업자 번호를 입력해주세요.')
    req(openDateField, '개업일을 입력해주세요.')
    req(addressField, '주소를 입력해주세요.')
    validateEmail()
    const vcOk = emailVerify.verified || (setVerifyError('인증을 완료해주세요.'), false)
    const tOk = terms || (setTermsError('필수 약관에 동의해주세요.'), false)

    const allValid =
      idField.valid && pwField.valid && cpwField.valid && nameField.valid &&
      phoneField.valid && companyNameField.valid && ceoNameField.valid &&
      bizNumField.valid && openDateField.valid && addressField.valid &&
      emailIdField.valid && vcOk && tOk

    if (!allValid) { alertStore.show('입력 정보를 확인해주세요.', 'danger'); return }

    onSubmit({
      id: idField.value, password: pwField.value, name: nameField.value,
      phone: phoneField.value, companyName: companyNameField.value,
      companyCeoName: ceoNameField.value, companyBizNumber: bizNumField.value,
      companyOpenDate: openDateField.value, address: addressField.value,
      addressDetail, postcode, sigunguCode, latitude, longitude,
      emailId: emailIdField.value,
      emailDomain: isCustomDomain ? customDomain : emailDomain,
      terms, typeCode: 302, signupTypeCode: 204,
    })
  }

  const FieldLabel = ({ label, valid }: { label: string; valid: boolean }) => (
    <label className="mb-1 flex items-center gap-1 text-sm font-medium">
      {label} {valid && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
    </label>
  )
  const ErrorMsg = ({ msg }: { msg: string }) =>
    msg ? <p className="mt-1 text-xs text-destructive">{msg}</p> : null

  return (
    <>
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel label="아이디" valid={idField.valid} />
          <Input value={idField.value} onChange={(e) => onIdChange(e.target.value)} placeholder="영문·숫자 5~20자" />
          <ErrorMsg msg={idField.error} />
        </div>

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel label="담당자 이름" valid={nameField.valid} />
            <Input value={nameField.value} onChange={(e) => nameField.setValue(e.target.value)} onBlur={() => req(nameField, '담당자 이름을 입력해주세요.')} />
            <ErrorMsg msg={nameField.error} />
          </div>
          <div>
            <FieldLabel label="휴대폰 번호" valid={phoneField.valid} />
            <Input value={phoneField.value} onChange={(e) => phoneField.setValue(e.target.value)} onBlur={validatePhone} placeholder="하이픈 제외" />
            <ErrorMsg msg={phoneField.error} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel label="기업명" valid={companyNameField.valid} />
            <Input value={companyNameField.value} onChange={(e) => companyNameField.setValue(e.target.value)} onBlur={() => req(companyNameField, '기업명을 입력해주세요.')} />
            <ErrorMsg msg={companyNameField.error} />
          </div>
          <div>
            <FieldLabel label="대표자 이름" valid={ceoNameField.valid} />
            <Input value={ceoNameField.value} onChange={(e) => ceoNameField.setValue(e.target.value)} onBlur={() => req(ceoNameField, '대표자 이름을 입력해주세요.')} />
            <ErrorMsg msg={ceoNameField.error} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel label="사업자 번호" valid={bizNumField.valid} />
            <Input value={bizNumField.value} onChange={(e) => bizNumField.setValue(e.target.value)} onBlur={() => req(bizNumField, '사업자 번호를 입력해주세요.')} placeholder="숫자만" />
            <ErrorMsg msg={bizNumField.error} />
          </div>
          <div>
            <FieldLabel label="개업일" valid={openDateField.valid} />
            <Input type="date" value={openDateField.value} onChange={(e) => openDateField.setValue(e.target.value)} onBlur={() => req(openDateField, '개업일을 입력해주세요.')} max={new Date().toISOString().split('T')[0]} />
            <ErrorMsg msg={openDateField.error} />
          </div>
        </div>

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

        <div>
          <FieldLabel label="이메일 주소" valid={emailIdField.valid} />
          <div className="flex flex-wrap gap-1">
            <Input className="w-28 min-w-0 flex-1" value={emailIdField.value} onChange={(e) => emailIdField.setValue(e.target.value)} onBlur={validateEmail} placeholder="아이디" />
            <span className="flex items-center px-1 text-sm">@</span>
            <Input className="w-28 min-w-0 flex-1" value={isCustomDomain ? customDomain : emailDomain} readOnly={!isCustomDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="도메인" />
            <select value={isCustomDomain ? 'custom' : emailDomain} onChange={(e) => handleDomainChange(e.target.value)} className="h-8 rounded-lg border border-border bg-background px-2 text-sm">
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

        <div>
          <FieldLabel label="인증번호" valid={emailVerify.verified} />
          <div className="flex gap-2">
            <Input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="인증번호 입력" />
            <Button type="button" size="sm" onClick={() => emailVerify.verifyCode(fullEmail(), verifyCode)} disabled={emailVerify.verifying}>
              {emailVerify.verifying ? '확인 중...' : '확인'}
            </Button>
          </div>
          <ErrorMsg msg={verifyError} />
        </div>

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
