import { useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { useRouter } from 'next/router'
import { api } from '@/lib/axios'
import skillIconMap from '@/lib/skillIconMap'
import ReportModal from './ReportModal'
import BoardAnswerModal from './BoardAnswerModal'

/**
 * @param {()=>{}} handleAnswerModal - 작성 / 수정 핸들러
 * @param {boolean} isAnswer - 답변 포스트 모달에서 띄우는 상태인지 여부
 * @param {int} boardPostUserSq - 게시글 작성자의 userSq
 */

export default function BoardPost({ boardInfo, boardType, onRefresh, handleAnswerModal, isAnswer = false, boardPostUserSq }) {
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()
  const { showAlert } = useAlert()

  const viewerSq = user?.userSq || null
  
  // 상태
  const [showReportModal, setShowReportModal] = useState(false)
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [clickAnswerSq, setClickAnswerSq] = useState()
  const boardPostRef = useRef(null)
  

  // 날짜 포맷팅
  const formatTime = (createdAt) => {
    if (!createdAt) return ''
    const date = new Date(createdAt)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 추천
  const handleRecommend = async () => {
    if (!viewerSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }

    try {
      const response = await api.$post(`/${boardType}/${boardInfo.sq}/recommend`, {Credential: true})
      if (response.status === 'OK') {
        showAlert(response.message || '추천되었습니다.', 'success')
        onRefresh()
      } else {
        showAlert('추천 반영에 실패하였습니다.', 'danger')
      }
    } catch (error) {
      console.error('추천 실패:', error)
      showAlert('추천 반영에 실패하였습니다.', 'danger')
    }
  }

  // 수정
  const handleEdit = () => {
    if (!viewerSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }

    // 답변 포스트 모달일 경우
    if (isAnswer) {
    // 답변 수정 모달 오픈
      setClickAnswerSq(boardInfo.sq)
      setShowAnswerModal(true);
    }
  }

  //답변 작성 모달 props
  const answerProps = {
    isEditMode: true,
    isAnswerPost: true,
    answerSq: clickAnswerSq,
    boardPostRef,
    setShowAnswerModal,
  }

  // 삭제
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const response = await api.$patch(`/${boardType}/${boardInfo.sq}`)
      if (response.status === 'OK') {
        showAlert(response.message || '삭제되었습니다.', 'success')
        router.push(`/community/${boardType}/${boardType}List`)
      } else {
        showAlert('삭제에 실패하였습니다.', 'danger')
      }
    } catch (error) {
      console.error('삭제 실패:', error)
      showAlert('삭제에 실패하였습니다.', 'danger')
    }
  }

  // 신고
  const handleReport = () => {
    if (!viewerSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    setShowReportModal(true)
  }

  // 기술 아이콘
  const getSkillIcon = (name) => {
    const key = name.toLowerCase().replace(/[\s.]+/g, '')
    return skillIconMap[key] || skillIconMap.default
  }

  // 상태 코드 매핑
  const getStatusBadge = (statusCd) => {
    const statusMap = {
      1501: { text: '진행중', color: 'warning' },
      1502: { text: '채택완료', color: 'success' },
      1503: { text: '자체해결', color: 'secondary' },
      1504: { text: '미해결', color: 'danger' }
    }
    return statusMap[statusCd] || null
  }

  // 자체 해결 처리
  const handleSelfResolved = () => {

  }

  return (
    <div>
      <div className="post-header">
        <h1 className="font-weight-semi-bold mb-0 position-relative">
          {/* QnA 상태 뱃지 */}
          {boardType === 'qna' && boardInfo.boardAdoptStatusCd && (
            <div className="d-flex flex-wrap gap-2 mb-2">
              {(() => {
                const badge = getStatusBadge(boardInfo.boardAdoptStatusCd)
                return badge ? (
                  <span className={`badge bg-${badge.color} badge-xs`} style={{ fontSize: 'large' }}>
                    {badge.text}
                  </span>
                ) : null
              })()}
            </div>
          )}

          {/* 채택 답변 뱃지 */}
          {boardInfo.isAdoptedYn === 'Y' && (
            <div className="d-flex flex-wrap gap-2 mb-2">
              <span className="badge bg-primary badge-xs" style={{ fontSize: 'large' }}>채택 답변</span>
            </div>
          )}

          {/* 제목 + 아이콘 버튼들 */}
          <div className="d-flex justify-content-between align-items-start flex-wrap">
            <p className="text-primary mb-0" style={{ lineHeight: 1.2 }}>
              {boardInfo.ttl}
            </p>

            {/* 아이콘 버튼들 */}
            <span className="post-icons d-flex ms-auto">
              {/* 조회수 */}
              <button
                type="button"
                className="btn btn-light btn-rounded text-grey d-flex align-items-center me-2"
                style={{ fontSize: '1rem' }}
              >
                <i className="fa-solid fa-eye" style={{ fontSize: '1.2rem' }}></i>
                <span className="me-2 ms-2 text-grey">조회수</span>
                <span>{boardInfo.viewCnt || 0}</span>
              </button>

              {/* 추천 */}
              <button
                type="button"
                className="btn btn-light btn-rounded text-grey d-flex align-items-center me-2"
                style={{ fontSize: '1rem' }}
                onClick={handleRecommend}
              >
                <i className="fa-regular fa-thumbs-up" style={{ fontSize: '1.2rem' }}></i>
                <span className="me-2 ms-2 text-grey">추천</span>
                <span>{boardInfo.recommendCnt || 0}</span>
              </button>

              {/* 신고 (작성자가 아닐 때만) */}
              {boardInfo.userSq !== viewerSq && (
                <button
                  type="button"
                  className="btn btn-light btn-rounded text-grey d-flex align-items-center me-2"
                  style={{ fontSize: '1rem' }}
                  onClick={handleReport}
                >
                  <i className="fa-solid fa-land-mine-on" style={{ fontSize: '1.2rem' }}></i>
                  <span className="me-2 ms-2 text-grey">신고</span>
                </button>
              )}
            </span>
          </div>
        </h1>

        {/* 작성자 정보 */}
        <div className="post-meta mt-3">
          <span className="me-2">
            <i className="far fa-user"></i> By <a href="#">{boardInfo.userNm}</a>
          </span>
          <span>
            <i className="far fa-calendar-alt me-1"></i>
            <span className="text-primary">{formatTime(boardInfo.createdAt)}</span>
          </span>
        </div>
      </div>

      {/* 게시글 본문 */}
      <div
        className="post-description mt-5 mb-5"
        style={{ fontSize: '1rem' }}
        dangerouslySetInnerHTML={{ __html: boardInfo.description }}
      ></div>

      {/* 첨부파일 */}
      {boardInfo.attachments?.length > 0 && (
        <div className="post-attachments mt-3 mb-4">
          <h5 className="font-weight-bold text-grey">첨부파일</h5>
          <ul className="list-unstyled">
            {boardInfo.attachments.map((attachment, index) => (
              <li key={index}>
                <a href={`/api/board/download/${attachment.fileSq}`} download>
                  {attachment.fileOriginalNm}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 태그 */}
      {(boardInfo.normalTags?.length > 0 || boardInfo.skillTags?.length > 0) && (
        <div className="post-tags mt-4">
          <h5 className="font-weight-bold text-grey">태그</h5>

          {/* 기술 태그 */}
          {boardInfo.skillTags?.map((skillTag, index) => (
            <a
              key={`skill-${index}`}
              href="#"
              className="btn btn-rounded btn-primary me-2 my-2"
              onClick={(e) => e.preventDefault()}
            >
              <img
                src={getSkillIcon(skillTag.skillTagNm)}
                alt={skillTag.skillTagNm}
                style={{ width: '14px', height: '14px', marginRight: '4px' }}
              />
              {skillTag.skillTagNm}
            </a>
          ))}

          {/* 일반 태그 */}
          {boardInfo.normalTags?.map((normalTag, index) => (
            <a
              key={`normal-${index}`}
              href="#"
              className="btn btn-rounded btn-light me-2 my-2"
              onClick={(e) => e.preventDefault()}
            >
              {normalTag}
            </a>
          ))}
        </div>
      )}

      {/* 하단 버튼들 */}
      {!isAnswer &&
      <div className="post-admin mt-4 text-end">
        <button
          className="btn btn-primary me-2"
          onClick={() => handleAnswerModal(false)}
          >
          답변 작성
        </button>
        {/* 작성자만 수정/삭제 */}
        {boardInfo.userSq === viewerSq && (
          <>
            <button
              className="btn btn-primary me-2"
              onClick={handleSelfResolved}
              >
              자체 해결
            </button>
            <button
              className="btn btn-primary me-2"
              onClick={handleEdit}
              >
              수정
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDelete}
              >
              삭제
            </button>
          </>
        )}
      </div>
      }
      {/* 답변 포스트 모달일 경우 */}
      {isAnswer && (
        <div className="post-admin mt-4 text-end">
          {boardInfo.userSq === viewerSq && (
            <>
              <button
                className="btn btn-primary me-2"
                onClick={handleEdit}
              >
                수정
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDelete}
              >
                삭제
              </button>
            </>
          )} 
          {boardPostUserSq === viewerSq && (
              <button className='btn btn-primary'>
                채택하기
              </button>
            )
          }
        </div>
        )
      }

      <style jsx global>{`
        .font-size-xs {
          font-size: 1rem;
        }
        .font-size-s {
          font-size: 1.2rem;
        }
        .font-size-l {
          font-size: large;
        }
        .skill-icon {
          width: 14px;
          height: 14px;
          margin-right: 4px;
        }
      `}</style>
      
      {/* 신고 모달 */}
      {showReportModal && (
        <ReportModal
          reportTypeCd={boardType === 'qna' ? 2001 : 2001}
          sq={boardInfo.sq}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            // 신고 성공 후 필요한 액션 (선택적)
          }}
        />
      )}
      {/* 답변 수정 모달 */}
      {showAnswerModal && (
        <BoardAnswerModal {...answerProps} />
      )}
    </div>
  )
}
