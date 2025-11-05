import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { api } from '@/lib/axios';
import { useAlertStore } from '@/store/alertStore';
import { PersonalScheduleCreateRequest } from '../../../../types/calendar';
import styles from './ScheduleModal.module.css';

const ScheduleModal = ({ show, selectedDate, onClose, onSuccess }) => {
  const alertStore = useAlertStore();

  // State 관리
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  // 선택된 날짜가 변경되면 폼 초기화
  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd'T'HH:mm");
      setForm({
        title: '',
        startDate: dateStr,
        endDate: dateStr,
        description: ''
      });
    }
  }, [selectedDate]);

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (show) {
      resetForm();
    }
  }, [show]);

  // 폼 초기화
  const resetForm = () => {
    const dateStr = selectedDate 
      ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") 
      : '';
    
    setForm({
      title: '',
      startDate: dateStr,
      endDate: dateStr,
      description: ''
    });
  };

  // 입력 핸들러
  const handleInputChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // 모달 닫기
  const closeModal = () => {
    if (onClose) {
      onClose();
    }
  };

  // 일정 제출
  const submitSchedule = async () => {
    // 유효성 검사
    if (!form.title.trim()) {
      alertStore.show('일정 제목을 입력해주세요.', 'danger');
      return;
    }

    if (!form.startDate) {
      alertStore.show('시작일시를 선택해주세요.', 'danger');
      return;
    }

    // 종료일이 시작일보다 이전인지 검증
    if (form.endDate) {
      const startDate = new Date(form.startDate);
      const endDate = new Date(form.endDate);

      if (endDate < startDate) {
        alertStore.show('종료일시는 시작일시보다 이전일 수 없습니다.', 'danger');
        return;
      }
    }

    try {
      setLoading(true);

      const scheduleRequest = new PersonalScheduleCreateRequest({
        title: form.title.trim(),
        startDt: form.startDate,
        endDt: form.endDate || form.startDate,
        description: form.description.trim()
      });

      // API 호출 - 토큰이 자동으로 포함됩니다
      const response = await api.$post(
        '/calendar/evnts',
        scheduleRequest.toApiFormat()
      );

      if (response.status === 'OK') {
        alertStore.show(response.message || '일정이 성공적으로 추가되었습니다.', 'success');
        if (onSuccess) {
          onSuccess();
        }
        closeModal();
      } else {
        alertStore.show('일정 추가에 실패했습니다.', 'danger');
      }
    } catch (error) {
      console.error('일정 추가 실패:', error);
      alertStore.show(
        error?.response?.data?.message || '일정 추가 중 오류가 발생했습니다.',
        'danger'
      );
    } finally {
      setLoading(false);
    }
  };

  // 모달이 보이지 않으면 null 반환
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <i className="fas fa-calendar-plus me-2"></i>
            <h5 className={styles.modalTitle}>개인 일정 추가</h5>
          </div>
          <button type="button" className={styles.btnClose} onClick={closeModal}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* 일정 제목 */}
            <div className={styles.formGroup}>
              <label htmlFor="scheduleTitle" className={styles.formLabel}>
                <i className="fas fa-heading me-2"></i>
                일정 제목
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="scheduleTitle"
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={styles.formControl}
                placeholder="일정 제목을 입력하세요"
                required
              />
            </div>

            {/* 시작일시 */}
            <div className={styles.formGroup}>
              <label htmlFor="scheduleStartDate" className={styles.formLabel}>
                <i className="fas fa-play-circle me-2"></i>
                시작일시
                <span className={styles.required}>*</span>
              </label>
              <input
                type="datetime-local"
                id="scheduleStartDate"
                value={form.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={styles.formControl}
                required
              />
            </div>

            {/* 종료일시 */}
            <div className={styles.formGroup}>
              <label htmlFor="scheduleEndDate" className={styles.formLabel}>
                <i className="fas fa-stop-circle me-2"></i>
                종료일시
              </label>
              <input
                type="datetime-local"
                id="scheduleEndDate"
                value={form.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={styles.formControl}
              />
            </div>

            {/* 설명 */}
            <div className={styles.formGroup}>
              <label htmlFor="scheduleDescription" className={styles.formLabel}>
                <i className="fas fa-align-left me-2"></i>
                설명
              </label>
              <textarea
                id="scheduleDescription"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={styles.formControl}
                rows="4"
                placeholder="일정에 대한 설명을 입력하세요 (선택사항)"
              ></textarea>
            </div>
          </form>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={closeModal}>
            <i className="fas fa-times me-2"></i>
            취소
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={submitSchedule}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                저장 중...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                저장
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;

