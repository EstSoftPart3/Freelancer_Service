import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import BoardRegisterForm from '@/components/community/BoardRegisterForm'

export default function BoardRegisterPage() {
  const router = useRouter()
  const { edit } = router.query
  const { showAlert } = useAlert()
  const boardPostRef = useRef(null)
  
  const [isEditMode, setIsEditMode] = useState(false)
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(false)

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (router.isReady && edit) {
      setIsEditMode(true)
      loadBoardData(edit)
    }
  }, [router.isReady, edit])

  // 기존 게시글 데이터 불러오기
  const loadBoardData = async (boardSq) => {
    try {
      setLoading(true)
      const response = await api.$get(`/board/${boardSq}`)
      if (response && response.output) {
        setInitialData(response.output)
      }
    } catch (error) {
      console.error('게시글 불러오기 실패:', error)
      showAlert('게시글을 불러올 수 없습니다.', 'danger')
      router.push('/community/board/boardList')
    } finally {
      setLoading(false)
    }
  }

  // HTML이 비어있는지 확인
  const isHtmlEmpty = (htmlString) => {
    const textOnly = htmlString
      .replace(/<[^>]*>/g, '') // HTML 태그 제거
      .replace(/&nbsp;/gi, '') // 공백 문자 제거
      .trim() // 앞뒤 공백 제거
    return textOnly === ''
  }

  // 등록/수정 처리
  const handleSubmit = async () => {
    try {
      const formData = boardPostRef.current.getData()
      const title = boardPostRef.current.getTitle()
      const content = boardPostRef.current.getContent()

      // 유효성 검사
      if (!title || title.trim() === '') {
        showAlert('제목을 입력해주세요.', 'danger')
        return
      }

      if (isHtmlEmpty(content)) {
        showAlert('내용을 입력해주세요.', 'danger')
        return
      }

      let response
      if (isEditMode) {
        // 수정
        response = await api.$patch(`/board/${edit}/edit`, formData)
      } else {
        // 신규 등록
        response = await api.$post('/board', formData)
      }

      if (response.status === 'CREATED' || response.status === 'OK') {
        showAlert(response.message || (isEditMode ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.'), 'success')
        router.push('/community/board/boardList')
      } else {
        showAlert(`게시글 ${isEditMode ? '수정' : '등록'}에 실패하였습니다.`, 'danger')
      }
    } catch (error) {
      console.error(`게시글 ${isEditMode ? '수정' : '등록'} 실패:`, error)
      showAlert(`게시글 ${isEditMode ? '수정' : '등록'}에 실패하였습니다.`, 'danger')
    }
  }

  // 취소
  const handleCancel = () => {
    if (confirm(`${isEditMode ? '수정' : '작성'}을 취소하시겠습니까?`)) {
      router.back()
    }
  }

  if (loading) {
    return (
      <>
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
      </>
    )
  }

  return (
    <>
      <CommonPageHeader
        title=""
        strongText="일반 게시판"
        breadcrumbs={[{ text: 'Home', link: '/' }, { text: '커뮤니티' }]}
      />

      <div className="container py-5">
        <div className="tab-pane active">
          <h4 className="mb-3">{isEditMode ? '게시글 수정' : '게시글 등록'}</h4>
          <div className="card bg-color-grey mb-4">
            <div className="card-body">
              <form onSubmit={(e) => e.preventDefault()}>
                <BoardRegisterForm 
                  ref={boardPostRef} 
                  isQna={false} 
                  initialData={initialData}
                />

                {/* 버튼 영역 */}
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    {isEditMode ? '수정' : '등록'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={handleCancel}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

