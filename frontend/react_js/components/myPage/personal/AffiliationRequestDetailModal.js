import { useState, useEffect } from 'react';
import { useModalStore } from '../../../store/modalStore';
import { useAlertStore } from '../../../store/alertStore';
import ResumeDetailModal from '../common/ResumeDetailModal';
import { api } from '@/lib/axios';
import skillIconMap from '@/lib/skillIconMap';
import styles from './AffiliationRequestDetailModal.module.css';

const AffiliationRequestDetailModal = ({ applicationSq = 0 }) => {
  const modalStore = useModalStore();
  const alertStore = useAlertStore();

  const [companyInfo, setCompanyInfo] = useState({});
  const [applyInfo, setApplyInfo] = useState({});

  // 소속 정보 가져오기
  const getCompanyInfo = async () => {
    try {
      const res = await api.$get(`/mypage/applications/${applicationSq}`);
      setCompanyInfo(res.output.affiliation);
      setApplyInfo(res.output.apply);
    } catch (error) {
      alertStore.show('소속 정보를 불러올 수 없습니다.', 'danger');
    }
  };

  // 이력서 모달창 열기
  const openResumeModal = () => {
    modalStore.openModal(ResumeDetailModal, {
      resumeSq: applyInfo.resumeSq,
      projectSq: 0,
      applicationSq: 0,
      isFromApplicationList: false,
      api: api,
      skillIconMap: skillIconMap,
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
      <div className={styles.modalHeader}>
        <div className={styles.headerContent}>
          <i className="fas fa-building me-2"></i>
          <h4 className={styles.modalTitle}>소속 신청 내역</h4>
        </div>
        <button
          type="button"
          className="btn-close"
          onClick={closeModal}
          aria-hidden="true"
        ></button>
      </div>
      
      <div className={styles.modalBody}>
        {/* 회사 기본 정보 카드 */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <i className="fas fa-briefcase me-2"></i>
            <h5 className={styles.cardTitle}>기업 정보</h5>
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>
                <i className="fas fa-building me-2"></i>
                회사명
              </label>
              <div className={styles.infoValue}>{companyInfo.companyNm}</div>
            </div>

            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>
                <i className="fas fa-user-tie me-2"></i>
                대표자명
              </label>
              <div className={styles.infoValue}>{companyInfo.ceoNm}</div>
            </div>

            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>
                <i className="fas fa-calendar-alt me-2"></i>
                개업년수
              </label>
              <div className={styles.infoValue}>{companyInfo.openYear}년</div>
            </div>

            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>
                <i className="fas fa-map-marker-alt me-2"></i>
                회사위치
              </label>
              <div className={styles.infoValue}>{companyInfo.address}</div>
            </div>
          </div>
        </div>

        {/* 회사 설명 카드 */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <i className="fas fa-info-circle me-2"></i>
            <h5 className={styles.cardTitle}>회사 설명</h5>
          </div>
          <div className={styles.descriptionBox}>
            {companyInfo.greeting || '회사 설명이 없습니다.'}
          </div>
        </div>

        {/* 관련 태그 카드 */}
        {companyInfo.tags && companyInfo.tags.length > 0 && (
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <i className="fas fa-tags me-2"></i>
              <h5 className={styles.cardTitle}>관련 기술</h5>
            </div>
            <div className={styles.tagsContainer}>
              {companyInfo.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  <i className="fas fa-hashtag me-1"></i>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 이력서 정보 카드 */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <i className="fas fa-file-alt me-2"></i>
            <h5 className={styles.cardTitle}>지원 정보</h5>
          </div>
          
          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>
              <i className="fas fa-paperclip me-2"></i>
              소속 신청한 이력서
            </label>
            <div className={styles.resumeLink}>
              <button 
                type="button" 
                className={styles.resumeButton}
                onClick={openResumeModal}
              >
                <i className="fas fa-file-invoice me-2"></i>
                {applyInfo.resumeTtl}
                <i className="fas fa-external-link-alt ms-2"></i>
              </button>
            </div>
          </div>

          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>
              <i className="fas fa-comment-dots me-2"></i>
              간단한 자기소개
            </label>
            <div className={styles.greetingBox}>
              {applyInfo.greeting || '자기소개가 없습니다.'}
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.modalFooter}>
        <button type="button" className={styles.closeButton} onClick={closeModal}>
          <i className="fas fa-times me-2"></i>
          닫기
        </button>
      </div>
    </div>
  );
};

export default AffiliationRequestDetailModal;

