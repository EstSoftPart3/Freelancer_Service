import { useState, useEffect, useCallback } from 'react'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import debounce from 'lodash/debounce'
import CompanyVerificationModal from './CompanyVerificationModal'
import styles from './CompanySignUpForm.module.css'

export default function CompanySignUpForm({ onSubmit }) {
  const { showAlert } = useAlert()

  // 기업 인증 모달 상태
  const [showCompanyModal, setShowCompanyModal] = useState(false)

  // 폼 데이터
  const [form, setForm] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    emailId: '',
    emailDomain: '',
    verificationCode: '',
    terms: false,
    companyName: '',
    companyCeoName: '',
    companyBizNumber: '',
    companyOpenDate: '',
    sigunguCode: '',
    address: '',
    addressDetail: '',
    latitude: '',
    longitude: '',
    typeCode: 302, // 기업
    signupTypeCode: 204, // 이메일
  })

  // 이메일 도메인 선택
  const [selectedDomain, setSelectedDomain] = useState('')
  const [isCustomDomain, setIsCustomDomain] = useState(false)

  // 유효성 검사 상태
  const [errors, setErrors] = useState({})
  const [validFields, setValidFields] = useState({})

  // 필드 업데이트 함수
  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // 에러 설정 함수
  const setError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }))
    setValidFields(prev => ({ ...prev, [field]: false }))
  }

  // 유효성 통과 설정 함수
  const setValid = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
    setValidFields(prev => ({ ...prev, [field]: true }))
  }

  // ==================== 유효성 검사 함수들 ====================

  // 아이디 중복 검사 (서버 API 호출)
  const validateIdCore = async (id) => {
    if (!id) {
      setError('id', '아이디를 입력해주세요.')
      return
    }
    if (!/^[a-zA-Z0-9]{5,20}$/.test(id)) {
      setError('id', '영문 또는 숫자 5~20자로 입력해주세요.')
      return
    }

    try {
      const res = await api.$get(`/check-id?userId=${id}`)
      if (res) {
        setError('id', '이미 사용 중인 아이디입니다.')
      } else {
        setValid('id')
      }
    } catch (e) {
      setError('id', '서버 오류가 발생했습니다.')
    }
  }

  // 디바운스 적용된 아이디 검사
  const validateId = useCallback(
    debounce((id) => {
      validateIdCore(id)
    }, 500),
    []
  )

  // 비밀번호 유효성 검사
  const validatePassword = () => {
    if (!form.password) {
      setError('password', '비밀번호를 입력해주세요.')
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(form.password)) {
      setError('password', '8자 이상, 영문·숫자·특수문자를 조합해 입력해주세요.')
    } else {
      setValid('password')
    }
  }

  // 비밀번호 확인 유효성 검사
  const validateConfirmPassword = () => {
    if (!form.confirmPassword) {
      setError('confirmPassword', '비밀번호 확인을 입력해주세요.')
    } else if (form.confirmPassword !== form.password) {
      setError('confirmPassword', '비밀번호가 일치하지 않습니다.')
    } else {
      setValid('confirmPassword')
    }
  }

  // 이름 유효성 검사
  const validateName = () => {
    if (!form.name) {
      setError('name', '담당자 이름을 입력해주세요.')
    } else if (form.name.length < 2) {
      setError('name', '이름은 두 글자 이상 입력해주세요.')
    } else {
      setValid('name')
    }
  }

  // 휴대폰 번호 유효성 검사
  const validatePhone = () => {
    if (!form.phone) {
      setError('phone', '휴대폰 번호를 입력해주세요.')
    } else if (!/^\d{10,11}$/.test(form.phone)) {
      setError('phone', '올바른 휴대폰 번호 형식이 아닙니다. (하이픈 제외)')
    } else {
      setValid('phone')
    }
  }

  // 기업명 유효성 검사
  const validateCompany = () => {
    if (!form.companyName) {
      setError('company', '기업명을 입력해주세요.')
    } else {
      setValid('company')
    }
  }

  // 주소 유효성 검사
  const validateAddress = () => {
    if (!form.address) {
      setError('address', '주소를 입력해주세요.')
    } else {
      setValid('address')
    }
  }

  // 이메일 유효성 검사
  const validateEmail = () => {
    const fullEmail = `${form.emailId}@${form.emailDomain}`
    
    if (!form.emailId) {
      setError('email', '이메일 아이디를 입력해주세요.')
    } else if (isCustomDomain && !form.emailDomain) {
      setError('email', '도메인을 입력해주세요.')
    } else if (!/\S+@\S+\.\S+/.test(fullEmail)) {
      setError('email', '올바른 이메일 주소 형식이 아닙니다.')
    } else {
      setValid('email')
    }
  }

  // 인증번호 유효성 검사
  const validateVerifyCode = () => {
    if (!form.verificationCode) {
      setError('verifyCode', '인증번호를 입력하세요.')
    } else if (!validFields.verifyCode) {
      setError('verifyCode', '인증을 진행해주세요.')
    }
  }

  // 약관 동의 유효성 검사
  const validateTerms = () => {
    if (!form.terms) {
      setError('terms', '필수 약관에 동의해주세요.')
    } else {
      setValid('terms')
    }
  }

  // ==================== 이벤트 핸들러 ====================

  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    updateField(name, type === 'checkbox' ? checked : value)
  }

  // 아이디 입력 핸들러
  const handleIdInput = (e) => {
    const id = e.target.value
    updateField('id', id)
    validateId(id)
  }

  // 도메인 선택 핸들러
  const handleDomainChange = (e) => {
    const value = e.target.value
    setSelectedDomain(value)
    
    if (value === 'custom') {
      updateField('emailDomain', '')
      setIsCustomDomain(true)
    } else {
      updateField('emailDomain', value)
      setIsCustomDomain(false)
    }
    
    validateEmail()
  }

  // 기업 인증 모달 열기
  const openCompanyModal = () => {
    setShowCompanyModal(true)
  }

  // 기업 인증 완료
  const handleCompanyVerificationConfirm = (companyData) => {
    setForm(prev => ({
      ...prev,
      companyName: companyData.companyName,
      companyCeoName: companyData.ceoName,
      companyBizNumber: companyData.bizNumber,
      companyOpenDate: companyData.openDate
    }))
    setShowCompanyModal(false)
    validateCompany()
  }

  // 다음 우편번호 API
  const openPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        let addr = ''
        if (data.userSelectedType === 'R') {
          addr = data.roadAddress
        } else {
          addr = data.jibunAddress
        }

        setForm(prev => ({
          ...prev,
          postcode: data.zonecode,
          address: addr,
          addressDetail: '',
          sigunguCode: data.sigunguCode
        }))

        // 주소 → 좌표 변환
        const geocoder = new window.kakao.maps.services.Geocoder()
        geocoder.addressSearch(addr, function(result, status) {
          if (status === window.kakao.maps.services.Status.OK) {
            setForm(prev => ({
              ...prev,
              latitude: result[0].y,
              longitude: result[0].x
            }))
          }
        })

        validateAddress()
      }
    }).open()
  }

  // 이메일 인증 요청
  const sendVerification = async () => {
    const email = `${form.emailId}@${form.emailDomain}`

    try {
      const response = await api.$post('/email/send-code', { email })
      console.log('인증 이메일 전송 완료', response)
      showAlert(`인증 코드를 전송했습니다. 인증 코드: ${response.output.code}`, 'info')
    } catch (error) {
      console.error('이메일 인증 요청 실패:', error)
      const message = error.response?.data?.message || '이메일 인증 요청에 실패했습니다.'
      setError('email', message)
    }
  }

  // 인증 코드 확인
  const verifyCode = async () => {
    const email = `${form.emailId}@${form.emailDomain}`
    const code = form.verificationCode

    if (!code) {
      setError('verifyCode', '인증번호를 입력하세요.')
      return
    }

    try {
      const response = await api.$post('/email/verify-code', { email, code })
      console.log('인증 성공', response)
      showAlert('이메일 인증에 성공하였습니다.', 'info')
      setValid('verifyCode')
    } catch (error) {
      console.error('인증 코드 검증 실패:', error)
      setError('verifyCode', '인증번호가 일치하지 않습니다.')
      showAlert('이메일 인증에 실패하였습니다.', 'danger')
    }
  }

  // 약관 모달 열기
  const openTermsModal = () => {
    showAlert('약관 모달 기능은 구현 예정입니다.', 'info')
    updateField('terms', true)
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault()

    // 모든 유효성 검사 실행
    await validateIdCore(form.id)
    validatePassword()
    validateConfirmPassword()
    validateName()
    validatePhone()
    validateAddress()
    validateEmail()
    validateVerifyCode()
    validateTerms()

    // 모든 유효성 통과 여부 확인
    const isFormValid = validFields.id &&
      validFields.password &&
      validFields.confirmPassword &&
      validFields.name &&
      validFields.phone &&
      validFields.address &&
      validFields.email &&
      validFields.verifyCode &&
      validFields.terms

    if (isFormValid) {
      onSubmit({ ...form })
    } else {
      console.warn('❌ 유효성 검사 실패. 폼 제출 불가.')
      showAlert('모든 필드를 올바르게 입력해주세요.', 'danger')
    }
  }

  // 주소 변경 감지
  useEffect(() => {
    if (form.address) {
      validateAddress()
    }
  }, [form.address])

  return (
    <>
      <form onSubmit={handleSubmit}>
      {/* 아이디 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            아이디
            {validFields.id && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>}
          </label>
          <input
            type="text"
            name="id"
            value={form.id}
            onChange={handleIdInput}
            className="form-control form-control-lg"
          />
          {errors.id && <div className="invalid-feedback">{errors.id}</div>}
        </div>
      </div>

      {/* 비밀번호 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            비밀번호
            {validFields.password && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>}
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={(e) => {
              handleInputChange(e)
              validatePassword()
            }}
            className="form-control form-control-lg"
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>
        <div className="form-group col-lg-6">
          <label className="form-label">
            비밀번호 확인
            {validFields.confirmPassword && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>}
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={(e) => {
              handleInputChange(e)
              if (validFields.password) validateConfirmPassword()
            }}
            className="form-control form-control-lg"
          />
          {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
        </div>
      </div>

      {/* 담당자 이름 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            담당자 이름
            {validFields.name && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>}
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={(e) => {
              handleInputChange(e)
              validateName()
            }}
            className="form-control form-control-lg"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
      </div>

      {/* 휴대폰 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            휴대폰 번호
            {validFields.phone && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>}
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={(e) => {
              handleInputChange(e)
              validatePhone()
            }}
            className="form-control form-control-lg"
          />
          {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
        </div>
      </div>

      {/* 기업명 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            기업명
            {validFields.company && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>}
          </label>
          <input
            type="text"
            name="companyName"
            value={form.companyName}
            onClick={openCompanyModal}
            onChange={(e) => {
              handleInputChange(e)
              validateCompany()
            }}
            readOnly
            className="form-control form-control-lg"
          />
          {errors.company && <div className="invalid-feedback">{errors.company}</div>}
        </div>
        <div className="form-group col-lg-6">
          <label className="form-label">
            사업자 번호
            {validFields.company && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>}
          </label>
          <input
            type="text"
            name="companyBizNumber"
            value={form.companyBizNumber}
            onChange={handleInputChange}
            className="form-control form-control-lg"
          />
        </div>
      </div>

      {/* 회사 주소 */}
      <div className="row">
        <div className="form-group col-lg-7 mb-2">
          <label className="form-label">
            회사 주소
            {validFields.address && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>}
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onClick={openPostcode}
            readOnly
            placeholder="주소를 검색하세요"
            className="form-control form-control-lg"
          />
          {errors.address && <div className="invalid-feedback">{errors.address}</div>}
        </div>

        <div className="form-group col-lg-5">
          <label className="form-label">상세 주소</label>
          <input
            type="text"
            name="addressDetail"
            value={form.addressDetail}
            onChange={handleInputChange}
            className="form-control form-control-lg"
          />
        </div>
      </div>

      {/* 이메일 */}
      <div className="row">
        <div className="form-group col-lg-12">
          <label className="form-label">
            이메일 주소
            {validFields.email && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>}
          </label>
          <div className="input-group">
            <input
              type="text"
              name="emailId"
              value={form.emailId}
              onChange={(e) => {
                handleInputChange(e)
                validateEmail()
              }}
              placeholder="이메일 아이디"
              className="form-control form-control-lg"
            />
            <span className="input-group-text">@</span>

            <input
              type="text"
              name="emailDomain"
              value={form.emailDomain}
              onChange={(e) => {
                handleInputChange(e)
                validateEmail()
              }}
              readOnly={!isCustomDomain}
              placeholder="도메인 입력"
              className="form-control form-control-lg"
            />

            <select
              value={selectedDomain}
              onChange={handleDomainChange}
              className="form-control form-control-lg"
            >
              <option disabled value="">선택하세요</option>
              <option value="naver.com">naver.com</option>
              <option value="gmail.com">gmail.com</option>
              <option value="daum.net">daum.net</option>
              <option value="nate.com">nate.com</option>
              <option value="hotmail.com">hotmail.com</option>
              <option value="custom">직접입력</option>
            </select>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={sendVerification}
            >
              인증 요청
            </button>
          </div>
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
      </div>

      {/* 인증번호 */}
      <div className="row">
        <div className="form-group col-lg-8">
          <label className="form-label">
            인증번호
            {validFields.verifyCode && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>}
          </label>
          <div className="input-group">
            <input
              type="text"
              name="verificationCode"
              value={form.verificationCode}
              onChange={(e) => {
                handleInputChange(e)
                validateVerifyCode()
              }}
              className="form-control form-control-lg"
            />
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={verifyCode}
            >
              확인
            </button>
          </div>
          {errors.verifyCode && <div className="invalid-feedback">{errors.verifyCode}</div>}
        </div>
      </div>

      {/* 약관 동의 */}
      <div className="row">
        <div className="form-group col">
          <div className="form-check">
            <input
              type="checkbox"
              name="terms"
              id="terms"
              checked={form.terms}
              onChange={(e) => {
                handleInputChange(e)
                validateTerms()
              }}
              className="form-check-input"
            />
            <label htmlFor="terms" className="form-check-label me-1">
              약관에 동의합니다.
            </label>
            <a className="font-primary" style={{ cursor: 'pointer' }} onClick={openTermsModal}>이용약관</a>
          </div>
          {errors.terms && <div className="invalid-feedback">{errors.terms}</div>}
        </div>
      </div>

      {/* 회원가입 버튼 */}
      <div className="row">
        <div className="form-group col text-6">
          <input
            type="submit"
            value="회원가입"
            className="btn btn-primary btn-modern w-100"
          />
        </div>
      </div>
    </form>

    {/* 기업 인증 모달 */}
    {showCompanyModal && (
      <CompanyVerificationModal
        onConfirm={handleCompanyVerificationConfirm}
        onClose={() => setShowCompanyModal(false)}
      />
    )}
    </>
  )
}
