import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/axios';
import MyPageLayout from '../../MyPageLayout';
import AddressSearchModal from '@/components/myPage/personal/AddressSearchModal';
import EducationSearchModal from '@/components/myPage/personal/EducationSearchModal';
import ResumeCompanyModal from '@/components/myPage/personal/ResumeCompanyModal';
import TrainingModal from '@/components/myPage/personal/TrainingModal';
import ShowProjectFormModal from '@/components/myPage/personal/ShowProjectFormModal';
import LicenseModal from '@/components/myPage/personal/LicenseModal';
import SkillTagModal from '@/components/myPage/personal/SkillTagModal';
import './ResumeForm.module.css';

const ResumeForm = () => {
  const router = useRouter();
  const { resumeSq } = router.query; // URL에서 resumeSq 가져오기

  // 이메일 도메인 목록
  const emailDomains = ['naver.com', 'gmail.com', 'daum.net', 'hanmail.net'];

  // 이력서 데이터 상태
  const [resumeData, setResumeData] = useState({
    addressSq: '',
    resumeTtl: '',
    resumeNm: '',
    resumeBirthDt: '',
    resumePhoneNum: '',
    resumeEmail: '',
    emailId: '',
    emailDomain: '',
    customDomain: '',
    address: '',
    detailAddress: '',
    zonecode: '',
    sido: '',
    sigungu: '',
    latitude: '',
    longitude: '',
    education: [],
    career: [],
    trainingHistories: [],
    projects: [],
    certificates: [],
    skills: [],
    resumeGreetingTxt: '',
    resumeIsNotificationYn: false,
    resumeIsRepresentativeYn: false,
    attachments: [],
    resumePhotoUrl: '',
  });

  // 사진 미리보기
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // 모달 상태 관리
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (resumeSq) {
      loadResumeData();
    }
  }, [resumeSq]);

  // 이력서 데이터 불러오기 (수정 모드)
  const loadResumeData = async () => {
    try {
      const response = await api.$get(`/mypage/resume/detail/${resumeSq}`);
      const data = response.output;

      if (data) {
        // 이메일 분리
        let emailId = '';
        let emailDomain = '';
        let customDomain = '';

        if (data.resumeEmail) {
          const [id, domain] = data.resumeEmail.split('@');
          emailId = id;
          if (emailDomains.includes(domain)) {
            emailDomain = domain;
          } else {
            emailDomain = 'custom';
            customDomain = domain;
          }
        }

        // 경력 데이터 변환
        const career = (data.career || []).map((e) => ({
          company: e.careerCompanyNm,
          department: e.careerDepartmentNm,
          position: e.careerPositionNm,
          startDate: e.careerStartDt ? e.careerStartDt.substring(0, 7) : '',
          endDate: e.careerEndDt ? e.careerEndDt.substring(0, 7) : '',
          period: e.period,
        }));

        setResumeData({
          addressSq: data.addressSq || '',
          resumeTtl: data.resumeTtl || '',
          resumeNm: data.resumeNm || '',
          resumeBirthDt: data.resumeBirthDt || '',
          resumePhoneNum: data.resumePhoneNum || '',
          resumeEmail: data.resumeEmail || '',
          emailId,
          emailDomain,
          customDomain,
          address: data.address || '',
          detailAddress: data.detailAddress || '',
          zonecode: data.zonecode || '',
          sigungu: data.sigungu || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          resumeGreetingTxt: data.resumeGreetingTxt || '',
          resumeIsNotificationYn: data.resumeIsNotificationYn === 'Y',
          resumeIsRepresentativeYn: data.resumeIsRepresentativeYn === 'Y',
          education: data.education || [],
          career: career,
          trainingHistories: data.trainingHistories || [],
          projects: data.projects || [],
          certificates: data.certificates || [],
          skills: data.skills || [],
          attachments: data.attachments || [],
          resumePhotoUrl: data.resumePhotoUrl || '',
        });

        // 사진 미리보기 설정
        if (data.resumePhotoUrl) {
          setPhotoPreview(data.resumePhotoUrl);
        }
      }
    } catch (error) {
      alert('이력서 정보를 불러오는데 실패했습니다.');
    }
  };

  // 입력 핸들러
  const handleInputChange = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 전화번호 자동 포맷팅
  const formatPhoneNumber = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    value = value.slice(0, 11);

    if (value.length >= 4 && value.length < 8) {
      value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
    } else if (value.length >= 8) {
      value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
    }

    handleInputChange('resumePhoneNum', value);
  };

  // 사진 업로드
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 사진 삭제
  const deletePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    handleInputChange('resumePhotoUrl', '');
  };

  // 파일 업로드
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    // 파일 처리 로직 구현
  };

  // 주소 검색 모달 열기
  const openAddressSearchModal = () => {
    setShowAddressModal(true);
  };

  // 주소 선택 완료
  const handleAddressComplete = (addressData) => {
    if (addressData) {
      setResumeData(prev => ({
        ...prev,
        address: addressData.address,
        zonecode: addressData.zonecode,
        sido: addressData.sido,
        sigungu: addressData.sigungu,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
      }));
    }
    setShowAddressModal(false);
  };

  // 학력 추가
  const showEducationForm = () => {
    setShowEducationModal(true);
  };

  // 학력 추가 완료
  const handleEducationComplete = (education) => {
    if (education) {
      setResumeData(prev => ({
        ...prev,
        education: [...prev.education, education],
      }));
    }
    setShowEducationModal(false);
  };

  // 경력 추가
  const showCareerForm = () => {
    setShowCareerModal(true);
  };

  // 경력 추가 완료
  const handleCareerComplete = (career) => {
    if (career) {
      // Date 객체를 문자열로 변환
      const formatDate = (date) => {
        if (!date) return '';
        if (date instanceof Date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        return date;
      };

      setResumeData(prev => ({
        ...prev,
        career: [...prev.career, {
          ...career,
          startDate: formatDate(career.startDate),
          endDate: formatDate(career.endDate),
        }],
      }));
    }
    setShowCareerModal(false);
  };

  // 교육 이력 추가 완료
  const handleTrainingComplete = (training) => {
    if (training) {
      setResumeData(prev => ({
        ...prev,
        trainingHistories: [...prev.trainingHistories, training],
      }));
    }
    setShowTrainingModal(false);
  };

  // 교육 이력 추가
  const showTrainingForm = () => {
    setShowTrainingModal(true);
  };

  // 프로젝트 추가
  const showProjectForm = () => {
    const newProjectId = `project-${Date.now()}`;
    setCurrentProjectId(newProjectId);
    setShowProjectModal(true);
  };

  // 프로젝트 추가 완료
  const handleProjectComplete = (project) => {
    if (project) {
      setResumeData(prev => ({
        ...prev,
        projects: [...prev.projects, { 
          // 화면 표시용 필드
          name: project.projectHistoryTask || '',
          period: project.projectHistoryStartDt && project.projectHistoryEndDt 
            ? `${project.projectHistoryStartDt} ~ ${project.projectHistoryEndDt}`
            : project.projectHistoryStartDt || '',
          client: project.projectHistoryClient || '',
          workUnit: project.projectHistoryTypeCdNm || '',
          role: project.projectHistoryJobPositionTypeCdNm || '',
          device: project.skillTags?.device?.map(s => s.skillTagNm).join(', ') || '',
          os: project.skillTags?.os?.map(s => s.skillTagNm).join(', ') || '',
          dbms: project.skillTags?.dbms?.map(s => s.skillTagNm).join(', ') || '',
          languages: project.skillTags?.language || [],
          tools: project.skillTags?.tool?.map(s => s.skillTagNm) || [],
          frameworks: project.skillTags?.framework || [],
          etc: [],
          isExpanded: true,
          
          // 백엔드 전송용 원본 데이터
          projectHistoryTask: project.projectHistoryTask,
          projectHistoryClient: project.projectHistoryClient,
          projectHistoryTypeCd: project.projectHistoryTypeCd,
          projectHistoryJobPositionTypeCd: project.projectHistoryJobPositionTypeCd,
          projectHistoryStartDt: project.projectHistoryStartDt,
          projectHistoryEndDt: project.projectHistoryEndDt,
          skillTags: project.skillTags,
        }],
      }));
    }
    setShowProjectModal(false);
    setCurrentProjectId(null);
  };

  // 자격증 추가
  const showCertificateForm = () => {
    setShowCertificateModal(true);
  };

  // 자격증 선택 완료
  const handleLicenseSelected = (license) => {
    if (license) {
      setResumeData(prev => ({
        ...prev,
        certificates: [...prev.certificates, {
          certificateName: license.name,
          certificateCode: license.id,
        }],
      }));
    }
    setShowCertificateModal(false);
  };

  // 기술 추가
  const showSkillsForm = () => {
    setShowSkillsModal(true);
  };

  // 기술 추가 완료
  const handleSkillsComplete = (skills) => {
    if (skills) {
      setResumeData(prev => ({
        ...prev,
        skills: skills,
      }));
    }
    setShowSkillsModal(false);
  };

  // 삭제 핸들러들
  const removeEducation = (index) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const removeCareer = (index) => {
    setResumeData((prev) => ({
      ...prev,
      career: prev.career.filter((_, i) => i !== index),
    }));
  };

  const removeTraining = (index) => {
    setResumeData((prev) => ({
      ...prev,
      trainingHistories: prev.trainingHistories.filter((_, i) => i !== index),
    }));
  };

  const removeProject = (index) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const removeCertificate = (index) => {
    setResumeData((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index),
    }));
  };

  const removeSkill = (index) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // 프로젝트 토글
  const toggleProject = (index) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((project, i) =>
        i === index
          ? { ...project, isExpanded: !project.isExpanded }
          : project
      ),
    }));
  };

  // 전체 프로젝트 펼치기
  const expandAllProjects = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((project) => ({
        ...project,
        isExpanded: true,
      })),
    }));
  };

  // 전체 프로젝트 접기
  const collapseAllProjects = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((project) => ({
        ...project,
        isExpanded: false,
      })),
    }));
  };

  // 날짜 포맷팅 함수들
  const formatPeriod = (admission, graduation) => {
    if (!admission) return '';
    const start = admission.replace('-', '.');
    if (!graduation) return `${start} ~ `;
    return `${start} ~ ${graduation.replace('-', '.')}`;
  };

  const careerPeriod = (start, end) => {
    if (!start) return '';
    
    // Date 객체인 경우 문자열로 변환
    let startStr = start;
    if (start instanceof Date) {
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, '0');
      const day = String(start.getDate()).padStart(2, '0');
      startStr = `${year}.${month}.${day}`;
    } else if (typeof start === 'string') {
      startStr = start.replace(/-/g, '.');
    }
    
    if (!end) return `${startStr} ~ `;
    
    let endStr = end;
    if (end instanceof Date) {
      const year = end.getFullYear();
      const month = String(end.getMonth() + 1).padStart(2, '0');
      const day = String(end.getDate()).padStart(2, '0');
      endStr = `${year}.${month}.${day}`;
    } else if (typeof end === 'string') {
      endStr = end.replace(/-/g, '.');
    }
    
    return `${startStr} ~ ${endStr}`;
  };

  const toYyyyMmDd = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}$/.test(dateStr)) return dateStr + '-01';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return null;
  };

  // 상세보기 모달 열기
  const openDetailModal = () => {
    // 이력서 미리보기 모달 구현 필요
    const confirmed = window.confirm(
      resumeSq ? '이력서를 수정하시겠습니까?' : '이력서를 등록하시겠습니까?'
    );
    if (confirmed) {
      submitResume();
    }
  };

  // 폼 제출
  const submitResume = async () => {
    // 유효성 검사
    if (!resumeData.latitude || !resumeData.longitude) {
      alert('주소 좌표 정보가 없습니다. 주소를 다시 선택해주세요.');
      return;
    }

    if (!resumeData.resumeTtl) {
      alert('이력서 제목을 입력해주세요.');
      return;
    }

    // 이메일 조합
    const email = `${resumeData.emailId}@${
      resumeData.emailDomain === 'custom'
        ? resumeData.customDomain
        : resumeData.emailDomain
    }`;

    // 전송용 DTO 생성 (백엔드 ResumeRequestDTO 구조에 맞춤)
    const dto = {
      resumeTtl: resumeData.resumeTtl,
      resumeNm: resumeData.resumeNm,
      resumeBirthDt: resumeData.resumeBirthDt,
      resumePhoneNum: resumeData.resumePhoneNum,
      resumeEmail: email,
      resumeGreetingTxt: resumeData.resumeGreetingTxt,
      resumeIsNotificationYn: resumeData.resumeIsNotificationYn ? 'Y' : 'N',
      resumeIsRepresentativeYn: resumeData.resumeIsRepresentativeYn ? 'Y' : 'N',
      
      // 주소 객체
      address: {
        zonecode: resumeData.zonecode,
        address: resumeData.address,
        detailAddress: resumeData.detailAddress || '',
        sigungu: resumeData.sigungu,
        latitude: parseFloat(resumeData.latitude),
        longitude: parseFloat(resumeData.longitude),
        areaCodeSq: null, // 백엔드에서 sigungu로 조회하도록 함
      },
      
      // 학력 리스트
      educationList: resumeData.education.map((e) => ({
        educationSchoolNm: e.educationSchoolNm,
        educationMajorNm: e.educationMajorNm,
        educationAdmissionDt: e.educationAdmissionDt,
        educationGraduationDt: e.educationGraduationDt,
        educationStatusCd: e.educationStatusCd,
      })),
      
      // 경력 리스트
      careerList: resumeData.career.map((e) => ({
        careerCompanyNm: e.company,
        careerDepartmentNm: e.department,
        careerPositionNm: e.position,
        careerStartDt: e.startDate,
        careerEndDt: e.endDate,
      })),
      
      // 프로젝트 이력 리스트
      projectHistoryList: resumeData.projects.map((p) => ({
        projectHistoryClient: p.projectHistoryClient || p.client,
        projectHistoryTypeCd: p.projectHistoryTypeCd,
        projectHistoryJobPositionTypeCd: p.projectHistoryJobPositionTypeCd,
        projectHistoryTask: p.projectHistoryTask || p.name,
        projectHistoryStartDt: p.projectHistoryStartDt,
        projectHistoryEndDt: p.projectHistoryEndDt,
        skillTagList: p.skillTags ? flattenSkillTags(p.skillTags) : [],
      })),
      
      // 자격증 리스트
      certificationList: resumeData.certificates.map((c) => ({
        certificationCd: c.certificateCode || c.id,
        certificationNm: c.certificateName || c.name,
      })),
      
      // 교육 이력 리스트
      trainingHistoryList: resumeData.trainingHistories.map((t) => ({
        trainingInstitutionNm: t.trainingInstitutionNm,
        trainingProgramNm: t.trainingProgramNm,
        trainingStartDt: t.trainingStartDt,
        trainingEndDt: t.trainingEndDt,
      })),
      
      // 보유 기술 리스트
      skillTagList: resumeData.skills.map((s) => ({
        skillTagSq: s.skillTagSq,
      })),
    };

    // FormData 생성 (multipart/form-data)
    const formData = new FormData();
    
    // DTO를 JSON으로 직렬화하여 추가
    const dtoJson = JSON.stringify(dto);
    formData.append('dto', new Blob([dtoJson], { type: 'application/json' }));
    
    // 프로필 이미지 첨부 (있는 경우)
    if (photoFile) {
      formData.append('profileImages', photoFile);
    }
    
    // 첨부파일들 추가 (있는 경우)
    if (resumeData.attachments && resumeData.attachments.length > 0) {
      resumeData.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    // sigungu 검증
    if (!resumeData.sigungu) {
      alert('주소의 시군구 정보가 없습니다. 주소를 다시 선택해주세요.');
      return;
    }

    try {
      if (resumeSq) {
        // 수정
        await api.$put(`/mypage/resume/${resumeSq}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('이력서가 성공적으로 수정되었습니다.');
        router.push('/mypage/personal/resum_list');
      } else {
        // 등록 (백엔드 @PostMapping)
        await api.$post('/mypage/resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('이력서가 성공적으로 등록되었습니다.');
        router.push('/mypage/personal/resum_list');
      }
    } catch (error) {
      alert('이력서 등록/수정 중 오류가 발생했습니다.');
    }
  };

  // 프로젝트의 skillTags 객체를 배열로 평탄화
  const flattenSkillTags = (skillTags) => {
    const result = [];
    for (const category in skillTags) {
      if (Array.isArray(skillTags[category])) {
        skillTags[category].forEach((skill) => {
          result.push({
            skillTagSq: skill.skillTagSq,
            parentSkillTagSq: skill.parentSkillTagSq,
            skillTagLvl: skill.skillTagLvl,
            skillTagNm: skill.skillTagNm,
          });
        });
      }
    }
    return result;
  };

  return (
    <MyPageLayout userType="PERSONAL">
    <div className="resume-form-container">
      <h4 className="mb-3" style={{ fontSize: '24px' }}>
        이력서 {resumeSq ? '수정' : '등록'}
      </h4>

      <div className="card bg-color-grey mb-4" style={{ padding: '20px' }}>
        <div className="card-body">
          <form onSubmit={(e) => e.preventDefault()} className="contact-form form-style-2">
            {/* 이력서 제목 */}
            <div className="form-group mb-4">
              <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                이력서 제목
              </label>
              <input
                value={resumeData.resumeTtl}
                onChange={(e) => handleInputChange('resumeTtl', e.target.value)}
                type="text"
                className="form-control text-3 h-auto py-2"
                style={{ border: 'none' }}
                placeholder="예: 백엔드 개발자 이력서"
                required
              />
            </div>

            {/* 위쪽: 사진 + 기본 정보 */}
            <div className="row align-items-start">
              {/* 증명사진 */}
              <div className="col-lg-3 mb-4 d-flex justify-content-center">
                <div className="photo-box bg-white position-relative">
                  {photoPreview && (
                    <a
                      href="#"
                      className="photo-delete-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        deletePhoto();
                      }}
                    >
                      ×
                    </a>
                  )}
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="사진 미리보기"
                      className="img-fluid rounded mb-2"
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div>
                      <label htmlFor="photoInput" className="photo-add-text">
                        + 사진 추가
                      </label>
                      <input
                        type="file"
                        id="photoInput"
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="d-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="col-lg-9">
                <div className="row">
                  {/* 이름 */}
                  <div className="form-group col-md-6 mb-3">
                    <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                      이름
                    </label>
                    <input
                      value={resumeData.resumeNm}
                      onChange={(e) => handleInputChange('resumeNm', e.target.value)}
                      type="text"
                      className="form-control text-3 h-auto py-2"
                      style={{ border: 'none' }}
                      required
                    />
                  </div>

                  {/* 생년월일 */}
                  <div className="form-group col-md-6 mb-3">
                    <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                      생년월일
                    </label>
                    <input
                      value={resumeData.resumeBirthDt}
                      onChange={(e) => handleInputChange('resumeBirthDt', e.target.value)}
                      type="date"
                      className="form-control text-3 h-auto py-2"
                      style={{ border: 'none' }}
                      required
                    />
                  </div>

                  {/* 전화번호 */}
                  <div className="form-group col-md-12 mb-3">
                    <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                      전화번호
                    </label>
                    <input
                      value={resumeData.resumePhoneNum}
                      onChange={formatPhoneNumber}
                      type="tel"
                      className="form-control text-3 h-auto py-2"
                      style={{ border: 'none' }}
                      placeholder="010-xxxx-xxxx"
                      required
                    />
                  </div>

                  {/* 이메일 */}
                  <div className="form-group col-md-12 mb-3">
                    <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                      이메일
                    </label>
                    <div className="d-flex email-input-group">
                      <input
                        value={resumeData.emailId}
                        onChange={(e) => handleInputChange('emailId', e.target.value)}
                        type="text"
                        className="form-control text-3 h-auto py-2 me-2"
                        placeholder="아이디"
                        required
                        style={{ border: 'none' }}
                      />
                      <span className="align-self-center me-2">@</span>
                      <select
                        value={resumeData.emailDomain}
                        onChange={(e) => handleInputChange('emailDomain', e.target.value)}
                        className="form-select text-3 h-auto py-2 me-2"
                        style={{ minWidth: '150px' }}
                        required
                      >
                        <option value="">선택</option>
                        {emailDomains.map((domain) => (
                          <option key={domain} value={domain}>
                            {domain}
                          </option>
                        ))}
                        <option value="custom">직접입력</option>
                      </select>
                      {resumeData.emailDomain === 'custom' && (
                        <input
                          value={resumeData.customDomain}
                          onChange={(e) => handleInputChange('customDomain', e.target.value)}
                          type="text"
                          className="form-control text-3 h-auto py-2"
                          placeholder="직접 입력"
                          style={{ border: 'none' }}
                        />
                      )}
                    </div>
                  </div>

                  {/* 주소 */}
                  <div className="form-group col-md-12 mb-3">
                    <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                      주소
                    </label>
                    <input
                      value={resumeData.address}
                      type="text"
                      className="form-control text-3 h-auto py-2"
                      style={{ border: 'none' }}
                      placeholder="주소를 입력하세요"
                      readOnly
                      onClick={openAddressSearchModal}
                      required
                    />
                  </div>

                  {/* 상세 주소 */}
                  <div className="form-group col-md-12 mb-3">
                    <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                      상세 주소
                    </label>
                    <input
                      value={resumeData.detailAddress}
                      onChange={(e) => handleInputChange('detailAddress', e.target.value)}
                      type="text"
                      className="form-control text-3 h-auto py-2"
                      style={{ border: 'none' }}
                      placeholder="상세주소를 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 학력 */}
            <div className="form-group mb-3">
              <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                학력
                <a
                  href="#"
                  className="text-grey text-decoration-none small ms-2"
                  onClick={(e) => {
                    e.preventDefault();
                    showEducationForm();
                  }}
                >
                  + 추가하기
                </a>
              </label>
              <div className="mb-2 d-flex gap-2 flex-wrap">
                {resumeData.education.map((education, index) => (
                  <div
                    key={index}
                    className="btn btn-rounded btn-3d btn-light mb-2 position-relative tag-item"
                  >
                    {education.educationSchoolNm}
                    {education.educationMajorNm && <span> / {education.educationMajorNm}</span>}
                    <span>
                      {' '}
                      ({formatPeriod(education.educationAdmissionDt, education.educationGraduationDt)})
                    </span>
                    <span
                      className="delete-icon"
                      title="삭제"
                      onClick={() => removeEducation(index)}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 회사 이력 */}
            <div className="form-group mb-3">
              <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                회사 이력
                <a
                  href="#"
                  className="text-grey text-decoration-none small ms-2"
                  onClick={(e) => {
                    e.preventDefault();
                    showCareerForm();
                  }}
                >
                  + 추가하기
                </a>
              </label>
              <div className="mb-2">
                {resumeData.career.map((career, index) => (
                  <span key={index} className="company-tag">
                    {career.company}회사 {career.department}부서 {career.position}
                    <span> ({careerPeriod(career.startDate, career.endDate)})</span>
                    <span
                      className="text-grey ms-2"
                      style={{ cursor: 'pointer' }}
                      title="삭제"
                      onClick={() => removeCareer(index)}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* 교육 이력 */}
            <div className="form-group mb-3">
              <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                교육 이력
                <a
                  href="#"
                  className="text-grey text-decoration-none small ms-2"
                  onClick={(e) => {
                    e.preventDefault();
                    showTrainingForm();
                  }}
                >
                  + 추가하기
                </a>
              </label>
              <div className="mb-2">
                {resumeData.trainingHistories.map((item, idx) => (
                  <span key={idx} className="training-tag">
                    {item.trainingProgramNm || item.program} / {item.trainingInstitutionNm || item.institution} / {item.period}
                    <span
                      className="text-grey ms-2"
                      style={{ cursor: 'pointer' }}
                      title="삭제"
                      onClick={() => removeTraining(idx)}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* 프로젝트 이력 */}
            <div className="form-group mb-3">
              <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                프로젝트 이력
                <a
                  href="#"
                  className="text-grey text-decoration-none small ms-2"
                  onClick={(e) => {
                    e.preventDefault();
                    showProjectForm();
                  }}
                >
                  + 추가하기
                </a>
              </label>
              <div className="d-flex justify-content-end gap-3 mb-3">
                <a
                  href="#"
                  className="text-dark text-decoration-none small"
                  onClick={(e) => {
                    e.preventDefault();
                    expandAllProjects();
                  }}
                >
                  <i className="fas fa-chevron-down me-2"></i>전체 펼치기
                </a>
                <a
                  href="#"
                  className="text-dark text-decoration-none small"
                  onClick={(e) => {
                    e.preventDefault();
                    collapseAllProjects();
                  }}
                >
                  <i className="fas fa-chevron-up me-2"></i>전체 닫기
                </a>
              </div>
              {resumeData.projects.map((project, index) => (
                <div key={index}>
                  <div className="project-header btn btn-rounded btn-3d btn-light mb-2 w-100 d-flex align-items-center justify-content-between position-relative px-3 py-2">
                    <div
                      className="d-flex align-items-center flex-grow-1"
                      onClick={() => toggleProject(index)}
                      style={{ cursor: 'pointer' }}
                    >
                      <i
                        className={`fas ${
                          project.isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'
                        } me-2`}
                      ></i>
                      <span>
                        {project.name} ({project.period})
                      </span>
                    </div>
                    <span
                      className="delete-icon-absolute"
                      title="삭제"
                      onClick={() => removeProject(index)}
                    >
                      ×
                    </span>
                  </div>
                  {project.isExpanded && (
                    <div className="collapse mb-3 show">
                      <div className="bg-light rounded p-3 border">
                        <div className="row mb-2">
                          <div className="col-sm-4">
                            <strong>고객사:</strong> {project.client}
                          </div>
                          <div className="col-sm-4">
                            <strong>업무단:</strong> {project.workUnit}
                          </div>
                          <div className="col-sm-4">
                            <strong>역할:</strong> {project.role}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-4">
                            <strong>기종:</strong> {project.device}
                          </div>
                          <div className="col-sm-4">
                            <strong>OS:</strong> {project.os}
                          </div>
                          <div className="col-sm-4">
                            <strong>DBMS:</strong> {project.dbms}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-12">
                            <strong style={{ marginRight: '8px' }}>언어:</strong>
                            {project.languages?.map((lang, i) => (
                              <button
                                key={i}
                                className="btn btn-rounded btn-3d btn-light btn-sm me-2"
                                type="button"
                              >
                                {lang.icon && (
                                  <img
                                    src={lang.icon}
                                    alt={lang.name}
                                    width="16"
                                    height="16"
                                  />
                                )}
                                {lang.skillTagNm}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-12">
                            <strong style={{ marginRight: '8px' }}>TOOL:</strong>
                            {project.tools?.map((tool, i) => (
                              <button
                                key={i}
                                className="btn btn-rounded btn-3d btn-light btn-sm me-2"
                                type="button"
                              >
                                {tool}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-12">
                            <strong style={{ marginRight: '8px' }}>FW:</strong>
                            {project.frameworks?.map((fw, i) => (
                              <button
                                key={i}
                                className="btn btn-rounded btn-3d btn-light btn-sm me-2"
                                type="button"
                              >
                                {fw.icon && (
                                  <img src={fw.icon} alt={fw.name} width="16" height="16" />
                                )}
                                {fw.skillTagNm}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-12">
                            <strong style={{ marginRight: '8px' }}>기타:</strong>
                            {project.etc?.map((etc, i) => (
                              <button
                                key={i}
                                className="btn btn-rounded btn-3d btn-light btn-sm me-2"
                                type="button"
                              >
                                {etc.icon && (
                                  <img src={etc.icon} alt={etc.name} width="16" height="16" />
                                )}
                                {etc.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 자격증 */}
            <div className="form-group mb-3">
              <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                자격증
                <a
                  href="#"
                  className="text-grey text-decoration-none small ms-2"
                  onClick={(e) => {
                    e.preventDefault();
                    showCertificateForm();
                  }}
                >
                  + 추가하기
                </a>
              </label>
              <div className="mb-2 d-flex gap-2 flex-wrap">
                {resumeData.certificates.map((certificate, index) => (
                  <div
                    key={index}
                    className="btn btn-rounded btn-3d btn-light mb-2 position-relative tag-item"
                  >
                    {certificate.certificateName}
                    <span
                      className="delete-icon"
                      title="삭제"
                      onClick={() => removeCertificate(index)}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 보유 기술 */}
            <div className="form-group mb-3">
              <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                보유 기술
                <a
                  href="#"
                  className="text-grey text-decoration-none small ms-2"
                  onClick={(e) => {
                    e.preventDefault();
                    showSkillsForm();
                  }}
                >
                  + 추가하기
                </a>
              </label>
              <div className="mb-2 d-flex gap-2 flex-wrap">
                {resumeData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="btn btn-rounded btn-light d-flex align-items-center gap-2 mb-2 btn-3d position-relative tag-item"
                  >
                    {skill.icon && (
                      <img src={skill.icon} alt={skill.name} width="20" height="20" />
                    )}
                    <span>{skill.skillTagNm}</span>
                    <a
                      href="#"
                      className="delete-icon"
                      title="삭제"
                      onClick={(e) => {
                        e.preventDefault();
                        removeSkill(index);
                      }}
                    >
                      ×
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* 이력서 첨부 */}
            <div className="form-group mb-3">
              <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                첨부파일
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="form-control text-3 h-auto py-2"
                accept=".pdf"
              />
            </div>

            {/* 자기소개 */}
            <div className="form-group mb-3">
              <label className="form-label mb-1 text-2" style={{ fontWeight: 'bold' }}>
                자기소개
              </label>
              <textarea
                value={resumeData.resumeGreetingTxt}
                onChange={(e) => handleInputChange('resumeGreetingTxt', e.target.value)}
                rows="5"
                className="form-control text-3 h-auto py-2"
                required
              ></textarea>
            </div>

            {/* 동의 */}
            <div className="form-group mb-3">
              <div className="form-check">
                <input
                  checked={resumeData.resumeIsNotificationYn}
                  onChange={(e) =>
                    handleInputChange('resumeIsNotificationYn', e.target.checked)
                  }
                  className="form-check-input"
                  type="checkbox"
                  id="agreeCheck"
                />
                <label className="form-check-label" htmlFor="agreeCheck">
                  알림 발신 여부
                </label>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="form-group mt-4">
              <button
                type="button"
                className="btn btn-primary px-4 py-2"
                onClick={openDetailModal}
              >
                {resumeSq ? '이력서 수정' : '이력서 등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    {/* 모달들 */}
    {showAddressModal && (
      <AddressSearchModal onComplete={handleAddressComplete} />
    )}

    {showEducationModal && (
      <EducationSearchModal onComplete={handleEducationComplete} />
    )}

    {showCareerModal && (
      <ResumeCompanyModal onComplete={handleCareerComplete} />
    )}

    {showTrainingModal && (
      <TrainingModal onComplete={handleTrainingComplete} />
    )}

    {showProjectModal && currentProjectId && (
      <ShowProjectFormModal 
        onComplete={handleProjectComplete}
        projectId={currentProjectId}
      />
    )}

    {showCertificateModal && (
      <LicenseModal 
        onLicenseSelected={handleLicenseSelected}
        selectedLicense={resumeData.certificates}
      />
    )}

    {showSkillsModal && (
      <SkillTagModal 
        onComplete={handleSkillsComplete}
        selectedSkills={resumeData.skills}
      />
    )}
    </MyPageLayout>
  );
};

export default ResumeForm;

