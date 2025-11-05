import React, { useState, useEffect } from 'react';
import { useModalStore } from '@/store/modalStore';
import styles from './WorkTypeModal.module.css';

/**
 * 근무 형태 선택 모달
 * Props:
 * - works: Array<string> - 근무 형태 목록
 * - selectedWorks: Array<string> - 이미 선택된 근무 형태
 * - onConfirm: (works) => void
 */
export default function WorkTypeModal({ works = [], selectedWorks = [], onConfirm }) {
  const { closeModal } = useModalStore();
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected([...selectedWorks]);
  }, [selectedWorks]);

  const isSelected = (type) => {
    return selected.includes(type);
  };

  const toggleType = (type) => {
    if (selected.includes(type)) {
      setSelected(selected.filter((w) => w !== type));
    } else {
      setSelected([...selected, type]);
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
          <i className="fas fa-user-clock me-2"></i>
          <h4 className={styles.modalTitle}>근무 형태 선택</h4>
        </div>
        <button type="button" className={styles.btnClose} onClick={closeModal}>
          ×
        </button>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.workGrid}>
          {works.map((work) => (
            <button
              key={work}
              type="button"
              className={`${styles.workButton} ${isSelected(work) ? styles.selected : ''}`}
              onClick={() => toggleType(work)}
            >
              {work}
            </button>
          ))}
        </div>

        {works.length === 0 && (
          <div className={styles.emptyState}>
            <i className="fas fa-inbox"></i>
            <p>선택 가능한 근무 형태가 없습니다.</p>
          </div>
        )}
      </div>

      <div className={styles.modalFooter}>
        <div className={styles.selectedCount}>
          <i className="fas fa-check-circle me-2"></i>
          선택된 근무 형태: <strong>{selected.length}개</strong>
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

