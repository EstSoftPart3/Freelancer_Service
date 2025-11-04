import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import skillIconMap from '@/lib/skillIconMap'

export default function ProjectCardGroup({ projects }) {
  const router = useRouter()
  const { user } = useAuth()
  const { showAlert } = useAlert()

  // 관리자 여부 확인
  const isAdmin = user?.userType === 'ADMIN'

  // 프로젝트 상세 페이지로 이동
  const goToProjectSpec = (project) => {
    const userType = localStorage.getItem('userType') || user?.userType
    if (userType === 'PERSONAL') {
      router.push(`/project/spec/user/${project.projectSq}`)
    } else if (userType === 'COMPANY') {
      router.push(`/project/spec/company/${project.projectSq}`)
    } else {
      router.push(`/project/spec/user/${project.projectSq}`)
    }
  }

  // 스킬 아이콘 URL 생성
  const generateIconUrl = (name) => {
    const key = name.toLowerCase().replace(/[\s.]+/g, '')
    return skillIconMap[key] || skillIconMap.default
  }

  // 프로젝트 상태 계산
  const getProjectStatus = (project) => {
    const today = new Date()
    const start = new Date(project.recruitStartDt)
    const end = new Date(project.recruitEndDt)

    if (today < start) {
      return { status: '채용예정' }
    } else if (today > end) {
      return { status: '채용종료' }
    } else {
      const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
      return { status: '채용중', dDay: `D-${diff}` }
    }
  }

  // 스크랩 클릭
  const clickScrap = async (project, index) => {
    if (!user?.userSq) {
      showAlert('로그인 후 이용해주세요.', 'danger')
      return
    }
    
    try {
      const isScrapped = project.hasScrapped === 'Y'

      // API 호출
      const response = await api.$post(
        `/projects/${project.projectSq}/scraps`,
        {
          hasScrapped: isScrapped,
          target: '프로젝트'
        }
      )

      // 성공 시 상태 업데이트
      projects[index].hasScrapped = isScrapped ? 'N' : 'Y'
      
      showAlert(
        isScrapped ? '스크랩 해제에 성공하였습니다.' : '스크랩에 성공하였습니다.',
        'success'
      )
    } catch (error) {
      console.error('스크랩 실패:', error)
      showAlert('스크랩에 실패했습니다.', 'danger')
    }
  }

  // 프로젝트 공개/숨김 토글 (관리자 전용)
  const handleToggle = async (projectSq, currentStatus) => {
    console.log('=== 숨김처리 디버깅 ===')
    console.log('projectSq:', projectSq)
    console.log('currentStatus:', currentStatus)
    
    const newStatus = currentStatus === 'Y' ? 'N' : 'Y'
    console.log('newStatus:', newStatus)
    
    const confirmMsg = `프로젝트를 ${newStatus === 'Y' ? '공개' : '숨김'} 처리하시겠습니까?`
    console.log('confirmMsg:', confirmMsg)
    
    if (!confirm(confirmMsg)) {
      return
    }
    
    try {
      await api.$patch(`/admin/projects/${projectSq}/activate`, {
        projectActivateYn: newStatus
      })
      
      showAlert(
        `프로젝트가 ${newStatus === 'Y' ? '공개' : '숨김'} 처리되었습니다.`,
        'success'
      )
      
      // 페이지 새로고침
      window.location.reload()
    } catch (error) {
      console.error('프로젝트 상태 변경 실패:', error)
      showAlert('상태 변경에 실패했습니다.', 'danger')
    }
  }

  return (
    <div className="row mb-4 position-relative">
      <div className="col">
        {projects.map((project, index) => {
          const isHidden = project.projectActivateYn === 'N'
          
          return (
          <div 
            key={project.projectSq || project.id} 
            className="card position-relative p-4 shadow-sm mb-3"
            style={{
              opacity: isAdmin && isHidden ? 0.5 : 1,
              transition: 'opacity 0.3s ease'
            }}
          >
            {/* 스크랩 아이콘 (카드 우측 상단 고정) */}
            <div className="position-absolute top-0 end-0 m-3">
              <a
                onClick={(e) => { e.preventDefault(); clickScrap(project, index) }}
                className="text-decoration-none"
                style={{ cursor: 'pointer' }}
              >
                <i
                  className={`bi ${
                    project.hasScrapped === 'Y'
                      ? 'bi-heart-fill text-danger'
                      : 'bi-heart text-muted'
                  } fs-4`}
                ></i>
              </a>
            </div>

            {/* 카드 본문 */}
            <div className="d-flex flex-row align-items-center">
              {/* 썸네일 이미지 */}
              <div
                className="me-4 flex-shrink-0"
                onClick={() => goToProjectSpec(project)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={
                    project.companyImageUrl ||
                    'https://freelancer-service.s3.ap-northeast-2.amazonaws.com/12461_3.png'
                  }
                  alt="프로젝트 이미지"
                  className="rounded-circle"
                  style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                />
              </div>

              {/* 텍스트 정보 */}
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="mb-0 fw-bold d-flex align-items-center">
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); goToProjectSpec(project) }}
                      className="text-dark text-decoration-none"
                    >
                      {project.projectTtl}
                    </a>
                    <span
                      className={`btn ${
                        getProjectStatus(project).status === '채용중'
                          ? 'btn-primary'
                          : 'btn-light'
                      } btn-sm ms-3`}
                    >
                      {getProjectStatus(project).status}
                      {getProjectStatus(project).status === '채용중' && (
                        <span className="badge bg-white text-primary fw-bold px-2 py-1 ms-2">
                          {getProjectStatus(project).dDay}
                        </span>
                      )}
                    </span>
                  </h4>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <p className="mb-2 text-muted fs-6">
                    <i className="bi bi-buildings"></i> {project.companyNm}
                  </p>
                </div>

                <div className="d-flex justify-content-between align-items-center text-muted fs-6">
                  <div>
                    {project.address} / {project.devGradeNm} / {project.requiredEduLvl} / {project.salary}원
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-2">
                  {project.reqSkills?.map((skill, idx) => (
                    <button key={idx} className="btn btn-rounded btn-3d btn-light btn-sm">
                      <img
                        src={generateIconUrl(skill)}
                        width="16"
                        height="16"
                        alt={skill}
                      />
                      {' '}{skill}
                    </button>
                  ))}
                </div>

                <div className="text-muted text-end">조회수: {project.viewCnt}</div>
              </div>
            </div>

            {/* 관리자 전용 영역 */}
            {isAdmin && (
              <div className="mt-3 pt-3 border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="me-2">공개 상태:</span>
                    <span
                      className={
                        isHidden ? 'text-danger fw-bold' : 'text-primary fw-bold'
                      }
                    >
                      {isHidden ? '비공개' : '공개'}
                    </span>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleToggle(project.projectSq, project.projectActivateYn)}
                  >
                    {isHidden ? '공개 처리' : '숨김 처리'}
                  </button>
                </div>
              </div>
            )}
          </div>
          )
        })}
      </div>
    </div>
  )
}

