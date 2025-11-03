import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import BoardPost from '@/components/community/BoardPost'
import BoardComment from '@/components/community/BoardComment'

export default function BoardDetailPage() {
  const router = useRouter()
  const { board_sq } = router.query
  const { showAlert } = useAlert()
  
  const [boardInfo, setBoardInfo] = useState({
    attachments: [],
    normalTags: [],
    skillTags: [],
    comments: [],
  })
  const [loading, setLoading] = useState(true)
  
  // 게시글 불러오기
  const getBoard = async () => {
    try {
      setLoading(true)
      const response = await api.$get(`/board/${board_sq}`)
      if (response && response.output) {
        setBoardInfo(response.output)
      }
    } catch (error) {
      console.error('게시글 불러오기 실패:', error)
      showAlert('게시글을 불러올 수 없습니다.', 'danger')
      router.push('/community/board/boardList')
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
  
  useEffect(() => {
    if (router.isReady && board_sq) {
      addViewCnt()
      getBoard()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, board_sq])
  
  if (loading) {
    return (
      <section>
        <CommonPageHeader
          title=""
          strongText="일반 게시판"
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
        strongText="일반 게시판"
        breadcrumbs={[{ text: 'Home', link: '/' }, { text: '커뮤니티' }]}
      />
      <div className="container py-5 mt-3">
        <div className="post-content ms-0">
          <BoardPost
            boardInfo={boardInfo}
            boardType="board"
            onRefresh={getBoard}
          />
          <BoardComment
            comments={boardInfo.comments || []}
            boardSq={board_sq}
            boardType="board"
            onRefresh={getBoard}
          />
        </div>
      </div>
    </section>
  )
}

