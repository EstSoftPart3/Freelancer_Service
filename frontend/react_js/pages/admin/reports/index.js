import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import CommonPagination from '@/components/common/CommonPagination'
import styles from './index.module.css'

export default function ReportListPage() {
  const router = useRouter()
  const { showAlert } = useAlert()

  // 검색 및 필터
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    reportDate: '',
    reportReason: '',
    status: '', // '', 'R'(대기중), 'C'(처리완료)
  })

  // 신고 목록
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [totalPages, setTotalPages] = useState(0)

  // 신고 목록 조회
  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage - 1,
        size: pageSize,
      }

      if (searchQuery && searchQuery.trim() !== '') {
        params.searchQuery = searchQuery.trim()
      }
      if (filters.reportDate) {
        params.reportDate = filters.reportDate
      }
      if (filters.reportReason) {
        params.reportReason = filters.reportReason
      }
      if (filters.status) {
        params.status = filters.status
      }

      const response = await api.$get('/admin/reports', { params })

      if (response && response.output) {
        setReports(response.output.reports || [])
        setTotalPages(response.output.totalPages || 0)
      }
    } catch (error) {
      console.error('신고 목록 조회 실패:', error)
      showAlert('신고 목록을 불러오는데 실패했습니다.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  // 검색 실행
  const handleSearch = () => {
    setCurrentPage(1)
    fetchReports()
  }

  // Enter 키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 신고 상세 페이지로 이동
  const goToReportDetail = (reportSq) => {
    router.push(`/admin/reports/${reportSq}`)
  }

  // 페이지 변경 시 자동 조회
  useEffect(() => {
    fetchReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // 초기 로드
  useEffect(() => {
    fetchReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section>
      <CommonPageHeader
        title=""
        strongText="신고 관리"
        breadcrumbs={[{ text: 'Home', link: '/admin/adminIndex' }, { text: '신고 관리' }]}
      />

      <div className={`${styles.pageContainer} py-5 mt-3`}>
        {/* 검색 및 필터 영역 */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="mb-3">신고 정보</h5>
                <div className="row g-3">
                  {/* 검색어 입력 */}
                  <div className="col-md-3">
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      type="text"
                      className="form-control"
                      placeholder="제목/아이디 입력"
                    />
                  </div>

                  {/* 신고일자 필터 */}
                  <div className="col-md-2">
                    <input
                      type="date"
                      className="form-control"
                      value={filters.reportDate}
                      onChange={(e) =>
                        setFilters({ ...filters, reportDate: e.target.value })
                      }
                    />
                  </div>

                  {/* 신고사유 필터 */}
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={filters.reportReason}
                      onChange={(e) =>
                        setFilters({ ...filters, reportReason: e.target.value })
                      }
                    >
                      <option value="">신고사유</option>
                      <option value="욕설/비방">욕설/비방</option>
                      <option value="스팸/홍보">스팸/홍보</option>
                      <option value="개인정보 노출">개인정보 노출</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  {/* 상태 필터 */}
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                    >
                      <option value="">상태</option>
                      <option value="R">대기중</option>
                      <option value="C">처리완료</option>
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

        {/* 신고 목록 테이블 */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>신고일자</th>
                        <th>신고사유</th>
                        <th>상태</th>
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
                      ) : reports.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-5 text-muted">
                            등록된 신고가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        reports.map((report) => (
                          <tr
                            key={report.reportSq}
                            style={{ cursor: 'pointer' }}
                            onClick={() => goToReportDetail(report.reportSq)}
                          >
                            <td>
                              <span className="text-primary fw-medium">
                                {report.reportTitle}
                              </span>
                            </td>
                            <td>{report.reporterUserId}</td>
                            <td>
                              {new Date(report.createdAtDtm).toLocaleDateString('ko-KR')}
                            </td>
                            <td>
                              {['욕설/비방', '스팸/홍보', '개인정보 노출'].includes(report.reportReasonTxt) 
                                ? report.reportReasonTxt 
                                : '기타'}
                            </td>
                            <td>
                              <span
                                className={
                                  report.status === '대기중' ? 'text-danger fw-bold' : 'text-primary fw-bold'
                                }
                              >
                                {report.status}
                              </span>
                            </td>
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

        .badge {
          font-size: 0.85rem;
          padding: 0.35em 0.65em;
        }
      `}</style>
    </section>
  )
}

