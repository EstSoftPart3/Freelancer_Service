import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import BoardTable from '@/components/community/BoardTable'
import CommonPagination from '@/components/common/CommonPagination'
import styles from './qnaList.module.css'

export default function QnaListPage() {
  const router = useRouter()
  const { showAlert } = useAlert()

  const [boardList, setBoardList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // 필터
  const [searchType, setSearchType] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [sortType, setSortType] = useState('latest')
  const [boardAdoptStatusCd, setBoardAdoptStatusCd] = useState('all')

  const size = 10

  // 게시글 리스트 불러오기
  const getBoardList = async () => {
    try {
      const searchKeyword = keyword.trim()
      const searchFilter =
        searchKeyword === '' ? '' : `&searchType=${searchType}&keyword=${searchKeyword}`

      const adoptFilter =
        boardAdoptStatusCd === 'all' ? '' : `&boardAdoptStatusCd=${boardAdoptStatusCd}`

      const res = await api.$get(
        `/qna?page=${currentPage}&size=${size}&sortType=${sortType}${searchFilter}${adoptFilter}`
      )

      if (res) {
        if (res.output.totalElements === 0) {
          setTotalPages(1)
        } else {
          setTotalPages(Math.floor((res.output.totalElements + size - 1) / size))
        }
        setBoardList(res.output.boards || [])
      }
    } catch (error) {
      showAlert('게시글을 불러올 수 없습니다.', 'danger')
    }
  }

  // 검색 또는 채택 상태 변경
  const changeFilter = () => {
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    changeFilter()
  }

  // 등록 페이지로 이동
  const goToRegister = () => {
    router.push('/community/qna/register')
  }

  // 페이지 변경 시 목록 새로고침
  useEffect(() => {
    getBoardList()
  }, [currentPage, sortType, boardAdoptStatusCd])

  // 컴포넌트 마운트 시
  useEffect(() => {
    getBoardList()
  }, [])

  return (
    <section>
      <CommonPageHeader
        title=""
        strongText="QnA 게시판"
        breadcrumbs={[{ text: 'Home', link: '/' }, { text: '커뮤니티' }]}
      />
      <div className={`${styles.pageContainer} py-5 mt-3`}>
        {/* 검색창 및 필터 영역 */}
        <div className="row align-items-center justify-content-between py-3 border-bottom mb-3">
          <div className="col-md-6 mb-3 mb-md-0">
            <select
              className="form-select w-auto d-inline-block me-2"
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="view">조회순</option>
              <option value="comment">댓글순</option>
              <option value="recommend">추천순</option>
            </select>
            <select
              className="form-select w-auto d-inline-block"
              value={boardAdoptStatusCd}
              onChange={(e) => setBoardAdoptStatusCd(e.target.value)}
            >
              <option value="all">상태</option>
              <option value="1501">진행중</option>
              <option value="1502">채택완료</option>
              <option value="1503">자체해결</option>
              <option value="1504">미해결</option>
            </select>
          </div>
          <div className="col-md-6 text-end">
            <form className="d-flex justify-content-md-end" onSubmit={handleSearch}>
              <select
                className="form-select w-auto me-2"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="all">전체</option>
                <option value="title">제목</option>
                <option value="content">내용</option>
              </select>
              <input
                className="form-control w-auto me-2"
                type="search"
                placeholder="검색어 입력"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
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
            <BoardTable boardList={boardList} isQna={true} />
            {/* 등록 버튼 */}
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-primary px-4" onClick={goToRegister}>
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

