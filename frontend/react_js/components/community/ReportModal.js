import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import styles from './ReportModal.module.css'

export default function ReportModal({ reportTypeCd, sq, onClose, onSuccess }) {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  
  const reasons = ['욕설/비방', '스팸/홍보', '개인정보 노출', '기타']
  
  // 최종 신고 사유
  const getFinalReason = () => {
    if (selectedReason === '기타') {
      return customReason.trim()
    }
    return selectedReason
  }
  
  // 사유 선택 핸들러 (단일 선택)
  const handleReasonChange = (reasonLabel) => {
    if (selectedReason === reasonLabel) {
      // 이미 선택된 것을 다시 클릭하면 해제
      setSelectedReason('')
      setCustomReason('')
    } else {
      setSelectedReason(reasonLabel)
      if (reasonLabel !== '기타') {
        setCustomReason('')
      }
    }
  }
  
  // 신고 제출
  const handleSubmit = async () => {
    const finalReason = getFinalReason()
    
    if (!finalReason) {
      showAlert(
        `신고 사유를 ${selectedReason === '기타' ? '입력' : '선택'}해주세요.`,
        'danger'
      )
      return
    }
    
    if (!confirm('신고하시겠습니까?')) {
      return
    }
    
    try {
      const response = await api.$post('/report', {
        sq: sq,
        reportReasonTxt: finalReason,
        reportTypeCd: reportTypeCd
      })
      
      if (response.status === 'CREATED' || response.status === 'OK') {
        showAlert(response.message || '신고가 접수되었습니다.', 'success')
        onClose()
        if (onSuccess) {
          onSuccess()
        }
      } else {
        showAlert('신고 등록에 실패하였습니다.', 'danger')
      }
    } catch (error) {
      console.error('신고 실패:', error)
      showAlert('신고 등록에 실패하였습니다.', 'danger')
    }
  }
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          {/* 헤더 */}
          <div className={styles.modalHeader}>
            <h5 className={styles.modalTitle}>신고 하기</h5>
            <button
              type="button"
              className={styles.btnClose}
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          {/* 본문 */}
          <div className={styles.modalBody}>
            <p className="mb-3">신고 사유를 선택해주세요:</p>
            <form>
              {reasons.map((reasonLabel, idx) => (
                <div key={idx} className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedReason === reasonLabel}
                    onChange={() => handleReasonChange(reasonLabel)}
                    id={`reason${idx}`}
                  />
                  <label className="form-check-label" htmlFor={`reason${idx}`}>
                    {reasonLabel}
                  </label>
                </div>
              ))}
              
              {/* 기타 사유 입력란 */}
              <div className="mt-3">
                <label htmlFor="customReason" className="form-label">
                  기타 사유 입력
                </label>
                <textarea
                  className="form-control"
                  id="customReason"
                  rows="3"
                  placeholder="자세한 신고 사유를 입력해주세요."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  disabled={selectedReason !== '기타'}
                />
              </div>
            </form>
          </div>
          
          {/* 푸터 */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              신고 제출
            </button>
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

