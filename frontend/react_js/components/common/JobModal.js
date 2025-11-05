import React, { useState, useEffect } from 'react';
import { useModalStore } from '@/store/modalStore';
import styles from './JobModal.module.css';

/**
 * 직군 선택 모달
 * Props:
 * - jobs: Array<string> - 직군 목록
 * - selectedJobs: Array<string> - 이미 선택된 직군
 * - onConfirm: (jobs) => void
 */
export default function JobModal({ jobs = [], selectedJobs = [], onConfirm }) {
  const { closeModal } = useModalStore();
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected([...selectedJobs]);
  }, [selectedJobs]);

  const isSelected = (job) => {
    return selected.includes(job);
  };

  const toggleJob = (job) => {
    if (selected.includes(job)) {
      setSelected(selected.filter((j) => j !== job));
    } else {
      setSelected([...selected, job]);
    }
  };

  const handleConfirm = () => {
    onConfirm?.(selected);
    closeModal();
  };

  return (
    <div className="modal-content">
      <div className={styles.modalHeader}>
        <div className={styles.headerContent}>
          <i className="fas fa-briefcase me-2"></i>
          <h4 className={styles.modalTitle}>모집 직군 선택</h4>
        </div>
        <button type="button" className={styles.btnClose} onClick={closeModal}>
          ×
        </button>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.jobGrid}>
          {jobs.map((job) => (
            <button
              key={job}
              type="button"
              className={`${styles.jobButton} ${isSelected(job) ? styles.selected : ''}`}
              onClick={() => toggleJob(job)}
            >
              {job}
            </button>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className={styles.emptyState}>
            <i className="fas fa-inbox"></i>
            <p>선택 가능한 직군이 없습니다.</p>
          </div>
        )}
      </div>

      <div className={styles.modalFooter}>
        <div className={styles.selectedCount}>
          <i className="fas fa-check-circle me-2"></i>
          선택된 직군: <strong>{selected.length}개</strong>
        </div>
        <div className={styles.buttonGroup}>
          <button type="button" className={styles.btnSecondary} onClick={closeModal}>
            <i className="fas fa-times me-2"></i>
            취소
          </button>
          <button type="button" className={styles.btnPrimary} onClick={handleConfirm}>
            <i className="fas fa-check me-2"></i>
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
}

