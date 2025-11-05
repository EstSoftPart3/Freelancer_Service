import React, { useState } from 'react';
import { useModalStore } from '@/store/modalStore';
import styles from './CalendarModal.module.css';

/**
 * 날짜 범위 선택 모달
 * Props:
 * - onConfirm: (startDate, endDate) => void
 * - title: string (default: '기간 선택')
 */
export default function CalendarModal({ onConfirm, title = '기간 선택' }) {
  const { closeModal } = useModalStore();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    setError('');

    if (!startDate) {
      setError('시작일을 선택해주세요.');
      return;
    }

    if (!endDate) {
      setError('종료일을 선택해주세요.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError('종료일은 시작일보다 이전일 수 없습니다.');
      return;
    }

    onConfirm?.(startDate, endDate);
    closeModal();
  };

  return (
    <div className="modal-content">
      <div className={styles.modalHeader}>
        <div className={styles.headerContent}>
          <i className="fas fa-calendar-alt me-2"></i>
          <h4 className={styles.modalTitle}>{title}</h4>
        </div>
        <button type="button" className={styles.btnClose} onClick={closeModal}>
          ×
        </button>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.dateInputGroup}>
          <div className={styles.dateField}>
            <label className={styles.label}>
              <i className="fas fa-calendar-check me-2"></i>
              시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>

          <div className={styles.dateSeparator}>
            <i className="fas fa-arrow-right"></i>
          </div>

          <div className={styles.dateField}>
            <label className={styles.label}>
              <i className="fas fa-calendar-times me-2"></i>
              종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
              min={startDate}
            />
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        {startDate && endDate && !error && (
          <div className={styles.previewBox}>
            <i className="fas fa-info-circle me-2"></i>
            선택된 기간: <strong>{startDate}</strong> ~ <strong>{endDate}</strong>
          </div>
        )}
      </div>

      <div className={styles.modalFooter}>
        <button type="button" className={styles.btnSecondary} onClick={closeModal}>
          <i className="fas fa-times me-2"></i>
          취소
        </button>
        <button type="button" className={styles.btnPrimary} onClick={handleConfirm}>
          <i className="fas fa-check me-2"></i>
          확인
        </button>
      </div>
    </div>
  );
}

