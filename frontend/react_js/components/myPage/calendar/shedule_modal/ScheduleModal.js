import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { PersonalScheduleCreateRequest } from '../../../../types/calendar';
import './ScheduleModal.module.css';

const ScheduleModal = ({ show, selectedDate, onClose, onSuccess }) => {
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
      alert('일정 제목을 입력해주세요.');
      return;
    }

    if (!form.startDate) {
      alert('시작일시를 선택해주세요.');
      return;
    }

    // 종료일이 시작일보다 이전인지 검증
    if (form.endDate) {
      const startDate = new Date(form.startDate);
      const endDate = new Date(form.endDate);

      if (endDate < startDate) {
        alert('종료일시는 시작일시보다 이전일 수 없습니다.');
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

      // API 호출 - 실제 엔드포인트에 맞게 수정
      const response = await axios.post(
        '/api/calendar/personal',
        scheduleRequest.toApiFormat()
      );

      if (response.data.success || response.data.status === 'OK') {
        alert('일정이 성공적으로 추가되었습니다.');
        if (onSuccess) {
          onSuccess();
        }
        closeModal();
      } else {
        alert('일정 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('일정 추가 실패:', error);
      alert('일정 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 모달이 보이지 않으면 null 반환
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5 className="modal-title">개인 일정 추가</h5>
          <button type="button" className="btn-close" onClick={closeModal}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
              <label htmlFor="scheduleTitle" className="form-label">
                일정 제목 *
              </label>
              <input
                type="text"
                id="scheduleTitle"
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="form-control"
                placeholder="일정 제목을 입력하세요"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="scheduleStartDate" className="form-label">
                시작일시 *
              </label>
              <input
                type="datetime-local"
                id="scheduleStartDate"
                value={form.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="scheduleEndDate" className="form-label">
                종료일시
              </label>
              <input
                type="datetime-local"
                id="scheduleEndDate"
                value={form.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="scheduleDescription" className="form-label">
                설명
              </label>
              <textarea
                id="scheduleDescription"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="form-control"
                rows="3"
                placeholder="일정에 대한 설명을 입력하세요"
              ></textarea>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={closeModal}>
            취소
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={submitSchedule}
            disabled={loading}
          >
            {loading && (
              <span className="spinner-border spinner-border-sm me-2"></span>
            )}
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;

