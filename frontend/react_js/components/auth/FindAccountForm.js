import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'

export default function FindAccountForm({findType}) {
  const router = useRouter()
    const { showAlert } = useAlert()
    const [form, setForm] = useState({
      id: '',
      name: '',
      emailId: '',
      emailDomain: '',
      verificationCode: '',
      password: '',
    })
  
    // 유효성 검사 상태
    const [errors, setErrors] = useState({})
    const [validFields, setValidFields] = useState({})
  
    // 에러 설정 함수
    const setError = (field, message) => {
      setErrors(prev => ({...prev, [field]: message }))
      setValidFields(prev => ({...prev, [field]: false}))
    }
  
    // 유효성 통과 설정 함수
    const setValid = (field) => {
      setErrors(prev => {
        const newErrors = {...prev}
        delete newErrors[field]
        return newErrors
      })
      setValidFields(prev => ({...prev, [field]: true}))
    }
  
    // 이메일 도메인 선택
    const [selectedDomain, setSelectedDomain] = useState('')
    const [isCustomDomain, setIsCustomDomain] = useState(false)
  
    // 필드 업데이트 함수
    const updateField = (field, value) => {
      setForm(prev => ({...prev, [field]: value}))
    }
  
    // ======================= 유효성 검사 ==========================
  
    // 이름 유효성 검사
    const validateName = () => {
      if (!form.emailId) {
        setError('name', '이름을 입력해주세요.')
      } else if (form.name.length < 2) {
        setError('name', '이름은 두 글자 이상 입력해주세요.')
      } else {
        setValid('name')
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
  
    // 이메일 인증 코드 검사
    const verifyCode = async (e) => {
      const email = `${form.emailId}@${form.emailDomain}`
      const code = e.target.value
  
      if (!code) {
        setError('verifycode', '인증번호를 입력하세요.')
        return
      } else if (code.length === 6) {
        try {
          const response = await api.$post('/email/find/send-code', {email, code})
          console.log('인증 성공', response)
          setValid('verifyCode')
        } catch (error) {
          console.error('인증 코드 검증 실패:', error)
          setError('verifyCode', '인증번호가 일치하지 않습니다.')
        }
      }
    }

    // 폼 유효성 검사
    const isValidatedForm = (fd) => {
      console.log(validFields)
      if (fd) {
        return true
      } else {
        console.warn('❌ 유효성 검사 실패. 폼 제출 불가.')
        showAlert('모든 필드를 올바르게 입력해주세요.', 'danger')
        return false
      }
    }
    
  
    // =============== 이벤트 핸들러 ===================
  
    // 입력 필드 변경 핸들러
    const handleInputChange = (e) => {
      const {name, value} = e.target;
      updateField(name, value)
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
  
    // 이메일 인증 코드
    const sendVerification = async () => {
      const email = `${form.emailId}@${form.emailDomain}`
      try {
        const response = await api.$post('/email/send-code', {email})
        console.log('인증 이메일 전송 완료', response)
        showAlert(`인증 코드를 전송했습니다. 인증 코드: ${response.output.code}`)
      } catch (error) {
        console.log('이메일 인증 요청 실패', error)
        const message = error.response
        setError('email', message)
      }
    }
  
    // 폼 제출
    const handleSubmit = async (e) => {
      e.preventDefault()
      // 모든 유효성 검사 실행
      validateName()
      validateEmail()
      validateVerifyCode()
      
      // ID찾기
      if (findType === 'id') {
      
        const isFormValid = validFields.name && validFields.email && validFields.verifyCode
        if (isValidatedForm(isFormValid)) {
          const formData = {
            name : form.name,
            email : `${form.emailId}@${form.emailDomain}`,
          }
          try {
            const response = await api.$post('/find-id', formData)
            console.log('폼 제출', response)
            if (response.status === 'OK') {
              showAlert(
                response.message || 'ID 찾기에 성공하였습니다.',
                'success'
              )
              // 데이터를 sessionStorage에 저장
              sessionStorage.setItem('findIdResult', JSON.stringify(response.output))
              const stored = sessionStorage.getItem('findIdResult')
              if (stored) {
                router.push('/auth/find-result')
              } else {
                console.error('저장은 했지만 불러오기 실패')
              }
            } else {
            showAlert(
              response.message || 'ID 찾기에 실패하였습니다.',
              'danger'
            )
          }
          } catch (error) {
            handleError(error)
          }
        }
      }
      // password 찾기
      if (findType === 'password') {
        const isFormValid = form.id && validFields.name && validFields.email && validFields.verifyCode
        if (isValidatedForm(isFormValid)) {
          const formData = {
            userId : form.id,
            name : form.name,
            email : `${form.emailId}@${form.emailDomain}`,
          }
          try {
            const response = await api.$post('/reset-password/verify', formData, {withCredentials: true})
            console.log('폼 제출', response)
            if (response.status === 'OK') {
              showAlert(
                response.message || '비밀번호 찾기에 성공하였습니다.',
                'success'
              )
              router.push('/auth/reset-password')
            } else {
              showAlert(
                response.message || '비밀번호 찾기에 실패하였습니다.',
                'danger'
              )
            }
          } catch (error) {
            handleError(error)
          }
        }
      }
    }

    // 폼 제출시 에러 처리
    const handleError = (error) => {
      const status = error.response?.statuslet
      let errorMessage = 'ID 찾기에 실패하였습니다'
      if (status === 404) {
        errorMessage = error.response?.data?.message || '입력값을 확인해주세요'
      } else if (status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
      showAlert(errorMessage, 'danger')
    }


    return (
      <form onSubmit={handleSubmit}>
        {/* 아이디 입력 */}
        {findType === 'password' && 
        <div className="mb-3">
          <label htmlFor="id" className="form-label">아이디</label>
            <input
              type="text"
              className="form-control"
              id="id"
              name="id"
              value={form.id}
              onChange={handleInputChange}
              required
            />
        </div>
        }

        {/* 이름 입력 */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">이름</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              required
            />
        </div>

        {/* 이메일 주소 입력 */}
        <div className='row'>
          <div className="form-group col-lg-12">
            <label className="form-label">
              이메일 주소
              {validFields.email && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>}
            </label>
            <div className='input-group'>
              <input
              type="text"
              name="emailId"
              value={form.emailId}
              onChange={(e) => {
                handleInputChange(e)
                validateEmail()
              }}
              placeholder='이메일 아이디'
              className='form-control form-control-lg'
              />
              <span className="input-group-text">@</span>
              <input 
                type='text'
                name='emailDomain'
                value={form.emailDomain}
                onChange={(e) => {
                  handleInputChange(e)
                  validateEmail()
                }}
                readOnly={!isCustomDomain}
                placeholder='도메인 입력'
                className='form-control form-control-lg'
              />
              <select
                value={selectedDomain}
                onChange={handleDomainChange}
                className='form-control form-control-lg'
              >
                <option disabled value=''>선택하세요</option>
                <option value="naver.com">naver.com</option>
                <option value="gmail.com">gmail.com</option>
                <option value="daum.net">daum.net</option>
                <option value="nate.com">nate.com</option>
                <option value="hotmail.com">hotmail.com</option>
                <option value="custom">직접입력</option>
              </select>
              <button
                type='button'
                className='btn btn-primary btn-lg'
                onClick={sendVerification}
              >
                인증요청
              </button>
            </div>
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
        </div>

        {/* 인증번호 */}
        <div className='row'>
          <div className="form-group col-lg-12">
            <label className="form-label">
              인증번호
              {validFields.verificationCode && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>}
            </label>
            <div className='input-group'>
              <input
                type="text"
                name="verificationCode"
                value={form.verificationCode}
                onChange={(e) => {
                  handleInputChange(e)
                  verifyCode(e)
                }}
                placeholder='인증번호'
                className='form-control form-control-lg'
              />
            </div>
            {errors.verifyCode && <div className='text-primary'>{errors.verifyCode}</div>}
          </div>
        </div>
        {/* 제출 버튼 */}
        <div className="d-grid mb-3">
          <button type="submit" className="btn btn-primary btn-block">
            {findType === "id" ? '아이디 찾기' : '비밀번호 찾기'}
          </button>
        </div>
      </form>
    )
}