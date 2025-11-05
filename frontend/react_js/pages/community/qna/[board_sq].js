import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import BoardPost from '@/components/community/BoardPost'
import BoardComment from '@/components/community/BoardComment'
import styles from './[board_sq].module.css'

export default function QnaDetailPage() {
  const router = useRouter()
  const { board_sq } = router.query
  const { showAlert } = useAlert()
  
  const [boardInfo, setBoardInfo] = useState({
    attachments: [],
    normalTags: [],
    skillTags: [],
    answers: [],
    comments: [],
  })
  const [loading, setLoading] = useState(true)
  const viewCountIncrementedRef = useRef(false) // 조회수 중복 증가 방지
  
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
  const getBoard = async () => {
    try {
      setLoading(true)
      const response = await api.$get(`/qna/${board_sq}`)
      if (response && response.output) {
        setBoardInfo(response.output)
      }
    } catch (error) {
      console.error('게시글 불러오기 실패:', error)
      showAlert('게시글을 불러올 수 없습니다.', 'danger')
      router.push('/community/qna/qnaList')
    } finally {
      setLoading(false)
    }
  }
  
  // 조회수 증가
  const addViewCnt = async () => {
    try {
      await api.$patch(`/board/${board_sq}/increment-view`)
    } catch (error) {
      console.error('조회수 증가 실패:', error)
    }
  }

  // 답변 클릭
  const clickApplication = (sq) => {
    if (sq == null) {
      return
    }
    // 답변 상세 모달은 추후 구현
    showAlert('답변 상세 기능은 준비 중입니다.', 'info')
  }
  
  useEffect(() => {
    if (router.isReady && board_sq) {
      // 조회수는 한 번만 증가 (React Strict Mode에서도 중복 방지)
      if (!viewCountIncrementedRef.current) {
        addViewCnt()
        viewCountIncrementedRef.current = true
      }
      getBoard()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, board_sq])
  
  if (loading) {
    return (
      <section>
        <CommonPageHeader
          title=""
          strongText="QnA 게시판"
          breadcrumbs={[{ text: 'Home', link: '/' }, { text: '커뮤니티' }]}
        />
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">로딩 중...</span>
            </div>
            <p className="mt-3 text-muted">게시글을 불러오는 중...</p>
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <section>
      <CommonPageHeader
        title=""
        strongText="QnA 게시판"
        breadcrumbs={[{ text: 'Home', link: '/' }, { text: '커뮤니티' }]}
      />
      <div className="container py-5 mt-3">
        <div className="post-content ms-0">
          <BoardPost
            boardInfo={boardInfo}
            boardType="qna"
            onRefresh={getBoard}
          />
          
          {/* 답변 영역 */}
          <div className={`${styles.answersSection} mt-5`}>
            <h4 className={`mb-4 ${styles.fS15}`}>
              답변 ({boardInfo.answers?.length || 0})
            </h4>
            {boardInfo.answers && boardInfo.answers.map((answer) => (
              <div
                key={answer.sq}
                className={`${styles.answerBox} card p-4 mb-3 border-0 ${answer.sq === null ? styles.disableBox : ''}`}
                onClick={() => clickApplication(answer.sq)}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className={`mb-0 text-dark ${styles.fS13} me-2`}>
                    {answer.ttl || '삭제된 답변입니다.'}
                  </h5>
                  {answer.isAdoptedYn === 'Y' && (
                    <span className={`badge bg-primary ${styles.fS11}`}>
                      채택 답변
                    </span>
                  )}
                </div>
                {answer.isDeletedYn === 'N' && (
                  <div className={`d-flex justify-content-between text-muted ${styles.fS11}`}>
                    <div>
                      <i className="far fa-user"></i> By{' '}
                      <span>{answer.userNm}</span> &nbsp;&nbsp;
                      <i className="far fa-calendar-alt"></i>
                      &nbsp;{formatTime(answer.createdAt)}
                    </div>
                    <div>
                      조회 {answer.viewCnt} · 댓글 {answer.commentCnt} · 추천{' '}
                      {answer.recommendCnt}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <BoardComment
            comments={boardInfo.comments || []}
            boardSq={board_sq}
            boardType="qna"
            onRefresh={getBoard}
          />
        </div>
      </div>
    </section>
  )
}

