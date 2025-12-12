import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import BoardPost from '@/components/community/BoardPost'
import BoardComment from '@/components/community/BoardComment'
import { useAuth } from '@/contexts/AuthContext'
import { useModalStore } from '@/store/modalStore'

/**
 * @param {()=>{}} handleAnswerModal - 답변 작성/수정 모달 오픈
 * @param {int} answerSq - 답변 answerSq
 * @param {()=>{}} onRefresh - 새로고침(게시글 정보 다시 불러오기)
 * @param {int} boardPostUserSq - 게시글 작성자 userSq
 * @param {int} boardAdoptStatusCd - 게시글 상태 (진행중 / 채택완료 / 자체해결 / 미해결)
 */
export default function AnswerPostModal({handleAnswerModal, answerSq, onRefresh, boardPostUserSq, boardAdoptStatusCd}) {
  const router = useRouter()
  const { board_sq } = router.query
  const { showAlert } = useAlert()
  const { user, isLoggedIn } = useAuth();
  const { closeModal } = useModalStore();
    
  // ========== 상태 ==============
  const [answerInfo, setAnswerInfo] = useState({
    attachments: [],
    normalTags: [],
    skillTags: [],
    answers: [],
    comments: [],
  })
  const [loading, setLoading] = useState(true)
  const viewCountIncrementedRef = useRef(false) // 조회수 중복 증가 방지

  // 답변 불러오기
  const getAnswer = async () => {
    try {
      setLoading(true)
      const response = await api.$get(`/answer/${answerSq}`)
      if (response && response.output) {
        setAnswerInfo(response.output)
      }
      console.log('답변 모달', response)
    } catch (error) {
      console.error('답변 상세 정보 불러오기 실패:', error)
      showAlert('답변을 불러올 수 없습니다.', 'danger')
      router.back();
    } finally {
      setLoading(false)
    }
  }
  
  // 조회수 증가
  const addViewCnt = async () => {
    try {
      await api.$patch(`/answer/${answerSq}/increment-view`)
    } catch (error) {
      console.error('조회수 증가 실패:', error)
    }
  }

  useEffect(() => {
    if (router.isReady && answerSq) {
      // 조회수는 한 번만 증가 (React Strict Mode에서도 중복 방지)
      if (!viewCountIncrementedRef.current) {
        addViewCnt()
        viewCountIncrementedRef.current = true
      }
      getAnswer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, board_sq])
  
  if (loading) {
    return (
      <section>
        <CommonPageHeader
          title=""
          strongText="QnA 답변"
          breadcrumbs={[{ text: 'QnA', link: '/' }, { text: '답변' }]}
        />
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">로딩 중...</span>
            </div>
            <p className="mt-3 text-muted">답변을 불러오는 중...</p>
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <div className="modal-content">
      {answerInfo.isAdoptedYn === 'Y' && <a className='btn btn-primary'>채택답변</a>}
      <div className="modal-header">
        <h4 className="modal-title fs-4">QnA 답변</h4>
        <button
          type="button"
          className="btn-close"
          onClick={closeModal}
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body px-4">
        <div className="container py-3 mt-3">
          <div className="post-content ms-0">
            <BoardPost
              boardInfo={answerInfo}
              boardType="answer"
              onRefresh={onRefresh}
              onAnswerRefresh={getAnswer}
              handleAnswerModal={handleAnswerModal}
              boardPostUserSq={boardPostUserSq}
              boardAdoptStatusCd={boardAdoptStatusCd}
            />
            <BoardComment
              comments={answerInfo.comments || []}
              boardSq={answerSq}
              boardType="answer"
              onRefresh={getAnswer}
            />
          </div>
        </div>
      </div>
      <div className='modal-footer'>
        <button onClick={closeModal} className='btn btn-light'>
          닫기
        </button>
      </div>
    </div>
  )
}

