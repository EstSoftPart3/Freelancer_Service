import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAlertStore } from '@/store/alertStore';
import { useModalStore } from '@/store/modalStore';
import MyPageLayout from '../MyPageLayout';
import CalendarModal from '@/components/common/CalendarModal';
import SkillTagModal from '@/components/myPage/personal/SkillTagModal';
import WorkTypeModal from '@/components/common/WorkTypeModal';
import JobModal from '@/components/common/JobModal';
import InterviewTimeModal from '@/components/common/InterviewTimeModal';
import { api } from '@/lib/axios';
import styles from './ProjectPost.module.css';

export default function ProjectPostPage() {
  const router = useRouter();
  const { projectSq } = router.query;
  const alertStore = useAlertStore();
  const { openModal } = useModalStore();

  // Form data
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [devGrades, setDevGrades] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const [recruitJobs, setRecruitJobs] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [skills, setSkills] = useState([]);

  // Form values
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSalary, setProjectSalary] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedDevGrade, setSelectedDevGrade] = useState('');
  const [selectedEducation, setSelectedEducation] = useState('');
  const [projectStartDt, setProjectStartDt] = useState('');
  const [projectEndDt, setProjectEndDt] = useState('');
  const [recruitStartDt, setRecruitStartDt] = useState('');
  const [recruitEndDt, setRecruitEndDt] = useState('');
  const [selectedInterviewTimes, setSelectedInterviewTimes] = useState([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPreferSkills, setSelectedPreferSkills] = useState([]);
  const [preferContent, setPreferContent] = useState('');
  const [preferList, setPreferList] = useState([]);
  const [description, setDescription] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [showInterviewTimeModal, setShowInterviewTimeModal] = useState(false);

  // Location form
  const [form, setForm] = useState({
    postcode: '',
    address: '',
    detailAddress: '',
    sigungu: '',
    latitude: null,
    longitude: null,
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevScrollY = useRef(0);

  // Computed values
  const selectedCityName = useMemo(() => {
    const raw = cities.find((city) => String(city.code) === String(selectedCity))?.name || '';
    const result = raw.replace('전체', ''); // '서울전체' → '서울'
    return result;
  }, [cities, selectedCity]);

  const selectedDistrictName = useMemo(() => {
    const raw = districts.find((district) => String(district.code) === String(selectedDistrict))?.name || '';
    const result = raw.replace('전체', '');
    return result;
  }, [districts, selectedDistrict]);

  const projectPeriodDisplay = useMemo(() => {
    return projectStartDt && projectEndDt
      ? `${projectStartDt} ~ ${projectEndDt}`
      : '';
  }, [projectStartDt, projectEndDt]);

  const recruitPeriodDisplay = useMemo(() => {
    return recruitStartDt && recruitEndDt
      ? `${recruitStartDt} ~ ${recruitEndDt}`
      : '';
  }, [recruitStartDt, recruitEndDt]);

  // Kakao Maps 로딩
  const loadKakao = () => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.kakao?.maps?.services?.Geocoder) return resolve();

      if (typeof window !== 'undefined' && !document.querySelector('script[src*="dapi.kakao.com"]')) {
        const script = document.createElement('script');
        script.src =
          'https://dapi.kakao.com/v2/maps/sdk.js?appkey=90610faa13d02b09f83a700d0885a872&libraries=services';
        script.async = false;
        document.head.appendChild(script);

        script.onload = () => {
          const start = Date.now();
          const timer = setInterval(() => {
            if (window.kakao?.maps?.services?.Geocoder) {
              clearInterval(timer);
              resolve();
            } else if (Date.now() - start > 7000) {
              clearInterval(timer);
              reject('⏱ Geocoder 로딩 7초 초과 실패');
            }
          }, 100);
        };

        script.onerror = () => reject('❌ Kakao 지도 API 스크립트 로드 실패');
      }
    });
  };

  // 신규 등록용 폼 데이터 로드
  const loadDefaultFormData = async () => {
    try {
      const response = await api.$get('/projects/forms');

      setCities(
        response.output.cities.map((city) => ({
          code: city.areaSq,
          name: city.areaName,
        }))
      );
      setDevGrades(response.output.devGrades);
      setEducationLevels(response.output.educationLevels);
      setRecruitJobs(response.output.recruitJobs);
      setWorkTypes(response.output.workTypes);
      setSkills(response.output.skills || []);
    } catch (e) {
      // 프로젝트 정보 불러오기 실패
    }
  };

  // 수정용 폼 데이터 로드
  const loadEditFormData = async (projectSq) => {
    try {
      const response = await api.$get(`/projects/forms`, {
        params: { projectSq },
      });
      const { output } = response;

      setCities(
        output.cities.map((city) => ({
          code: city.areaSq,
          name: city.areaName,
        }))
      );
      setDevGrades(output.devGrades);
      setEducationLevels(output.educationLevels);
      setRecruitJobs(output.recruitJobs);
      setWorkTypes(output.workTypes);
      setSkills(output.skills || []);

      const exist = output.existProjectVo;
      if (!exist) return;

      // 프로젝트 상세값 덮어쓰기
      setProjectTitle(exist.projectTtl);
      setProjectSalary(exist.projectSalary);
      setSelectedCity(exist.parentDistrict.areaSq);
      await fetchDistricts(exist.parentDistrict.areaSq);
      setSelectedDistrict(exist.subDistrict.areaSq);
      setSelectedDevGrade(exist.devGrade);
      setSelectedEducation(exist.educationLvl);
      setProjectStartDt(exist.projectStartDt);
      setProjectEndDt(exist.projectEndDt);
      setRecruitStartDt(exist.recruitStartDt);
      setRecruitEndDt(exist.recruitEndDt);
      setSelectedWorkTypes([...exist.contract]);
      setSelectedJobs([...exist.jobs]);
      setSelectedSkills([...exist.reqSkills]);
      setSelectedPreferSkills([...exist.preferSkills]);
      setPreferList(
        exist.preferredEtc
          ? exist.preferredEtc
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : []
      );
      setPreferContent('');
      setDescription(exist.description);
      setSelectedInterviewTimes(
        Object.entries(exist.interviewTimes).map(([date, times]) => ({
          date,
          times,
        }))
      );
      setIsInitialLoad(false);
    } catch (e) {
      const message = '프로젝트 정보를 불러오는 중 오류가 발생했습니다.';
      alertStore.show(message, 'danger');
      router.push('/project');
    }
  };

  // 구 목록 조회
  const fetchDistricts = async (areaCodeSq) => {
    if (!areaCodeSq) {
      setDistricts([]);
      setSelectedDistrict('');
      return;
    }

    try {
      const response = await api.$get(`/projects/${areaCodeSq}/districts`);
      setDistricts(
        response.output.map((area) => ({
          code: area.areaSq,
          name: area.areaName,
        }))
      );
    } catch (err) {
      // 구 정보 불러오기 실패
    }
  };

  // 초기 로드
  useEffect(() => {
    if (router.isReady) {
      if (!projectSq) {
        loadDefaultFormData(); // 신규 등록용
      } else {
        loadEditFormData(projectSq); // 수정용
      }
    }
  }, [router.isReady, projectSq]);

  // 시 변경 시 구 목록 업데이트
  useEffect(() => {
    const updateDistricts = async () => {
      await fetchDistricts(selectedCity);

      if (isInitialLoad) return;

      // 기존 선택된 하위 지역이 목록에 없다면 초기화
      const exists = districts.some(
        (district) => district.code === selectedDistrict
      );

      if (!exists) {
        setSelectedDistrict('');
        // 좌표도 초기화
        setForm((prev) => ({
          ...prev,
          latitude: null,
          longitude: null,
        }));
      }
    };

    updateDistricts();
  }, [selectedCity]);

  // 시/구 변경 시 좌표 변환
  useEffect(() => {
    const cityName = selectedCityName;
    const districtName = selectedDistrictName;
    
    if (!cityName || !districtName) {
      return;
    }

    const convertToCoordinates = async () => {
      try {
        await loadKakao();
        const geocoder = new window.kakao.maps.services.Geocoder();
        const fullAddr = `${cityName} ${districtName}`;
        
        geocoder.addressSearch(fullAddr, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const lat = parseFloat(result[0].y);
            const lon = parseFloat(result[0].x);
            
            setForm((prev) => ({
              ...prev,
              latitude: lat,
              longitude: lon,
            }));
          } else {
            alertStore.show(`주소 검색에 실패했습니다: ${fullAddr}`, 'danger');
          }
        });
      } catch (err) {
        alertStore.show('지도 API 로딩에 실패했습니다. 페이지를 새로고침해주세요.', 'danger');
      }
    };

    convertToCoordinates();
  }, [selectedCity, selectedDistrict, selectedCityName, selectedDistrictName]);

  // 우대사항 쉼표 입력 시 태그 추가
  useEffect(() => {
    if (preferContent.endsWith(',')) {
      const tags = preferContent
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0 && !preferList.includes(tag));

      setPreferList((prev) => [...prev, ...tags]);
      setPreferContent('');
    }
  }, [preferContent]);

  // 모달 열림 시 스크롤 비활성화
  // TODO: 모달 구현 후 활성화
  // useEffect(() => {
  //   if (modalStore.isOpen) {
  //     prevScrollY.current = window.scrollY;
  //     document.body.style.setProperty('overflow', 'hidden', 'important');
  //     document.documentElement.style.setProperty('overflow', 'hidden', 'important');
  //   } else {
  //     document.body.style.removeProperty('overflow');
  //     document.documentElement.style.removeProperty('overflow');
  //     window.scrollTo(0, prevScrollY.current);
  //   }
  // }, [modalStore.isOpen]);

  // 모달 열기 함수들
  const openSkillModal = () => {
    openModal(SkillTagModal, {
      onComplete: onSkillsConfirmed,
      selectedSkills: selectedSkills,
    });
  };

  const openPreferSkillModal = () => {
    openModal(SkillTagModal, {
      onComplete: onPreferSkillsConfirmed,
      selectedSkills: selectedPreferSkills,
    });
  };

  const openProjectCalenderModal = () => {
    openModal(CalendarModal, {
      onConfirm: onProjectTimeConfirmed,
      title: '프로젝트 기간 선택',
    });
  };

  const openRecruitCalenderModal = () => {
    openModal(CalendarModal, {
      onConfirm: onRecruitTimeConfirmed,
      title: '모집 기간 선택',
    });
  };

  const openWorkTypeModal = () => {
    openModal(WorkTypeModal, {
      onConfirm: onWorkTypeConfirmed,
      works: workTypes,
      selectedWorks: selectedWorkTypes,
    });
  };

  const openJobModal = () => {
    openModal(JobModal, {
      onConfirm: onJobConfirmed,
      jobs: recruitJobs,
      selectedJobs: selectedJobs,
    });
  };

  const openInterviewTimeModal = () => {
    setShowInterviewTimeModal(true);
  };

  // 모달 확인 콜백들
  const onSkillsConfirmed = (skills) => {
    if (skills) {
      setSelectedSkills(skills);
    }
  };

  const onPreferSkillsConfirmed = (skills) => {
    if (skills) {
      setSelectedPreferSkills(skills);
    }
  };

  const onProjectTimeConfirmed = (start, end) => {
    setProjectStartDt(start);
    setProjectEndDt(end);
  };

  const onRecruitTimeConfirmed = (start, end) => {
    setRecruitStartDt(start);
    setRecruitEndDt(end);
  };

  const onInterviewTimeConfirmed = (times) => {
    if (times) {
      setSelectedInterviewTimes(times);
    }
    setShowInterviewTimeModal(false);
  };

  const onWorkTypeConfirmed = (workTypes) => {
    setSelectedWorkTypes(workTypes);
  };

  const onJobConfirmed = (jobs) => {
    setSelectedJobs(jobs);
  };

  // 제거 함수들
  const removeWorkType = (name) => {
    setSelectedWorkTypes((prev) => prev.filter((work) => work !== name));
  };

  const removeJob = (name) => {
    setSelectedJobs((prev) => prev.filter((job) => job !== name));
  };

  const removeSkill = (name) => {
    setSelectedSkills((prev) =>
      prev.filter((skill) => {
        const skillName = typeof skill === 'string' ? skill : (skill.skillTagNm || skill.name);
        return skillName !== name;
      })
    );
  };

  const removePreferSkill = (name) => {
    setSelectedPreferSkills((prev) =>
      prev.filter((preferSkill) => {
        const skillName =
          typeof preferSkill === 'string' ? preferSkill : (preferSkill.skillTagNm || preferSkill.name);
        return skillName !== name;
      })
    );
  };

  const removeInterviewTime = (date) => {
    setSelectedInterviewTimes((prev) =>
      prev.filter((interviewTime) => interviewTime.date !== date)
    );
  };


  // 프로젝트 제출
  const submitProject = async (e) => {
    e.preventDefault();
    
    console.log('🚀 프로젝트 제출 시작');
    console.log('📍 현재 상태:', {
      selectedCity,
      selectedDistrict,
      selectedCityName,
      selectedDistrictName,
      latitude: form.latitude,
      longitude: form.longitude,
      preferList,
      preferContent,
    });

    // 우대 사항은 선택사항으로 변경 (검증 제거)

    if (!selectedDistrictName || selectedDistrictName.trim() === '') {
      console.log('❌ 구/군 정보 검증 실패');
      alertStore.show('구/군 정보가 올바르지 않습니다. 다시 선택해주세요.', 'danger');
      return;
    }
    
    // 좌표가 없으면 경고 표시
    if (!form.latitude || !form.longitude) {
      console.warn('⚠️ 좌표가 없습니다. 기본값(0, 0)으로 진행합니다.');
    }
    
    console.log('✅ 모든 검증 통과');

    const requestBody = {
      projectId: projectSq ?? null,
      projectTitle: projectTitle,
      projectSalary: projectSalary,
      projectImageUrl: '',

      subDistrictCode: selectedDistrict,
      subDistrictName: selectedDistrictName,

      districtLat: form.latitude || 0,
      districtLon: form.longitude || 0,

      devGrade: selectedDevGrade,
      educationLvl: selectedEducation,

      projectStartDt: projectStartDt,
      projectEndDt: projectEndDt,
      recruitStartDt: recruitStartDt,
      recruitEndDt: recruitEndDt,

      workType: [...selectedWorkTypes],

      recruitJob: [...selectedJobs],

      preferSkills: selectedPreferSkills
        .map((s) => (typeof s === 'string' ? s : (s?.skillTagNm || s?.name)))
        .filter((name) => !!name),
      usingSkills: selectedSkills
        .map((s) => (typeof s === 'string' ? s : (s?.skillTagNm || s?.name)))
        .filter((name) => !!name),

      preference: [...preferList, ...preferContent.split(',')]
        .map((s) => s.trim())
        .filter(Boolean)
        .join(','),

      description: description,

      interviewTime: selectedInterviewTimes.flatMap((item) =>
        item.times.map((time) => `${item.date}T${time}`)
      ),

      isNotification: notifyEnabled ? 'Y' : 'N',
    };

    console.log('📤 전송할 데이터:', requestBody);

    try {
      console.log('🌐 API 호출 시작');
      // API 호출 - 토큰이 자동으로 포함됩니다
      if (projectSq) {
        const response = await api.$patch('/projects', requestBody);
        console.log('✅ 수정 API 응답:', response);
        alertStore.show(response.message || '프로젝트가 수정되었습니다.', 'success');
      } else {
        const response = await api.$post('/projects', requestBody);
        console.log('✅ 등록 API 응답:', response);
        alertStore.show(response.message || '프로젝트가 등록되었습니다.', 'success');
      }
      router.push('/mypage/company/affiliation_project_list');
    } catch (error) {
      console.error('❌ API 호출 실패:', error);
      console.error('❌ 에러 상세:', error.response?.data || error.message);
      alertStore.show('프로젝트 등록/수정 중 오류가 발생했습니다.', 'danger');
    }
  };

  return (
    <MyPageLayout>
      <div className={`d-flex ${styles.layoutWrapper} mx-auto`}>
        <div
          className={`tab-pane tab-pane-navigation active show ${styles.content} flex-grow-1 px-4`}
          id="projectRegisterForm"
          role="tabpanel"
        >
          <h4 className="mb-3">{projectSq ? '프로젝트 수정' : '프로젝트 등록'}</h4>
        <div className="card bg-color-grey mb-4">
          <div className="card-body">
            <form className="contact-form form-style-2" onSubmit={submitProject}>
              {/* 프로젝트 제목 */}
              <div className="row">
                <div className="form-group col">
                  <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                    프로젝트 제목
                  </label>
                  <input
                    type="text"
                    className="form-control text-3 h-auto py-2"
                    name="title"
                    placeholder="예: 쇼핑몰 관리자 시스템 구축"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 프로젝트 장소 */}
              <div className="row">
                <div className="form-group col-lg-6">
                  <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                    시
                  </label>
                  <select
                    className="form-select form-control h-auto"
                    name="city"
                    value={selectedCity || ''}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    required
                  >
                    <option value="">선택</option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group col-lg-6">
                  <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                    구
                  </label>
                  <select
                    className="form-select form-control h-auto"
                    name="district"
                    value={selectedDistrict || ''}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    required
                  >
                    <option value="">선택</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 개발자 등급 / 학력 */}
              <div className="row">
                <div className="form-group col-lg-6">
                  <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                    개발자 등급(경력)
                  </label>
                  <select
                    className="form-select form-control h-auto"
                    name="career"
                    value={selectedDevGrade}
                    onChange={(e) => setSelectedDevGrade(e.target.value)}
                    required
                  >
                    <option value="">선택</option>
                    {devGrades.map((grade, index) => (
                      <option key={index} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group col-lg-6">
                  <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                    학력
                  </label>
                  <select
                    className="form-select form-control h-auto"
                    name="education"
                    value={selectedEducation}
                    onChange={(e) => setSelectedEducation(e.target.value)}
                    required
                  >
                    <option value="">선택</option>
                    {educationLevels.map((education, index) => (
                      <option key={index} value={education}>
                        {education}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 프로젝트 기간 */}
              <div className="row">
                <div className="form-group col">
                  <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                    프로젝트 기간
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openProjectCalenderModal();
                    }}
                    className="text-grey text-decoration-none small ms-2"
                  >
                    + 추가하기
                  </a>
                  <input
                    type="text"
                    className={`form-control text-3 h-auto py-2 ${styles.readonly}`}
                    name="period"
                    placeholder="예: 2025-04 ~ 2025-10"
                    value={projectPeriodDisplay}
                    required
                    readOnly
                  />
                </div>
              </div>

              {/* 모집 기간 */}
              <div className="row">
                <div className="form-group col">
                  <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                    모집 기간
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openRecruitCalenderModal();
                    }}
                    className="text-grey text-decoration-none small ms-2"
                  >
                    + 추가하기
                  </a>
                  <input
                    type="text"
                    className={`form-control text-3 h-auto py-2 ${styles.readonly}`}
                    name="period"
                    placeholder="예: 2025-04 ~ 2025-10"
                    value={recruitPeriodDisplay}
                    required
                    readOnly
                  />
                </div>
              </div>

              {/* 근무형태 / 모집직군 */}
              <div className="form-group mb-3">
                <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                  근무 형태
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openWorkTypeModal();
                    }}
                    className="text-grey text-decoration-none small ms-2"
                  >
                    + 추가하기
                  </a>
                </label>

                <div id="selectedSkillsPreview" className="mb-2 d-flex gap-2 flex-wrap">
                  {/* TODO: ProjectJobButtonGroup 컴포넌트 구현 후 활성화 */}
                  {selectedWorkTypes.length > 0 && (
                    <div className="badge me-1" style={{ backgroundColor: '#0088CC', color: 'white' }}>
                      {selectedWorkTypes.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label fw-bold">단가</label>
                <input
                  type="text"
                  className="form-control"
                  value={projectSalary}
                  onChange={(e) => setProjectSalary(e.target.value)}
                  placeholder="예: 1500000"
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                  모집 직군
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openJobModal();
                    }}
                    className="text-grey text-decoration-none small ms-2"
                  >
                    + 추가하기
                  </a>
                </label>

                <div id="selectedSkillsPreview" className="mb-2 d-flex gap-2 flex-wrap">
                  {/* TODO: ProjectJobButtonGroup 컴포넌트 구현 후 활성화 */}
                  {selectedJobs.length > 0 && (
                    <div className="badge me-1" style={{ backgroundColor: '#0088CC', color: 'white' }}>
                      {selectedJobs.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* 기술 */}
              <div className="form-group mb-3">
                <div className="d-flex align-items-center mb-1">
                  <label className="form-label text-2 fw-bold mb-0">사용 기술</label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openSkillModal();
                    }}
                    className="text-grey text-decoration-none small ms-2"
                  >
                    + 추가하기
                  </a>
                </div>

                {/* 선택된 기술 미리보기 */}
                <div id="selectedSkillsPreview" className="mb-2 d-flex gap-2 flex-wrap">
                  {/* TODO: ProjectSkillButtonGroup 컴포넌트 구현 후 활성화 */}
                  {selectedSkills.length > 0 && (
                    <div className="badge me-1" style={{ backgroundColor: '#0088CC', color: 'white' }}>
                      {selectedSkills.map(s => typeof s === 'string' ? s : (s.skillTagNm || s.name)).join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                  우대 기술
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openPreferSkillModal();
                    }}
                    className="text-grey text-decoration-none small ms-2"
                  >
                    + 추가하기
                  </a>
                </label>
                <div id="selectedSkillsPreview" className="mb-2 d-flex gap-2 flex-wrap">
                  {/* TODO: ProjectSkillButtonGroup 컴포넌트 구현 후 활성화 */}
                  {selectedPreferSkills.length > 0 && (
                    <div className="badge me-1" style={{ backgroundColor: '#0088CC', color: 'white' }}>
                      {selectedPreferSkills.map(s => typeof s === 'string' ? s : (s.skillTagNm || s.name)).join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* 자격요건 */}
              <div className="row">
                <div className="form-group col">
                  <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                    우대 사항
                  </label>

                  {/* 태그 리스트 */}
                  <div className="mb-2">
                    {preferList.map((item, index) => (
                      <span
                        key={index}
                        className="badge me-1"
                        style={{
                          backgroundColor: '#0088CC',
                          color: 'white',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setPreferList((prev) => prev.filter((_, i) => i !== index));
                        }}
                        title="클릭하여 삭제"
                      >
                        {item} &times;
                      </span>
                    ))}
                  </div>

                  <input
                    type="text"
                    className="form-control text-3 h-auto py-2"
                    value={preferContent}
                    onChange={(e) => setPreferContent(e.target.value)}
                    placeholder="쉼표(,)로 구분하여 입력"
                    name="qualification"
                  />
                </div>
              </div>

              {/* 상세내용 */}
              <div className="row">
                <div className="form-group col">
                  <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                    상세 내용
                  </label>
                  <textarea
                    maxLength="5000"
                    rows="6"
                    className="form-control text-3 h-auto py-2"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="form-group mb-3">
                <label
                  className="form-label mb-1 text-2"
                  style={{ fontWeight: 'bold', position: 'relative' }}
                >
                  인터뷰 가능 시간
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openInterviewTimeModal();
                    }}
                    className="text-grey text-decoration-none small ms-2"
                  >
                    + 추가하기
                  </a>
                </label>

                <div id="selectedSkillsPreview" className="mb-2 d-flex gap-2 flex-wrap">
                  {/* TODO: ProjectInterviewTimeButtonGroup 컴포넌트 구현 후 활성화 */}
                  {selectedInterviewTimes.length > 0 && (
                    <div className="badge me-1" style={{ backgroundColor: '#0088CC', color: 'white' }}>
                      {selectedInterviewTimes.map(item => `${item.date}: ${item.times.join(', ')}`).join(' / ')}
                    </div>
                  )}
                </div>
              </div>

              {/* 알림발신 */}
              <div className="form-group">
                <div className="form-check d-inline-flex align-items-center gap-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notifyCheckbox"
                    checked={notifyEnabled}
                    onChange={(e) => setNotifyEnabled(e.target.checked)}
                  />
                  <label className="form-check-label mb-0" htmlFor="notifyCheckbox">
                    알림 발신 여부
                  </label>
                </div>
              </div>

              {/* 등록 / 취소 버튼 */}
              <div className="row">
                <div className="form-group col">
                  <button type="submit" className="btn btn-primary">
                    {projectSq ? '수정' : '등록'}
                  </button>
                  <button type="reset" className="btn btn-light">
                    취소
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>

      {/* 인터뷰 시간 모달 */}
      {showInterviewTimeModal && (
        <InterviewTimeModal
          onConfirm={onInterviewTimeConfirmed}
          onClose={() => setShowInterviewTimeModal(false)}
          interviewTimes={selectedInterviewTimes}
        />
      )}
    </MyPageLayout>
  );
}
