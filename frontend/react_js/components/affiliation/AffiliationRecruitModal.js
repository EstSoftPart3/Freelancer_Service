import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useModalStore } from '@/store/modalStore'
import { useAlertStore } from '@/store/alertStore'
import { api } from '@/lib/axios'
import ResumeSelectModal from './ResumeSelectModal'
import CommonConfirmModal from '@/components/myPage/common/CommonConfirmModal'
import styles from './AffiliationRecruitModal.module.css'

export default function AffiliationRecruitModal({ afltnInfo, onClose, onConfirm }) {
  const { user } = useAuth()
  const { openModal, closeModal } = useModalStore()
  const alertStore = useAlertStore()
  
  const [selectedResume, setSelectedResume] = useState(null)
  const [greeting, setGreeting] = useState('')

  const handleResumeSelect = (resume) => {
    setSelectedResume(resume)
  }

  // 이력서 선택 모달 열기
  const openResumeSelectModal = () => {
    if (!user?.userSq) {
      alertStore.show('로그인 후 이용해주세요.', 'danger')
      return
    }

    openModal(ResumeSelectModal, {
      onSelect: handleResumeSelect,
    })
  }

  const clickRecruit = async () => {
    if (!user?.userSq) {
      alertStore.show('로그인 후 이용해주세요.', 'danger')
      return
    }

    // 기업 회원 체크
    if (user.userTypeCd === 'COMPANY') {
      alertStore.show('기업 회원은 소속 신청할 수 없습니다.', 'danger')
      return
    }

    // 이력서 선택 체크
    if (!selectedResume || !selectedResume.resumeSq) {
      alertStore.show('이력서를 선택해주세요.', 'danger')
      return
    }

    openModal(CommonConfirmModal, {
      title: '소속 신청',
      message: `${afltnInfo.companyNm} 소속 신청하시겠습니까?`,
      onConfirm: async () => {
        try {
          const res = await api.$post('/affiliation/apply', {
            companySq: afltnInfo.sq,
            resumeSq: selectedResume.resumeSq,
            companyApplicationGreetingTxt: greeting,
          })
          
          if (res.status === 'CREATED') {
            alertStore.show(res.message || '소속 신청이 완료되었습니다.', 'success')
            onConfirm?.()
            closeModal() // 확인 모달 닫기
            closeModal() // 소속 신청 모달 닫기
          } else {
            alertStore.show(res.message || '소속 신청에 실패했습니다.', 'danger')
          }
        } catch (error) {
          alertStore.show('소속 신청에 실패했습니다.', 'danger')
        }
      },
      size: 'modal-md'
    })
  }

  return (
    <>
      <div className="modal-content">
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <i className="fas fa-building me-2"></i>
            <h4 className={styles.modalTitle}>
              {afltnInfo.isApply ? '소속 정보' : '소속 신청하기'}
            </h4>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={closeModal}
            aria-label="Close"
          ></button>
        </div>
        
        <div className={styles.modalBody}>
          {/* 기업 정보 카드 */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <i className="fas fa-briefcase me-2"></i>
              <h5 className={styles.cardTitle}>기업 정보</h5>
            </div>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>
                  <i className="fas fa-building me-2"></i>
                  회사명
                </label>
                <div className={styles.infoValue}>{afltnInfo.companyNm}</div>
              </div>

              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>
                  <i className="fas fa-user-tie me-2"></i>
                  대표자명
                </label>
                <div className={styles.infoValue}>{afltnInfo.ceoNm}</div>
              </div>

              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>
                  <i className="fas fa-calendar-alt me-2"></i>
                  개업년수
                </label>
                <div className={styles.infoValue}>{afltnInfo.openYear}년차</div>
              </div>

              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>
                  <i className="fas fa-map-marker-alt me-2"></i>
                  회사위치
                </label>
                <div className={styles.infoValue}>{afltnInfo.address}</div>
              </div>
            </div>
          </div>

          {/* 회사 설명 카드 */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <i className="fas fa-info-circle me-2"></i>
              <h5 className={styles.cardTitle}>회사 설명</h5>
            </div>
            <div className={styles.descriptionBox}>
              {afltnInfo.greeting || '회사 설명이 없습니다.'}
            </div>
          </div>

          {/* 관련 태그 카드 */}
          {afltnInfo.tags && afltnInfo.tags.length > 0 && (
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <i className="fas fa-tags me-2"></i>
                <h5 className={styles.cardTitle}>관련 기술</h5>
              </div>
              <div className={styles.tagsContainer}>
                {afltnInfo.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    <i className="fas fa-hashtag me-1"></i>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 이력서 선택 및 자기소개 카드 */}
          {!afltnInfo.isApply && (
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <i className="fas fa-file-alt me-2"></i>
                <h5 className={styles.cardTitle}>지원 정보</h5>
              </div>
              
              {/* 이력서 선택 */}
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>
                  <i className="fas fa-paperclip me-2"></i>
                  소속 신청할 이력서
                </label>
                <div className={styles.resumeLink}>
                  <button 
                    type="button" 
                    className={styles.resumeButton}
                    onClick={openResumeSelectModal}
                  >
                    <i className="fas fa-file-invoice me-2"></i>
                    {selectedResume?.resumeTtl || '이력서를 선택하세요.'}
                    <i className="fas fa-external-link-alt ms-2"></i>
                  </button>
                </div>
              </div>

              {/* 자기소개 */}
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>
                  <i className="fas fa-comment-dots me-2"></i>
                  간단한 자기소개
                </label>
                <textarea
                  className={styles.greetingInput}
                  rows="5"
                  placeholder="자기소개를 입력해주세요. (선택사항)"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          {!afltnInfo.isApply ? (
            <button type="button" className={styles.submitButton} onClick={clickRecruit}>
              <i className="fas fa-paper-plane me-2"></i>
              소속 신청하기
            </button>
          ) : (
            <button type="button" className={styles.completedButton} disabled>
              <i className="fas fa-check-circle me-2"></i>
              소속 신청 완료
            </button>
          )}
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <i className="fas fa-times me-2"></i>
            닫기
          </button>
        </div>
      </div>
    </>
  )
}

