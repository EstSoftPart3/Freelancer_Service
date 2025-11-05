import { useState, useEffect } from 'react'
import { useModalStore } from '@/store/modalStore'
import { useAlertStore } from '@/store/alertStore'
import { api } from '@/lib/axios'
import CommonConfirmModal from '@/components/myPage/common/CommonConfirmModal'

export default function ResumeSelectModal({ onClose, onSelect }) {
  const { openModal, closeModal } = useModalStore()
  const alertStore = useAlertStore()
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState(null)

  const formatTime = (createdAt) => {
    if (!createdAt) return ''
    const date = new Date(createdAt)
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    if (month < 10) month = '0' + month
    if (day < 10) day = '0' + day
    return `${year}.${month}.${day}`
  }

  const getResumes = async () => {
    try {
      const res = await api.$get('/mypage/resume/select-list')
      if (Array.isArray(res.output)) {
        setResumes(res.output)
      }
    } catch (error) {
      alertStore.show('이력서 목록 조회에 실패했습니다.', 'danger')
    }
  }

  const selectResume = (resume) => {
    openModal(CommonConfirmModal, {
      title: '이력서 선택',
      message: '해당 이력서를 선택하시겠습니까?',
      onConfirm: () => {
        onSelect?.(resume)
        alertStore.show('이력서 선택이 완료되었습니다.', 'success')
        closeModal() // 확인 모달 닫기
        closeModal() // 이력서 선택 모달 닫기
      },
    })
  }

  useEffect(() => {
    getResumes()
  }, [])

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h4 className="modal-title">이력서 선택</h4>
        <button
          type="button"
          className="btn-close"
          onClick={closeModal}
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        <div>
          <ul className="simple-post-list m-0">
            {resumes.map((resume) => (
              <li
                key={resume.resumeSq}
                className="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom"
              >
                <div className="post-info align-items-center gap-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      // 상세보기는 추후 구현
                    }}
                    className="text-decoration-none"
                  >
                    {resume.resumeTtl}
                  </a>
                  {resume.resumeIsRepresentativeYn === 'Y' && (
                    <span
                      className="badge bg-primary ms-2 align-middle"
                      style={{ fontSize: '12px', padding: '3px 6px' }}
                    >
                      대표 이력서
                    </span>
                  )}
                  <div className="post-meta">
                    <span className="text-dark text-uppercase font-weight-semibold">
                      등록일자
                    </span>
                    {' | '}
                    {formatTime(resume.resumeCreatedAtDtm)}
                  </div>
                </div>
                <div className="ms-auto">
                  {selectedResume && selectedResume.resumeSq === resume.resumeSq ? (
                    <button className="btn btn-primary btn-sm" disabled>
                      선택됨
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-outline btn-sm"
                      onClick={() => selectResume(resume)}
                    >
                      선택하기
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {resumes.length === 0 && (
          <div className="text-center py-4 text-muted">
            등록된 이력서가 없습니다.
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-light" onClick={closeModal}>
          닫기
        </button>
      </div>
    </div>
  )
}

