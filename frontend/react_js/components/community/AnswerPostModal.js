import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import BoardPost from '@/components/community/BoardPost'
import BoardComment from '@/components/community/BoardComment'
import styles from './AnswerPostModal.module.css'
import BoardAnswerModal from '@/components/community/BoardAnswerModal'
import { useAuth } from '@/contexts/AuthContext'
import { useModalStore } from '@/store/modalStore'

export default function AnswerPostModal({answerSq, boardPostUserSq}) {
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
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [isAnswerEditMode, setIsAnswerEditMode] = useState(false)
  const [clickAnswerSq, setClickAnswerSq] = useState(0)
  const boardPostRef = useRef(null)
  
  const formatTime = (createdAt) => {
    if (!createdAt) return ''
    const date = new Date(createdAt)
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    if (month < 10) month = '0' + month
    if (day < 10) day = '0' + day
    
    return `${year}-${month}-${day}`
  }

  // 게시글 불러오기
  const getAnswer = async () => {
    try {
      setLoading(true)
      const response = await api.$get(`/answer/${answerSq}`)
      if (response && response.output) {
        setAnswerInfo(response.output)
      }
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


  // 답변 작성 / 수정 모달 오픈
  const handleAnswerModal = (e, isEdit, answerSq) => {
    e.stopPropagation();
    // 비로그인 사용자 처리
    if (!isLoggedIn) {
      showAlert('로그인을 해주세요.', 'info');
      return router.push('/auth/login')
    }
    if (isEdit) {
      setClickAnswerSq(answerSq)
    }
    setIsAnswerEditMode(isEdit);
    setShowAnswerModal(true);
  }

  // 답변 삭제
  const deleteAnswer = async (answerSq) => {
    e.stopPropagation();
    if (!isLoggedIn){
      showAlert('로그인을 해주세요.', 'info');
      return router.push('/auth/login')
    }
    try {
      await api.$patch(`/answer/${answerSq}`)
      setAnswerInfo((prev) => ({
        ...prev,
        answers: prev.answers.filter((answer) => answer.answerSq !== answerSq)
      }))
    } catch (error) {
      console.log('답변 삭제 실패 : ', error)
      showAlert('답변 삭제 중 오류가 발생했습니다', 'danger')
    }
  }

  //답변 작성 모달 props
  const answerProps = {
    isEditMode: isAnswerEditMode,
    answerSq: clickAnswerSq,
    boardPostRef,
    setShowAnswerModal,
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
              onRefresh={getAnswer}
              handleAnswerModal={handleAnswerModal}
              isAnswer={true}
              boardPostUserSq={boardPostUserSq}
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
          

          
        
      // <div
      //   className="modal fade show d-block "
      //   tabIndex="-1"
      //   style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1049 }}
      // >
      //   <div className="modal-dialog modal-dialog-centered modal-lg ">
      //     <div className='modal-content'>
      //       <div className="container py-5 mt-3">
      //         <div className="post-content ms-0">
      //           <BoardPost
      //             boardInfo={answerInfo}
      //             boardType="qna"
      //             onRefresh={getAnswer}
      //             handleAnswerModal={handleAnswerModal}
      //           />
      //           <BoardComment
      //             comments={answerInfo.comments || []}
      //             boardSq={answerSq}
      //             boardType="qna"
      //             onRefresh={getAnswer}
      //           />
      //         </div>
      //       </div>      
      //     </div>
      //   </div>
      // {/* 답변 작성 모달 */}
      // {showAnswerModal && (
      //   <BoardAnswerModal {...answerProps} />
      // )}
      // </div>
  )
}

