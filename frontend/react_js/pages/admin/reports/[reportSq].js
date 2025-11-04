import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'

export default function ReportDetailPage() {
  const router = useRouter()
  const { reportSq } = router.query
  const { showAlert } = useAlert()

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)

  // 처리 결과 입력 모달 상태
  const [showModal, setShowModal] = useState(false)
  const [reportResult, setReportResult] = useState('')

  // 신고 상세 조회
  const fetchReportDetail = async () => {
    if (!reportSq) return

    setLoading(true)
    try {
      const response = await api.$get(`/admin/reports/${reportSq}`)
      if (response && response.output) {
        setReport(response.output)
      }
    } catch (error) {
      console.error('신고 상세 조회 실패:', error)
      showAlert('신고 정보를 불러오는데 실패했습니다.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  // 신고 처리
  const handleProcessReport = async () => {
    if (!reportResult.trim()) {
      showAlert('처리 결과를 입력해주세요.', 'danger')
      return
    }

    if (!confirm('정말 이 신고를 처리하시겠습니까?')) {
      return
    }

    setProcessing(true)
    try {
      await api.$post(`/admin/reports/${reportSq}/process`, {
        reportResult: reportResult.trim(),
      })

      showAlert('신고 처리가 완료되었습니다.', 'success')
      setShowModal(false)
      setReportResult('')
      await fetchReportDetail() // 새로고침
    } catch (error) {
      console.error('신고 처리 실패:', error)
      showAlert('신고 처리에 실패했습니다.', 'danger')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const goBack = () => {
    router.push('/admin/reports')
  }

  useEffect(() => {
    if (reportSq) {
      fetchReportDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportSq])

  return (
    <>
      <section>
        <CommonPageHeader
          title=""
          strongText="신고 상세"
          breadcrumbs={[
            { text: 'Home', link: '/admin/adminIndex' },
            { text: '신고 관리', link: '/admin/reports' },
            { text: '신고 상세' },
          ]}
        />

        <div className="container py-5 mt-3">
          {/* 로딩 상태 */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : report ? (
            /* 신고 상세 정보 */
            <div className="row">
              <div className="col-lg-8 mx-auto">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light">
                    <h4 className="mb-0">신고 상세 정보</h4>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3 pb-3 border-bottom">
                      <div className="col-md-4">
                        <strong className="text-muted">제목</strong>
                      </div>
                      <div className="col-md-8">{report.reportTitle}</div>
                    </div>

                    <div className="row mb-3 pb-3 border-bottom">
                      <div className="col-md-4">
                        <strong className="text-muted">작성자</strong>
                      </div>
                      <div className="col-md-8">{report.reporterUserId}</div>
                    </div>

                    <div className="row mb-3 pb-3 border-bottom">
                      <div className="col-md-4">
                        <strong className="text-muted">신고일자</strong>
                      </div>
                      <div className="col-md-8">{formatDate(report.createdAtDtm)}</div>
                    </div>

                    <div className="row mb-3 pb-3 border-bottom">
                      <div className="col-md-4">
                        <strong className="text-muted">신고사유</strong>
                      </div>
                      <div className="col-md-8">{report.reportReasonTxt}</div>
                    </div>

                    <div className="row mb-3 pb-3 border-bottom">
                      <div className="col-md-4">
                        <strong className="text-muted">상태</strong>
                      </div>
                      <div className="col-md-8">
                        <span
                          className={
                            report.status === '대기중' ? 'text-danger fw-bold' : 'text-primary fw-bold'
                          }
                        >
                          {report.status}
                        </span>
                      </div>
                    </div>

                    <div className="row mb-3 pb-3 border-bottom">
                      <div className="col-md-4">
                        <strong className="text-muted">신고내용</strong>
                      </div>
                      <div className="col-md-8">
                        <div
                          className="report-content"
                          dangerouslySetInnerHTML={{
                            __html: report.targetContent || '-',
                          }}
                        />
                      </div>
                    </div>

                    {/* 처리완료인 경우 처리 결과 표시 */}
                    {report.status === '처리완료' && (
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <strong className="text-muted">처리결과</strong>
                        </div>
                        <div className="col-md-8">
                          <div className="alert alert-info mb-0">
                            {report.reportResult || '-'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 하단 버튼 영역 */}
                    <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                      <button className="btn btn-outline-secondary" onClick={goBack}>
                        목록으로
                      </button>
                      
                      {report.status === '대기중' && (
                        <button
                          className="btn btn-primary"
                          onClick={() => setShowModal(true)}
                        >
                          신고 처리 결과 등록
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 에러 상태 */
            <div className="row">
              <div className="col-12">
                <div className="alert alert-danger">신고 정보를 불러올 수 없습니다.</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 처리 결과 입력 모달 */}
      {showModal && (
        <>
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => !processing && setShowModal(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">신고 처리 결과 등록</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    disabled={processing}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* 신고 정보 요약 */}
                  <div className="alert alert-light mb-4">
                    <div className="row mb-2">
                      <div className="col-md-3">
                        <strong>제목:</strong>
                      </div>
                      <div className="col-md-9">{report?.reportTitle}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-3">
                        <strong>작성자:</strong>
                      </div>
                      <div className="col-md-9">{report?.reporterUserId}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-3">
                        <strong>신고사유:</strong>
                      </div>
                      <div className="col-md-9">{report?.reportReasonTxt}</div>
                    </div>
                    <div className="row">
                      <div className="col-md-3">
                        <strong>상태:</strong>
                      </div>
                      <div className="col-md-9">
                        <span className="text-danger">{report?.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="row mb-2">
                      <div className="col-md-3">
                        <strong>처리결과</strong>
                        <span className="text-danger ms-1">*</span>
                      </div>
                      <div className="col-md-9">
                        <textarea
                          className="form-control"
                          rows="5"
                          value={reportResult}
                          onChange={(e) => setReportResult(e.target.value)}
                          placeholder="처리 결과를 입력하세요&#10;예: 해당 계정 비활성화 조치"
                          disabled={processing}
                        ></textarea>
                        <div className="form-text">
                          처리 내용을 상세히 작성해주세요. 저장 후 상태가 '처리완료'로
                          변경됩니다.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={processing}
                  >
                    닫기
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleProcessReport}
                    disabled={processing || !reportResult.trim()}
                  >
                    {processing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        처리중...
                      </>
                    ) : (
                      '저장'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .card-header {
          border-bottom: 2px solid #dee2e6;
        }

        .border-bottom:last-child {
          border-bottom: none !important;
        }

        .report-content {
          max-height: 300px;
          overflow-y: auto;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }

        .badge {
          font-size: 0.85rem;
          padding: 0.35em 0.65em;
        }

        .modal.show {
          display: block;
        }
      `}</style>
    </>
  )
}

