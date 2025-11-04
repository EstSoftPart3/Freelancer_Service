import { useState, useEffect } from 'react';
import { useModalStore } from '../../../store/modalStore';
import { useAlertStore } from '../../../store/alertStore';
import ResumeDetailModal from '../common/ResumeDetailModal';
import api from '../../../utils/api';
import './AffiliationRequestDetailModal.css';

const AffiliationRequestDetailModal = ({ applicationSq = 0 }) => {
  const modalStore = useModalStore();
  const alertStore = useAlertStore();

  const [companyInfo, setCompanyInfo] = useState({});
  const [applyInfo, setApplyInfo] = useState({});

  // 소속 정보 가져오기
  const getCompanyInfo = async () => {
    try {
      const res = await api.get(`/mypage/applications/${applicationSq}`);
      setCompanyInfo(res.output.affiliation);
      setApplyInfo(res.output.apply);
    } catch (error) {
      alertStore.show('소속 정보를 불러올 수 없습니다.', 'danger');
    }
  };

  // 이력서 모달창 열기
  const openResumeModal = () => {
    modalStore.openModal(ResumeDetailModal, {
      title: '이력서 상세보기',
      size: 'modal-lg',
      resumeSq: applyInfo.resumeSq,
      onConfirm: () => {},
    });
  };

  // 모달 닫기
  const closeModal = () => {
    modalStore.closeModal();
  };

  useEffect(() => {
    getCompanyInfo();
  }, [applicationSq]);

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h4 className="modal-title" style={{ fontWeight: 'bold' }}>
          소속 신청 내역
        </h4>
        <button
          type="button"
          className="btn-close"
          onClick={closeModal}
          aria-hidden="true"
        ></button>
      </div>
      <div className="modal-body" style={{ backgroundColor: '#f5f5f5' }}>
        {/* 회사명 */}
        <div className="mb-3">
          <label
            htmlFor="companyName"
            className="form-label text-primary"
            style={{ fontWeight: 'bold' }}
          >
            회사명
          </label>
          <div className="text-dark" id="companyName">
            {companyInfo.companyNm}
          </div>
        </div>

        {/* 대표자명 */}
        <div className="mb-3">
          <label
            htmlFor="ceoName"
            className="form-label text-primary"
            style={{ fontWeight: 'bold' }}
          >
            대표자명
          </label>
          <div className="text-dark" id="ceoName">
            {companyInfo.ceoNm}
          </div>
        </div>

        {/* 개업년수 */}
        <div className="mb-3">
          <label
            htmlFor="yearsInBusiness"
            className="form-label text-primary"
            style={{ fontWeight: 'bold' }}
          >
            개업년수
          </label>
          <div className="text-dark" id="yearsInBusiness">
            {companyInfo.openYear}년
          </div>
        </div>

        {/* 회사위치 */}
        <div className="mb-3">
          <label
            htmlFor="companyLocation"
            className="form-label text-primary"
            style={{ fontWeight: 'bold' }}
          >
            회사위치
          </label>
          <div className="text-dark" id="companyLocation">
            {companyInfo.address}
          </div>
        </div>

        {/* 간단한 설명 */}
        <div className="mb-3">
          <label
            htmlFor="companyDescription"
            className="form-label text-primary"
            style={{ fontWeight: 'bold' }}
          >
            회사 설명
          </label>
          <div className="text-dark" id="companyDescription">
            {companyInfo.greeting}
          </div>
        </div>

        {/* 관련 태그 */}
        <div className="mb-3">
          <label
            htmlFor="companyTags"
            className="form-label text-primary"
            style={{ fontWeight: 'bold' }}
          >
            관련 태그
          </label>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {companyInfo.tags?.map((tag, index) => (
              <span key={index} className="btn btn-rounded btn-3d btn-light">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 이력서 선택 */}
        <div className="mb-3">
          <label
            htmlFor="resume"
            className="form-label text-primary"
            style={{ fontWeight: 'bold' }}
          >
            소속 신청한 이력서
          </label>
          <div className="text-dark" id="resume">
            선택한 이력서:
            <button 
              type="button" 
              className="text-primary btn-link" 
              onClick={openResumeModal}
            >
              {applyInfo.resumeTtl}
            </button>
          </div>
        </div>

        {/* 간단한 자기소개 */}
        <div className="mb-3">
          <label
            htmlFor="selfIntroduction"
            className="form-label text-primary"
            style={{ fontWeight: 'bold' }}
          >
            간단한 자기소개
          </label>
          <div className="text-dark" id="introduce">
            {applyInfo.greeting}
          </div>
        </div>
      </div>
      <div className="modal-footer">
        {/* <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          신청 취소
        </button> */}
        <button type="button" className="btn btn-light" onClick={closeModal}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default AffiliationRequestDetailModal;

