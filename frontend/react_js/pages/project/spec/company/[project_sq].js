import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import skillIconMap from '@/lib/skillIconMap'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import styles from './[project_sq].module.css'

export default function CompanyProjectSpecPage() {
  const router = useRouter()
  const { project_sq } = router.query
  const { user } = useAuth()
  const { showAlert } = useAlert()

  const [project, setProject] = useState({})
  const [scrapCount, setScrapCount] = useState('')
  const [loading, setLoading] = useState(true)

  // 프로젝트 상세 정보 조회
  const fetchProjectDetail = async () => {
    try {
      setLoading(true)
      console.log('프로젝트 상세 조회 - projectSq:', project_sq)
      
      const response = await api.$get(`/projects/${project_sq}/details`, {
        withCredentials: true
      })
      console.log('프로젝트 상세 응답:', response)
      setProject(response.output || {})
      setScrapCount(response.output?.projectScrapCnt || '')
    } catch (e) {
      console.error('프로젝트 상세 정보 불러오기 실패', e)
      showAlert('프로젝트 정보를 불러오는 중 오류가 발생했습니다.', 'danger')
      router.push('/project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // router.isReady를 확인하여 query가 준비될 때까지 대기
    if (router.isReady && project_sq) {
      console.log('라우터 준비됨, 프로젝트 조회:', project_sq)
      fetchProjectDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, project_sq])

  // 모집 마감 여부
  const isRecruitmentEnded = () => {
    if (!project.projectRecruitEndDt) return false
    const endDate = new Date(project.projectRecruitEndDt + 'T23:59:59')
    const now = new Date()
    return endDate < now
  }

  // 지원하기 (외부 기업)
  const openMemberModal = () => {
    // TODO: 멤버 선택 모달 열기
    showAlert('멤버 선택 모달 구현 예정', 'info')
  }

  // 스크랩 클릭
  const clickScrap = async () => {
    if (!user?.userSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    
    try {
      const hasScrapped = project.isScrap === 1
      const response = await api.$post(`/projects/${project_sq}/scraps`, {
        hasScrapped,
        target: '프로젝트'
      })

      if (hasScrapped) {
        showAlert('스크랩 해제에 성공하였습니다.', 'success')
      } else {
        showAlert('스크랩에 성공하였습니다.', 'success')
      }

      // 상태 업데이트
      setProject(prev => ({ ...prev, isScrap: hasScrapped ? 0 : 1 }))
      setScrapCount(response.output)
    } catch (error) {
      console.error('스크랩 실패:', error)
      showAlert('스크랩에 실패했습니다.', 'danger')
    }
  }

  // 수정하기
  const goToProjectPost = () => {
    router.push(`/mypage/projectPostPage/${project_sq}`)
  }

  // 삭제하기
  const deleteProject = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await api.$delete(`/projects/${project_sq}`)
      showAlert('프로젝트가 삭제되었습니다.', 'success')
      router.push('/project')
    } catch (error) {
      console.error(error)
      showAlert('프로젝트 삭제에 실패했습니다.', 'danger')
    }
  }

  // 스킬 아이콘 URL
  const getSkillIconUrl = (name) => {
    const key = name.toLowerCase().replace(/[\s.]+/g, '')
    return skillIconMap[key] || skillIconMap.default
  }

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </div>
          <p className="mt-3 text-muted">프로젝트 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 페이지 헤더 */}
      <CommonPageHeader
        title=""
        strongText="프로젝트 상세 정보"
        breadcrumbs={[{ text: 'Home', link: '/' }, { text: '프로젝트' }]}
      />

      <div style={{ maxWidth: 'calc(100% - 280px)', margin: '0 auto', padding: '0 20px' }} className={`py-5 ${styles.detailList}`}>
        <div className="row pt-4 mt-2 mb-5">
          {/* 우측: 회사 정보 (고정된 카드) */}
          <div className="col-md-4 order-md-2" style={{ position: 'sticky', top: '100px' }}>
            <div className="card position-relative">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="me-4 flex-shrink-0">
                    <img
                      src="/img/blog/medium/blog-2.jpg"
                      alt="프로젝트 이미지"
                      className="rounded-circle"
                      style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <h2 className="text-color-dark font-weight-normal text-5 mb-0">
                      {project.projectTtl}
                    </h2>
                    <p className="text-muted mb-0">{project.companyNm}</p>
                  </div>
                </div>

                <p>{project.projectDetail}</p>

                <div className="card-footer bg-white border-top-0 pt-4">
                  <div className="text-start text-2">
                    <p className="mb-1 text-color-primary">
                      <strong className="text-color-primary">모집 기간 :</strong>{' '}
                      {project.projectRecruitStartDt} ~ {project.projectRecruitEndDt}
                    </p>
                    <p className="mb-1 text-color-primary">
                      <strong className="text-color-primary">인터뷰 기간 :</strong>{' '}
                      {project.interviewStartDt} ~ {project.interviewEndDt}
                    </p>
                    <p className="mb-0 text-color-primary">
                      <strong className="text-color-primary">수행 기간 :</strong>{' '}
                      {project.projectStartDt} ~ {project.projectEndDt}
                    </p>
                  </div>
                </div>

                <hr className="solid my-4" />

                <div className="d-flex justify-content-center align-items-center gap-3">
                  {/* 외부 기업 - 지원하기 버튼 */}
                  {project.userRole === 'COMPANY_EXTERNAL' &&
                    project.isApplied === 0 &&
                    !isRecruitmentEnded() && (
                      <a
                        onClick={(e) => { e.preventDefault(); openMemberModal() }}
                        href="#"
                        className="btn btn-lg btn-rounded btn-primary btn-lg"
                      >
                        지원하기
                      </a>
                    )}

                  {/* 지원 완료 */}
                  {project.userRole === 'COMPANY_EXTERNAL' &&
                    project.isApplied === 1 && (
                      <span className="btn btn-lg btn-rounded btn-primary btn-lg">
                        지원 완료
                      </span>
                    )}

                  {/* 지원 마감 */}
                  {isRecruitmentEnded() && (
                    <span className="btn btn-lg btn-rounded btn-light disabled">
                      지원 마감
                    </span>
                  )}

                  {/* 외부 기업 - 스크랩 버튼 */}
                  {project.userRole === 'COMPANY_EXTERNAL' && (
                    <a
                      onClick={(e) => { e.preventDefault(); clickScrap() }}
                      href="#"
                      className={`btn btn-lg btn-rounded d-flex align-items-center gap-2 ${styles.customScrapBtn}`}
                    >
                      <i
                        className={`bi ${
                          project.isScrap === 1
                            ? 'bi-heart-fill text-danger'
                            : 'bi-heart text-secondary'
                        }`}
                      ></i>
                      {project.isScrap === 1 ? '스크랩 해제' : '스크랩'} {scrapCount}
                    </a>
                  )}

                  {/* 작성자 - 수정/삭제 버튼 */}
                  {project.userRole === 'COMPANY_AUTHOR' && (
                    <>
                      <a
                        onClick={(e) => { e.preventDefault(); goToProjectPost() }}
                        href="#"
                        className="btn btn-lg btn-rounded btn-primary btn-lg"
                      >
                        수정하기
                      </a>
                      <a
                        onClick={(e) => { e.preventDefault(); deleteProject() }}
                        href="#"
                        className="btn btn-lg btn-rounded btn-light btn-lg"
                      >
                        삭제하기
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* 조회수 텍스트 (우측 하단으로 배치) */}
              <div className="position-absolute top-0 end-0 p-2">
                <span className="text-grey" style={{ fontSize: '0.8rem' }}>
                  조회수: {project.projectViewCnt}
                </span>
              </div>
            </div>
          </div>

          {/* 좌측: 지원 자격 */}
          <div
            className="col-md-8 mb-4 mb-md-0 order-md-1"
            style={{
              border: '1px solid #dee2e6',
              borderRadius: '10px',
              padding: '24px 32px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
            }}
          >
            <h2 className="text-color-dark font-weight-normal text-5 mb-2">
              지원 자격 / 근무 조건
            </h2>

            <ul>
              <li>
                <strong className="text-color-primary">필수 기술 </strong>
                <ul className="ps-4 mb-2">
                  {project.projectRequiredSkills?.map((skillGroup, index) => (
                    <li key={index}>
                      <strong className="text-dark">{skillGroup.parentSkillTagNm}</strong>
                      <ul className={`${styles.childSkillList} mt-1 ps-3`}>
                        {skillGroup.childSkillTagNms?.map((skill, idx) => (
                          <li key={idx} className="d-flex align-items-center gap-2 mb-1">
                            <img
                              src={getSkillIconUrl(skill)}
                              alt={skill}
                              width="24"
                              height="24"
                              className="me-1"
                            />
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>

              <li>
                <strong className="text-color-primary">우대 기술</strong>
                <ul className="ps-4 mb-2">
                  {project.projectPreferredSkills?.map((skillGroup, index) => (
                    <li key={index} className="mb-2">
                      <strong className="text-dark">{skillGroup.parentSkillTagNm}</strong>
                      <ul className={`${styles.childSkillList} mt-1 ps-3`}>
                        {skillGroup.childSkillTagNms?.map((skill, idx) => (
                          <li key={idx} className="d-flex align-items-center gap-2 mb-1">
                            <img
                              src={getSkillIconUrl(skill)}
                              alt={skill}
                              width="24"
                              height="24"
                              className="me-1"
                            />
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>

              {/* 우대 사항 */}
              <li>
                <strong className="text-color-primary">우대 사항 :</strong>{' '}
                {project.projectPreferredEtc}
              </li>

              {/* 근무 조건 */}
              <li>
                <strong className="text-color-primary">근무 형태 :</strong>{' '}
                <span>{project.projectWorkType?.join(' / ')}</span>
              </li>
              <li>
                <strong className="text-color-primary">근무 지역 :</strong>{' '}
                {project.projectAddress}
              </li>
              <li>
                <strong className="text-color-primary">단가 :</strong>{' '}
                {project.projectSalary}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

