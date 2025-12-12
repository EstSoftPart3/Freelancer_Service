import React, { useState, useEffect } from 'react';
import './ResumeDetailModal.module.css';

/**
 * Props
 * - resumeSq: number          // 이력서 SQ
 * - projectSq: number         // 프로젝트 SQ
 * - applicationSq: number     // 지원서 SQ
 * - isFromApplicationList: boolean  // 지원서 목록에서 온 경우
 * - onClose: () => void       // 모달 닫기 함수
 * - api?: object              // axios 인스턴스 (선택)
 * - skillIconMap?: object     // 스킬 아이콘 맵 (선택)
 */
export default function ResumeDetailModal({
  resumeSq,
  projectSq,
  applicationSq,
  isFromApplicationList = false,
  onClose,
  api,
  skillIconMap = {},
}) {
  const [resumeInfo, setResumeInfo] = useState({
    resumeTtl: '',
    resumePhotoUrl: '',
    resumeNm: '',
    resumeBirthDt: '',
    resumePhoneNum: '',
    resumeEmail: '',
    address: { addressFull: '' },
    photo: '',
    educationList: [],
    careerList: [],
    trainingList: [],
    projectList: [],
    certificationList: [],
    skillTagList: [],
    resumeGreetingTxt: '',
    attachmentList: [],
  });

  // 카테고리별 태그 가져오기
  const getTagsByCategory = (project, category) => {
    const found = project.groupedSkillTags?.find((item) => item[category]);
    return found ? found[category] : [];
  };

  // 프로젝트 토글
  const toggleProject = (index) => {
    setResumeInfo((prev) => {
      const updated = { ...prev };
      updated.projectList = [...prev.projectList];
      updated.projectList[index] = {
        ...updated.projectList[index],
        isExpanded: !updated.projectList[index].isExpanded,
      };
      return updated;
    });
  };

  // 모든 프로젝트 펼치기
  const expandAllProjects = () => {
    setResumeInfo((prev) => ({
      ...prev,
      projectList: prev.projectList.map((project) => ({
        ...project,
        isExpanded: true,
      })),
    }));
  };

  // 모든 프로젝트 닫기
  const collapseAllProjects = () => {
    setResumeInfo((prev) => ({
      ...prev,
      projectList: prev.projectList.map((project) => ({
        ...project,
        isExpanded: false,
      })),
    }));
  };

  // 모달 닫기
  const closeModal = () => {
    onClose?.();
  };

  // 아이콘 URL 생성
  const generateIconUrl = (name) => {
    if (!name) return null;
    const key = name.toLowerCase().replace(/[\s.]+/g, '');
    return skillIconMap[key] || skillIconMap.default || null;
  };

  // 쿠키에서 토큰 가져오기
  const getAccessTokenFromCookie = () => {
    const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  // 이력서 상세 조회
  useEffect(() => {
    if (!resumeSq) return;

    const fetchResumeDetail = async () => {
      try {
        const token = getAccessTokenFromCookie();

        let response;

        if (api) {
          // axios 인스턴스를 사용하는 경우
          if (isFromApplicationList) {
            response = await api.$post(
              '/mypage/resume-detail-view',
              {
                resumeSq,
                projectSq,
                applicationSq,
              },
              {
                headers: {
                  Authorization: token ? `Bearer ${token}` : '',
                },
                withCredentials: true,
              }
            );
          } else {
            response = await api.$get(`/mypage/resume-detail/${resumeSq}`, {
              headers: {
                Authorization: token ? `Bearer ${token}` : '',
              },
              withCredentials: true,
            });
          }
        } else {
          // fetch를 사용하는 경우
          if (isFromApplicationList) {
            const res = await fetch('/api/mypage/resume-detail-view', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: token ? `Bearer ${token}` : '',
              },
              credentials: 'include',
              body: JSON.stringify({
                resumeSq,
                projectSq,
                applicationSq,
              }),
            });
            response = await res.json();
          } else {
            const res = await fetch(`/api/mypage/resume-detail/${resumeSq}`, {
              method: 'GET',
              headers: {
                Authorization: token ? `Bearer ${token}` : '',
              },
              credentials: 'include',
            });
            response = await res.json();
          }
        } 

        // 프로젝트 리스트에 isExpanded 추가
        const updatedOutput = {
          ...response.output,
          projectList: response.output.projectList.map((project) => ({
            ...project,
            isExpanded: true,
          })),
        };

        setResumeInfo(updatedOutput);
      } catch (err) {
        console.error('이력서 조회 실패:', err);
      }
    };

    fetchResumeDetail();
  }, [resumeSq, projectSq, applicationSq, isFromApplicationList, api]);

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h4 className="modal-title">{resumeInfo.title}</h4>
        <button
          type="button"
          className="btn-close"
          onClick={closeModal}
          aria-hidden="true"
        >
          ×
        </button>
      </div>
      <div className="modal-body">
        <div
          className="tab-pane tab-pane-navigation active show"
          id="resumeDetail"
          role="tabpanel"
        >
          <div className="card bg-color-grey mb-4 p-4">
            <div className="row align-items-start">
              {/* 이력서 제목 */}
              <div className="mb-4">
                <h5 className="mb-1 text-primary" style={{ fontWeight: 'bold' }}>
                  이력서 제목
                </h5>
                <p className="mb-0 text-dark">{resumeInfo.resumeTtl}</p>
              </div>

              {/* 사진 */}
              <div className="col-lg-3 mb-4 d-flex justify-content-center">
                <div
                  className="photo-box bg-white"
                  style={{
                    width: '100%',
                    maxWidth: '200px',
                    height: '200px',
                    border: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={resumeInfo.resumePhotoUrl || null}
                    alt="사진"
                    className="img-fluid rounded"
                    style={{ maxHeight: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="col-lg-9">
                <p>
                  <strong className="text-primary">이름 :</strong>
                  <span className="text-dark"> {resumeInfo.resumeNm}</span>
                </p>
                <p>
                  <strong className="text-primary">생년월일 :</strong>
                  <span className="text-dark"> {resumeInfo.resumeBirthDt}</span>
                </p>
                <p>
                  <strong className="text-primary">전화번호 :</strong>
                  <span className="text-dark"> {resumeInfo.resumePhoneNum}</span>
                </p>
                <p>
                  <strong className="text-primary">이메일 :</strong>
                  <span className="text-dark"> {resumeInfo.resumeEmail}</span>
                </p>
                <p>
                  <strong className="text-primary">주소 :</strong>
                  <span className="text-dark">
                    {resumeInfo.address?.addressFull}
                  </span>
                </p>
              </div>
            </div>

            <hr />

            {/* 학력 */}
            <h5 className="text-primary">학력</h5>
            <ul className="list-unstyled">
              {resumeInfo.educationList?.map((education, index) => (
                <li key={index}>
                  {education.educationSchoolNm}{' '}
                  {education.educationMajorNm}{' '}
                  {education.educationStatusNm} ({education.educationAdmissionDt}{' '}
                  ~ {education.educationGraduationDt})
                </li>
              ))}
            </ul>

            {/* 경력 */}
            <h5 className="text-primary">회사 이력</h5>
            <ul className="list-unstyled">
              {resumeInfo.careerList?.map((career, index) => (
                <li key={index}>
                  {career.careerCompanyNm} {career.careerDepartmentNm} -{' '}
                  {career.careerPositionNm} ({career.careerStartDt} ~{' '}
                  {career.careerEndDt})
                </li>
              ))}
            </ul>

            {/* 교육 이력 */}
            <h5 className="text-primary">교육 이력</h5>
            <ul className="list-unstyled">
              {resumeInfo.trainingList?.map((training, index) => (
                <li key={index}>
                  {training.trainingInstitutionNm} -{' '}
                  {training.trainingProgramNm} ({training.trainingStartDt} ~{' '}
                  {training.trainingEndDt})
                </li>
              ))}
            </ul>

            {/* 프로젝트 이력 */}
            <h5 className="text-primary d-flex justify-content-between align-items-center mb-3">
              프로젝트 이력
              <div className="d-flex gap-3">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    expandAllProjects();
                  }}
                  className="text-grey text-decoration-none small"
                >
                  <i className="fas fa-chevron-down me-2"></i>전체 펼치기
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    collapseAllProjects();
                  }}
                  className="text-grey text-decoration-none small"
                >
                  <i className="fas fa-chevron-up me-2"></i>전체 닫기
                </a>
              </div>
            </h5>

            <ul className="list-unstyled">
              {resumeInfo.projectList?.map((project, index) => (
                <li
                  key={index}
                  className="d-flex flex-wrap align-items-center gap-2"
                >
                  <div
                    className="btn btn-rounded btn-3d btn-light mb-2 w-100 d-flex align-items-center justify-content-between position-relative px-3 py-2"
                    style={{ textAlign: 'left' }}
                  >
                    <div
                      className="d-flex align-items-center flex-grow-1"
                      onClick={() => toggleProject(index)}
                    >
                      <i
                        className={`fas fa-chevron-right me-2 transition-transform ${
                          project.isExpanded ? 'rotate-90' : ''
                        }`}
                      ></i>
                      <span>
                        {project.projectHistoryClient}{' '}
                        {project.projectHistoryTask} ({project.projectHistoryStartDt}{' '}
                        ~ {project.projectHistoryEndDt})
                      </span>
                    </div>
                  </div>

                  {project.isExpanded && (
                    <div className="collapse show mb-3 w-100">
                      <div className="bg-light rounded p-3 border">
                        <div className="row mb-2">
                          <div className="col-sm-4">
                            <strong>고객사 : </strong>
                            {project.projectHistoryClient}
                          </div>
                          <div className="col-sm-4">
                            <strong>업무단 : </strong>
                            {project.projectHistoryJobPositionTypeNm}
                          </div>
                          <div className="col-sm-4">
                            <strong>역할 : </strong> {project.projectHistoryTypeNm}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-4">
                            <strong style={{ marginRight: '8px' }}>기종 : </strong>
                            {getTagsByCategory(project, 'Device')?.map((device) => (
                              <button
                                key={device}
                                className="btn btn-rounded btn-3d btn-light btn-sm me-2"
                              >
                                {generateIconUrl(device) && (
                                  <img
                                    src={generateIconUrl(device)}
                                    width="16"
                                    height="16"
                                    alt={device}
                                  />
                                )}
                                {device}
                              </button>
                            ))}
                          </div>
                          <div className="col-sm-8">
                            <strong style={{ marginRight: '8px' }}>OS : </strong>
                            {getTagsByCategory(project, 'OS')?.map((os) => (
                              <button
                                key={os}
                                className="btn btn-rounded btn-3d btn-light btn-sm me-2"
                              >
                                {generateIconUrl(os) && (
                                  <img
                                    src={generateIconUrl(os)}
                                    width="16"
                                    height="16"
                                    alt={os}
                                  />
                                )}
                                {os}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-12">
                            <strong style={{ marginRight: '8px' }}>DBMS : </strong>
                            {getTagsByCategory(project, 'DBMS')?.map((dbms) => (
                              <button
                                key={dbms}
                                className="btn btn-rounded btn-3d btn-light btn-sm me-2"
                              >
                                {generateIconUrl(dbms) && (
                                  <img
                                    src={generateIconUrl(dbms)}
                                    width="16"
                                    height="16"
                                    alt={dbms}
                                  />
                                )}
                                {dbms}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-12">
                            <strong style={{ marginRight: '8px' }}>언어 : </strong>
                            {getTagsByCategory(project, 'Language')?.map((lang) => (
                              <button
                                key={lang}
                                className="btn btn-rounded btn-3d btn-light btn-sm me-2"
                              >
                                {generateIconUrl(lang) && (
                                  <img
                                    src={generateIconUrl(lang)}
                                    width="16"
                                    height="16"
                                    alt={lang}
                                  />
                                )}
                                {lang}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-12">
                            <strong style={{ marginRight: '8px' }}>TOOL : </strong>
                            {getTagsByCategory(project, 'Tool')?.map((tool) => (
                              <button
                                key={tool}
                                className="btn btn-rounded btn-3d btn-light btn-sm me-2"
                              >
                                {generateIconUrl(tool) && (
                                  <img
                                    src={generateIconUrl(tool)}
                                    width="16"
                                    height="16"
                                    alt={tool}
                                  />
                                )}
                                {tool}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-12">
                            <strong style={{ marginRight: '8px' }}>FW : </strong>
                            {getTagsByCategory(project, 'FrameWork')?.map((framework) => (
                              <button
                                key={framework}
                                className="btn btn-rounded btn-3d btn-light btn-sm me-2"
                              >
                                {generateIconUrl(framework) && (
                                  <img
                                    src={generateIconUrl(framework)}
                                    width="16"
                                    height="16"
                                    alt={framework}
                                  />
                                )}
                                {framework}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* <div className="row mb-3">
                          <div className="col-sm-12">
                            <strong style={{ marginRight: '8px' }}>기타:</strong>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* 자격증 */}
            <h5 className="text-primary">자격증</h5>
            <ul className="list-unstyled">
              {resumeInfo.certificationList?.map((certificate, index) => (
                <li key={index}>
                  {certificate.certificationNm}
                </li>
              ))}
            </ul>

            {/* 기술 */}
            <h5 className="text-primary">보유 기술</h5>
            <div className="d-flex gap-2 flex-wrap mb-3">
              {resumeInfo.skillTagList?.map((skill, index) => (
                <div
                  key={index}
                  className="btn d-flex align-items-center gap-2 border-0"
                >
                  {generateIconUrl(skill) && (
                    <img
                      src={generateIconUrl(skill)}
                      width="20"
                      alt={skill}
                    />
                  )}
                  {skill}
                </div>
              ))}
            </div>

            {/* 자기소개 */}
            <h5 className="text-primary">자기소개</h5>
            <p className="border p-3 bg-white rounded text-dark">
              {resumeInfo.resumeGreetingTxt}
            </p>

            {/* 첨부파일 */}
            <h5 className="text-primary">첨부 파일</h5>
            {resumeInfo.attachmentList?.map((file, index) => (
              <p key={index}>
                <a href={file.attachmentFileUrl} target="_blank" rel="noopener noreferrer">
                  {file.attachmentOriginFileNm}
                </a>
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="modal-footer">
        {/* <button className="btn btn-primary" onClick={handleSelect}>선택하기</button> */}
        <button className="btn btn-outline-secondary" onClick={closeModal}>
          닫기
        </button>
      </div>
    </div>
  );
}

