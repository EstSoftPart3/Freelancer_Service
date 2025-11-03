import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import BoardTable from '@/components/community/BoardTable'
import CommonPagination from '@/components/common/CommonPagination'

export default function BoardListPage() {
  const router = useRouter()
  const { showAlert } = useAlert()
  
  const [boardList, setBoardList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const size = 10
  
  // 필터
  const [searchType, setSearchType] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [sortType, setSortType] = useState('latest')
  
  // 게시글 리스트 불러오기
  const getBoardList = async () => {
    try {
      const searchFilter =
        !keyword || keyword.trim() === ''
          ? ''
          : `&searchType=${searchType}&keyword=${keyword}`
      
      const response = await api.$get(
        `/board?page=${currentPage}&size=${size}&sortType=${sortType}${searchFilter}`
      )
      
      if (response) {
        if (response.output.totalElements === 0) {
          setTotalPages(1)
        } else {
          setTotalPages(Math.floor((response.output.totalElements + size - 1) / size))
        }
        setBoardList(response.output.boards || [])
      }
    } catch (error) {
      showAlert('게시글을 불러올 수 없습니다.', 'danger')
    }
  }
  
  // 검색 제출
  const handleSubmit = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    getBoardList()
  }
  
  // 페이지 변경 시 리스트 갱신
  useEffect(() => {
    getBoardList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortType])
  
  return (
    <section>
      <CommonPageHeader
        title=""
        strongText="일반 게시판"
        breadcrumbs={[{ text: 'Home', link: '/' }, { text: '커뮤니티' }]}
      />
      <div className="container py-5 mt-3">
        {/* 검색창 및 필터 영역 */}
        <div className="row align-items-center justify-content-between py-3 border-bottom mb-3">
          <div className="col-md-6 mb-3 mb-md-0">
            <select
              className="form-select w-auto d-inline-block"
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="view">조회순</option>
              <option value="comment">댓글순</option>
              <option value="recommend">추천순</option>
            </select>
          </div>
          <div className="col-md-6 text-end">
            <form className="d-flex justify-content-md-end" onSubmit={handleSubmit}>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="form-select w-auto me-2"
              >
                <option value="all">전체</option>
                <option value="title">제목</option>
                <option value="content">내용</option>
              </select>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="form-control w-auto me-2"
                type="search"
                placeholder="검색어 입력"
              />
              <button className="btn btn-primary px-3" type="submit">
                검색
              </button>
            </form>
          </div>
        </div>
        
        {/* 게시판 리스트 */}
        <div className="row">
          <div className="col">
            <BoardTable boardList={boardList} isQna={false} />
            
            {/* 등록 버튼 */}
            <div className="d-flex justify-content-end mb-3">
              <button
                className="btn btn-primary px-4"
                onClick={() => router.push('/community/board/register')}
              >
                등록
              </button>
            </div>
            
            {/* 페이지네이션 */}
            <CommonPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

