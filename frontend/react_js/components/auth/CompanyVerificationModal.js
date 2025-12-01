import { useState } from 'react'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import { companyAgreementText } from '@/lib/terms'
import TermsAgreementModal from './TermsAgreementModal'
import styles from './CompanyVerificationModal.module.css'

export default function CompanyVerificationModal({ onConfirm, onClose }) {
  const { showAlert } = useAlert()

  // 입력값 상태
  const [form, setForm] = useState({
    companyName: '',
    ceoName: '',
    openDate: '',
    bizNumber: '',
    termsAgreed: false
  })

  // 에러 및 유효성 상태
  const [errors, setErrors] = useState({})
  const [validFields, setValidFields] = useState({})

  // 인증 상태
  const [isVerified, setIsVerified] = useState(false)

  // 약관 모달 상태
  const [showTermsModal, setShowTermsModal] = useState(false)

  // 필드 업데이트
  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setIsVerified(false) // 값 변경 시 인증 상태 초기화
  }

  // 에러 설정
  const setError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }))
    setValidFields(prev => ({ ...prev, [field]: false }))
  }

  // 유효성 통과
  const setValid = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
    setValidFields(prev => ({ ...prev, [field]: true }))
  }

  // 유효성 검사 함수들
  const validateName = () => {
    if (!form.companyName.trim()) {
      setError('companyName', '기업명을 입력해주세요.')
    } else {
      setValid('companyName')
    }
  }

  const validateCeo = () => {
    if (!form.ceoName.trim()) {
      setError('ceoName', '대표자명을 입력해주세요.')
    } else {
      setValid('ceoName')
    }
  }

  const validateDate = () => {
    if (!form.openDate) {
      setError('openDate', '개업일자를 선택해주세요.')
    } else {
      setValid('openDate')
    }
  }

  const validateBiz = () => {
    if (!form.bizNumber.trim()) {
      setError('bizNumber', '사업자 번호를 입력해주세요.')
    } else {
      setValid('bizNumber')
    }
  }

  // 전체 유효성 체크
  const verifyAllInputs = () => {
    validateName()
    validateCeo()
    validateDate()
    validateBiz()
    return validFields.companyName && validFields.ceoName && validFields.openDate && validFields.bizNumber
  }

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    updateField(name, type === 'checkbox' ? checked : value)
    
    // 각 필드별 유효성 검사
    switch(name) {
      case 'companyName':
        validateName()
        break
      case 'ceoName':
        validateCeo()
        break
      case 'openDate':
        validateDate()
        break
      case 'bizNumber':
        validateBiz()
        break
    }
  }

  // 인증하기 버튼 클릭
  const handleVerify = async () => {
    if (!verifyAllInputs()) {
      showAlert('모든 정보를 정확히 입력 후 인증해주세요.', 'danger')
      return
    }

    const formattedOpenDate = form.openDate.replace(/-/g, '')

    try {
      const response = await api.$post('/company/verify', {
        b_no: form.bizNumber,
        start_dt: formattedOpenDate,
        p_nm: form.ceoName,
        b_nm: form.companyName,
      })

      if (response.output === true) {
        setIsVerified(true)
        console.log('isVerified = ', isVerified)
        showAlert('기업 인증이 성공했습니다.', 'success')
      } else {
        setIsVerified(false)
        showAlert(response.message || '기업 인증 실패', 'danger')
      }
    } catch (error) {
      setIsVerified(false)
      showAlert('서버 오류로 인증에 실패했습니다.', 'danger')
      console.error(error)
    }
  }

  // 약관 모달 열기
  const openTermsModal = () => {
    setShowTermsModal(true)
  }

  // 약관 동의
  const handleTermsAgree = () => {
    updateField('termsAgreed', true)
    setShowTermsModal(false)
    showAlert('약관 동의 처리되었습니다.', 'success')
  }

  // 인증 완료 버튼 활성 조건
  const canConfirm = isVerified && form.termsAgreed

  // 인증 완료 버튼 클릭
  const handleConfirm = () => {
    console.log('isVerified = ', isVerified)
    console.log('form.termsAgreed = ', form.termsAgreed)
    if (!canConfirm) {
      showAlert('약관 동의와 기업인증이 모두 완료되어야 합니다.', 'danger')
      return
    }

    onConfirm(form)
    showAlert('기업 인증 완료되었습니다.', 'success')
    onClose()
  }

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>
                기업인증
                {isVerified && (
                  <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
                )}
              </h5>
              <button
                type="button"
                className={styles.btnClose}
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className={styles.modalBody}>
              {/* 기업명 & 대표자명 */}
              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">
                    기업명
                    {validFields.companyName && (
                      <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
                    )}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleInputChange}
                  />
                  {errors.companyName && <div className="invalid-feedback">{errors.companyName}</div>}
                </div>
                <div className="col">
                  <label className="form-label">
                    대표자명
                    {validFields.ceoName && (
                      <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
                    )}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="ceoName"
                    value={form.ceoName}
                    onChange={handleInputChange}
                  />
                  {errors.ceoName && <div className="invalid-feedback">{errors.ceoName}</div>}
                </div>
              </div>

              {/* 개업일자 */}
              <div className="mb-3">
                <label className="form-label">
                  개업일자
                  {validFields.openDate && (
                    <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
                  )}
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="openDate"
                  value={form.openDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.openDate && <div className="invalid-feedback">{errors.openDate}</div>}
              </div>

              {/* 사업자번호 + 인증 */}
              <div className="mb-3">
                <label className="form-label">
                  사업자 번호
                  {validFields.bizNumber && (
                    <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
                  )}
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    name="bizNumber"
                    value={form.bizNumber}
                    onChange={handleInputChange}
                  />
                  <button className="btn btn-primary" type="button" onClick={handleVerify}>
                    인증하기
                  </button>
                </div>
                {errors.bizNumber && <div className="invalid-feedback">{errors.bizNumber}</div>}
              </div>

              {/* 약관 동의 */}
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  name="termsAgreed"
                  id="agreeTerms"
                  checked={form.termsAgreed}
                  onChange={handleInputChange}
                  className="form-check-input"
                />
                <label className="form-check-label me-1" htmlFor="agreeTerms">
                  약관에 동의합니다.
                </label>
                <a className="font-primary" style={{ cursor: 'pointer' }} onClick={openTermsModal}>
                  이용약관
                </a>
              </div>

              {/* 인증 완료 버튼 */}
              <div className="d-grid">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!canConfirm}
                  onClick={handleConfirm}
                >
                  기업 인증 완료
                </button>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className="btn btn-light" onClick={onClose}>닫기</button>
            </div>
          </div>
        </div>
      </div>

      {/* 약관 모달 */}
      {showTermsModal && (
        <TermsAgreementModal
          title="기업정보 수집 및 이용 동의서"
          body={companyAgreementText}
          onConfirm={handleTermsAgree}
          onClose={() => setShowTermsModal(false)}
        />
      )}
    </>
  )
}

