import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import ResumeSelectModal from './ResumeSelectModal'
import styles from './AffiliationRecruitModal.module.css'

export default function AffiliationRecruitModal({ afltnInfo, onClose, onConfirm }) {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  
  const [selectedResume, setSelectedResume] = useState(null)
  const [greeting, setGreeting] = useState('')
  const [showResumeModal, setShowResumeModal] = useState(false)

  const handleResumeSelect = (resume) => {
    setSelectedResume(resume)
    setShowResumeModal(false)
  }

  const clickRecruit = async () => {
    if (!user?.userSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }

    // 기업 회원 체크
    if (user.userType === 'COMPANY') {
      showAlert('기업 회원은 소속 신청할 수 없습니다.', 'danger')
      return
    }

    // 이력서 선택 체크
    if (!selectedResume || !selectedResume.resumeSq) {
      showAlert('이력서를 선택해주세요.', 'danger')
      return
    }

    if (!confirm(`${afltnInfo.companyNm} 소속 신청하시겠습니까?`)) {
      return
    }

    try {
      const res = await api.$post('/affiliation/apply', {
        companySq: afltnInfo.sq,
        resumeSq: selectedResume.resumeSq,
        companyApplicationGreetingTxt: greeting,
      })
      
      if (res.status === 'CREATED') {
        showAlert(res.message, 'success')
        onConfirm?.()
        onClose()
      } else {
        showAlert(res.message, 'danger')
      }
    } catch (error) {
      showAlert('소속 신청에 실패했습니다.', 'danger')
    }
  }

  return (
    <>
      <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title text-bold">
            {afltnInfo.isApply ? '소속 정보' : '소속 신청하기'}
          </h4>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
        <div className={`modal-body ${styles.bgF5}`}>
          <div className={styles.modalContent}>
          {/* 회사명 */}
          <div className="mb-3">
            <label htmlFor="companyName" className="form-label text-primary text-bold">
              회사명
            </label>
            <div className="text-dark" id="companyName">
              {afltnInfo.companyNm}
            </div>
          </div>

          {/* 대표자명 */}
          <div className="mb-3">
            <label htmlFor="ceoName" className="form-label text-primary text-bold">
              대표자명
            </label>
            <div className="text-dark" id="ceoName">
              {afltnInfo.ceoNm}
            </div>
          </div>

          {/* 개업년수 */}
          <div className="mb-3">
            <label htmlFor="yearsInBusiness" className="form-label text-primary text-bold">
              개업년수
            </label>
            <div className="text-dark" id="yearsInBusiness">
              {afltnInfo.openYear}년차
            </div>
          </div>

          {/* 회사위치 */}
          <div className="mb-3">
            <label htmlFor="companyLocation" className="form-label text-primary text-bold">
              회사위치
            </label>
            <div className="text-dark" id="companyLocation">
              {afltnInfo.address}
            </div>
          </div>

          {/* 회사 설명 */}
          <div className="mb-3">
            <label htmlFor="companyDescription" className="form-label text-primary text-bold">
              회사 설명
            </label>
            <div className="text-dark" id="companyDescription">
              {afltnInfo.greeting}
            </div>
          </div>

          {/* 관련 태그 */}
          <div className="mb-3">
            <label className="form-label text-primary text-bold">관련 태그</label>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {afltnInfo.tags?.map((tag, index) => (
                <span key={index} className="btn btn-rounded btn-3d btn-light">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 이력서 선택 */}
          {!afltnInfo.isApply && (
            <div className="mb-3">
              <label htmlFor="resume" className="form-label text-primary text-bold">
                소속 신청할 이력서
              </label>
              <div className="text-dark" id="resume">
                선택한 이력서:{' '}
                <a
                  href="#"
                  className="text-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowResumeModal(true)
                  }}
                >
                  {selectedResume?.resumeTtl || '이력서를 선택하세요.'}
                </a>
              </div>
            </div>
          )}

           {/* 간단한 자기소개 */}
          {!afltnInfo.isApply && (
            <div className="mb-3">
              <label htmlFor="selfIntroduction" className="form-label text-primary text-bold">
                간단한 자기소개
              </label>
              <textarea
                className="form-control border-0 bg-white"
                id="selfIntroduction"
                rows="4"
                placeholder="자기소개를 입력해주세요."
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
              ></textarea>
            </div>
          )}
          </div>
        </div>
        <div className="modal-footer">
          {!afltnInfo.isApply ? (
            <button type="button" className="btn btn-primary" onClick={clickRecruit}>
              소속 신청하기
            </button>
          ) : (
            <button type="button" className="btn btn-light" disabled>
              소속 신청 완료
            </button>
          )}
          <button type="button" className="btn btn-light" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>

      {/* 이력서 선택 모달 */}
      {showResumeModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <ResumeSelectModal
              onClose={() => setShowResumeModal(false)}
              onSelect={handleResumeSelect}
            />
          </div>
        </div>
      )}
    </>
  )
}

