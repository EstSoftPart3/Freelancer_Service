import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import CommonPagination from '@/components/common/CommonPagination'
import styles from './index.module.css'

export default function MemberListPage() {
  const router = useRouter()
  const { showAlert } = useAlert()

  // 검색 및 필터
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    accountStatus: '', // '', 'Y'(활성), 'N'(비활성)
    accountType: '', // '', '301'(개인), '302'(기업), '303'(관리자)
  })

  // 회원 목록
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // 회원 목록 조회
  const fetchMembers = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage - 1, // 백엔드는 0부터 시작
        size: pageSize,
      }

      // 검색어
      if (searchQuery && searchQuery.trim() !== '') {
        params.searchQuery = searchQuery.trim()
      }

      // 계정 상태 필터
      if (filters.accountStatus) {
        params.userIsActivateYn = filters.accountStatus
      }

      // 계정 구분 필터
      if (filters.accountType) {
        params.userTypeCd = Number(filters.accountType)
      }

      const response = await api.$get('/admin/members', { params })

      if (response && response.output) {
        setMembers(response.output.content || [])
        setTotalElements(response.output.totalElements || 0)
        setTotalPages(response.output.totalPages || 0)
      }
    } catch (error) {
      console.error('회원 목록 조회 실패:', error)
      showAlert('회원 목록을 불러오는데 실패했습니다.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  // 검색 실행
  const handleSearch = () => {
    setCurrentPage(1) // 검색 시 첫 페이지로
    fetchMembers()
  }

  // Enter 키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 회원 상세 페이지로 이동
  const goToMemberDetail = (userSq) => {
    router.push(`/admin/members/${userSq}`)
  }

  // 페이지 변경 시 자동 조회
  useEffect(() => {
    fetchMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // 초기 로드
  useEffect(() => {
    fetchMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section>
      <CommonPageHeader
        title=""
        strongText="회원 관리"
        breadcrumbs={[{ text: 'Home', link: '/admin/adminIndex' }, { text: '회원 관리' }]}
      />

      <div className={`${styles.pageContainer} py-5 mt-3`}>
        {/* 검색 및 필터 영역 */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="mb-3">회원 정보</h5>
                <div className="row g-3">
                  {/* 검색어 입력 */}
                  <div className="col-md-4">
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      type="text"
                      className="form-control"
                      placeholder="아이디, 이름, 이메일 입력"
                    />
                  </div>

                  {/* 계정 상태 필터 */}
                  <div className="col-md-3">
                    <select
                      value={filters.accountStatus}
                      onChange={(e) =>
                        setFilters({ ...filters, accountStatus: e.target.value })
                      }
                      className="form-select"
                    >
                      <option value="">계정 상태</option>
                      <option value="Y">활성화</option>
                      <option value="N">비활성화</option>
                    </select>
                  </div>

                  {/* 계정 구분 필터 */}
                  <div className="col-md-3">
                    <select
                      value={filters.accountType}
                      onChange={(e) =>
                        setFilters({ ...filters, accountType: e.target.value })
                      }
                      className="form-select"
                    >
                      <option value="">계정 구분</option>
                      <option value="301">개인</option>
                      <option value="302">기업</option>
                      <option value="303">관리자</option>
                    </select>
                  </div>

                  {/* 검색 버튼 */}
                  <div className="col-md-2">
                    <button className="btn btn-primary w-100" onClick={handleSearch}>
                      검색
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 회원 목록 테이블 */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>아이디</th>
                        <th>이름</th>
                        <th>이메일</th>
                        <th>계정 상태</th>
                        <th>계정 구분</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : members.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-5 text-muted">
                            등록된 회원이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        members.map((member) => (
                          <tr
                            key={member.userSq}
                            style={{ cursor: 'pointer' }}
                            onClick={() => goToMemberDetail(member.userSq)}
                          >
                            <td>
                              <span className="text-primary fw-medium">{member.userId}</span>
                            </td>
                            <td>{member.userNm}</td>
                            <td>{member.userEmail}</td>
                            <td>
                              {member.userIsActivateYn === 'Y' ? '활성화' : '비활성화'}
                            </td>
                            <td>{member.userTypeCdNm}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                {!loading && totalPages > 0 && (
                  <CommonPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }

        .card {
          transition: box-shadow 0.3s ease;
        }

        .fw-medium {
          font-weight: 500;
        }
      `}</style>
    </section>
  )
}

