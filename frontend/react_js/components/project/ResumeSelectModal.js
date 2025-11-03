import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'

export default function ResumeSelectModal({ projectSq, onClose, onConfirm }) {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // 이력서 목록 조회
  const getResumes = async () => {
    try {
      setLoading(true)
      const response = await api.$get('/mypage/resume/select-list')
      console.log('이력서 목록 응답:', response)
      if (Array.isArray(response.output)) {
        setResumes(response.output)
      } else {
        console.error('이력서 목록이 배열이 아닙니다:', response)
      }
    } catch (error) {
      console.error('이력서 목록 조회 실패:', error)
      showAlert('이력서 목록을 불러올 수 없습니다.', 'danger')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    getResumes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // 이력서 선택
  const selectResume = (resume) => {
    setSelectedResume(resume)
  }
  
  // 날짜 포맷
  const formatTime = (createdAt) => {
    if (!createdAt) return ''
    const date = new Date(createdAt)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }
  
  // 선택 완료
  const handleConfirm = async () => {
    if (!selectedResume) {
      showAlert('이력서를 선택해주세요.', 'danger')
      return
    }
    
    try {
      await api.$post(`/projects/applications/${projectSq}`, {
        resumeSq: [selectedResume.resumeSq],
        projectApplicationTyp: 'PERSONAL',
      })
      
      showAlert('프로젝트 지원에 성공하였습니다.', 'success')
      
      if (onConfirm) {
        onConfirm()
      }
      
      onClose()
    } catch (error) {
      console.error('지원 실패:', error)
      showAlert('프로젝트 지원에 실패했습니다.', 'danger')
    }
  }
  
  return (
    <>
      {/* 모달 배경 */}
      <div 
        className="modal-backdrop fade show" 
        style={{ zIndex: 1050 }}
        onClick={onClose}
      ></div>
      
      {/* 모달 */}
      <div 
        className="modal fade show" 
        style={{ display: 'block', zIndex: 1055 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">이력서 선택</h4>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">로딩 중...</span>
                  </div>
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">등록된 이력서가 없습니다.</p>
                  <p className="text-muted">이력서를 먼저 등록해주세요.</p>
                </div>
              ) : (
                <ul className="simple-post-list m-0">
                  {resumes.map((resume) => (
                    <li
                      key={resume.resumeSq}
                      className="d-flex align-items-center gap-2 py-3 border-bottom"
                    >
                      <div className="post-info flex-grow-1">
                        <a 
                          href="#" 
                          onClick={(e) => e.preventDefault()}
                          className="text-dark text-decoration-none"
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
                        <div className="post-meta mt-1">
                          <span className="text-dark text-uppercase font-weight-semibold">
                            등록일자
                          </span>
                          {' | '}
                          {formatTime(resume.resumeCreatedAtDtm)}
                        </div>
                      </div>
                      
                      <div className="ms-auto">
                        {selectedResume?.resumeSq === resume.resumeSq ? (
                          <button className="btn btn-primary btn-sm" disabled>
                            선택됨
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => selectResume(resume)}
                          >
                            선택하기
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={handleConfirm} 
                className="btn btn-primary"
                disabled={!selectedResume || loading}
              >
                선택 완료
              </button>
              <button onClick={onClose} className="btn btn-light">
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


