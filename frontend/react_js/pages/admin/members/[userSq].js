import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import CommonPageHeader from '@/components/common/CommonPageHeader'

export default function MemberDetailPage() {
  const router = useRouter()
  const { userSq } = router.query
  const { showAlert } = useAlert()

  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  // 회원 상세 정보 조회
  const fetchMemberDetail = async () => {
    if (!userSq) return

    setLoading(true)
    try {
      const response = await api.$get(`/admin/members/${userSq}`)

      if (response && response.output) {
        setMember(response.output)
      }
    } catch (error) {
      console.error('회원 정보 조회 실패:', error)
      showAlert('회원 정보를 불러오는데 실패했습니다.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  // 계정 상태 토글 (활성화/비활성화)
  const toggleAccountStatus = async () => {
    const newStatus = member.userIsActivateYn === 'Y' ? 'N' : 'Y'
    const confirmMessage = `정말 이 계정을 ${newStatus === 'Y' ? '활성화' : '비활성화'}하시겠습니까?`

    if (!confirm(confirmMessage)) {
      return
    }

    setUpdating(true)
    try {
      await api.$patch(`/admin/members/${member.userSq}/status`, {
        userIsActivateYn: newStatus,
      })

      showAlert('계정 상태가 변경되었습니다.', 'success')
      await fetchMemberDetail() // 새로고침
    } catch (error) {
      console.error('계정 상태 변경 실패:', error)
      showAlert('계정 상태 변경에 실패했습니다.', 'danger')
    } finally {
      setUpdating(false)
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 뒤로가기
  const goBack = () => {
    router.push('/admin/members')
  }

  // 초기 로드
  useEffect(() => {
    if (userSq) {
      fetchMemberDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSq])

  return (
    <section>
      <CommonPageHeader
        title=""
        strongText="회원 상세"
        breadcrumbs={[
          { text: 'Home', link: '/admin/adminIndex' },
          { text: '회원 관리', link: '/admin/members' },
          { text: '회원 상세' },
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
        ) : member ? (
          /* 회원 상세 정보 */
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light">
                  <h4 className="mb-0">
                    회원 상세 정보
                  </h4>
                </div>
                <div className="card-body">
                  <div className="row mb-3 pb-3 border-bottom">
                    <div className="col-md-4">
                      <strong className="text-muted">아이디</strong>
                    </div>
                    <div className="col-md-8">{member.userId}</div>
                  </div>

                  <div className="row mb-3 pb-3 border-bottom">
                    <div className="col-md-4">
                      <strong className="text-muted">이름</strong>
                    </div>
                    <div className="col-md-8">{member.userNm}</div>
                  </div>

                  <div className="row mb-3 pb-3 border-bottom">
                    <div className="col-md-4">
                      <strong className="text-muted">이메일</strong>
                    </div>
                    <div className="col-md-8">{member.userEmail}</div>
                  </div>

                  <div className="row mb-3 pb-3 border-bottom">
                    <div className="col-md-4">
                      <strong className="text-muted">전화번호</strong>
                    </div>
                    <div className="col-md-8">{member.userPhoneNum || '-'}</div>
                  </div>

                  <div className="row mb-3 pb-3 border-bottom">
                    <div className="col-md-4">
                      <strong className="text-muted">생년월일</strong>
                    </div>
                    <div className="col-md-8">{member.userBirthDt || '-'}</div>
                  </div>

                  <div className="row mb-3 pb-3 border-bottom">
                    <div className="col-md-4">
                      <strong className="text-muted">계정 구분</strong>
                    </div>
                    <div className="col-md-8">{member.userTypeCdNm}</div>
                  </div>

                  <div className="row mb-3 pb-3 border-bottom">
                    <div className="col-md-4">
                      <strong className="text-muted">계정 상태</strong>
                    </div>
                    <div className="col-md-8">
                      {member.userIsActivateYn === 'Y' ? '활성화' : '비활성화'}
                    </div>
                  </div>

                  {/* 기업인 경우 추가 정보 */}
                  {member.companyNm && (
                    <>
                      <div className="row mb-3 pb-3 border-bottom">
                        <div className="col-md-4">
                          <strong className="text-muted">기업명</strong>
                        </div>
                        <div className="col-md-8">{member.companyNm}</div>
                      </div>

                      <div className="row mb-3 pb-3 border-bottom">
                        <div className="col-md-4">
                          <strong className="text-muted">대표자명</strong>
                        </div>
                        <div className="col-md-8">{member.companyCeoNm || '-'}</div>
                      </div>

                      <div className="row mb-3 pb-3 border-bottom">
                        <div className="col-md-4">
                          <strong className="text-muted">사업자등록번호</strong>
                        </div>
                        <div className="col-md-8">{member.companyBizNum || '-'}</div>
                      </div>
                    </>
                  )}

                  <div className="row mb-3 pb-3 border-bottom">
                    <div className="col-md-4">
                      <strong className="text-muted">가입일</strong>
                    </div>
                    <div className="col-md-8">{formatDate(member.createdAt)}</div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <strong className="text-muted">마지막 수정일</strong>
                    </div>
                    <div className="col-md-8">{formatDate(member.updatedAt)}</div>
                  </div>

                  {/* 하단 버튼 영역 */}
                  <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                    <button className="btn btn-outline-secondary" onClick={goBack}>
                      목록으로
                    </button>
                    
                    <button
                      className="btn btn-primary"
                      onClick={toggleAccountStatus}
                      disabled={updating}
                    >
                      {member.userIsActivateYn === 'Y' ? '계정 비활성화' : '계정 활성화'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 에러 상태 */
          <div className="row">
            <div className="col-12">
              <div className="alert alert-danger">회원 정보를 불러올 수 없습니다.</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .card-header {
          border-bottom: 2px solid #dee2e6;
        }

        .border-bottom:last-child {
          border-bottom: none !important;
        }
      `}</style>
    </section>
  )
}

