import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import axios from 'axios';
import './ScheduleDetailModal.module.css';

const ScheduleDetailModal = ({ show, scheduleSq, onClose, onUpdated, onDeleted }) => {
  // State 관리
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [scheduleDetail, setScheduleDetail] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    startDt: '',
    endDt: '',
    memo: '',
    clearEndDt: false
  });

  // ==================== Effects ====================
  // scheduleSq 또는 show 변경 감지
  useEffect(() => {
    if (show && scheduleSq) {
      loadScheduleDetail();
    } else if (!show) {
      setScheduleDetail(null);
      setIsEditing(false);
    }
  }, [show, scheduleSq]);

  // ==================== API 호출 ====================
  // 일정 상세 조회
  const loadScheduleDetail = async () => {
    if (!scheduleSq) return;

    try {
      setLoading(true);
      
      // API 호출 - 실제 엔드포인트에 맞게 수정
      const response = await axios.get(`/api/calendar/schedule/${scheduleSq}`);

      console.log('=== 일정 상세 조회 응답 ===', response.data);

      if (response.data.success || response.data.status === 'OK') {
        setScheduleDetail(response.data.data || response.data.output);
      } else {
        alert('일정 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('일정 상세 조회 실패:', error);
      alert('일정 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== 이벤트 핸들러 ====================
  // 모달 닫기
  const closeModal = () => {
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setEditForm({
      title: '',
      startDt: '',
      endDt: '',
      memo: '',
      clearEndDt: false
    });
    if (onClose) {
      onClose();
    }
  };

  // 수정 모드 시작
  const startEdit = () => {
    if (scheduleDetail?.personalDetail) {
      const detail = scheduleDetail.personalDetail;
      setEditForm({
        title: detail.title || '',
        startDt: detail.startDt || '',
        endDt: detail.endDt || '',
        memo: detail.memo || '',
        clearEndDt: !detail.endDt
      });
      setIsEditing(true);
    }
  };

  // 수정 취소
  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      title: '',
      startDt: '',
      endDt: '',
      memo: '',
      clearEndDt: false
    });
  };

  // 수정 저장
  const saveEdit = async () => {
    if (!scheduleSq) return;

    // 유효성 검사
    if (!editForm.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!editForm.startDt) {
      alert('시작일시를 선택해주세요.');
      return;
    }

    // 종료일이 시작일보다 이전인지 검증
    if (editForm.endDt && !editForm.clearEndDt) {
      const startDate = new Date(editForm.startDt);
      const endDate = new Date(editForm.endDt);

      if (endDate < startDate) {
        alert('종료일시는 시작일시보다 이전일 수 없습니다.');
        return;
      }
    }

    try {
      setSaving(true);

      const updateData = {
        title: editForm.title.trim(),
        startDt: editForm.startDt,
        memo: editForm.memo.trim() || null,
        clearEndDt: editForm.clearEndDt
      };

      // 종료일 처리
      if (editForm.clearEndDt) {
        updateData.clearEndDt = true;
      } else if (editForm.endDt) {
        updateData.endDt = editForm.endDt;
      }

      // API 호출 - 실제 엔드포인트에 맞게 수정
      const response = await axios.put(
        `/api/calendar/schedule/${scheduleSq}`,
        updateData
      );

      if (response.data.success || response.data.status === 'OK') {
        alert('일정이 수정되었습니다.');
        setIsEditing(false);
        // 수정된 데이터로 다시 로드
        await loadScheduleDetail();
        if (onUpdated) {
          onUpdated();
        }
      } else {
        alert('일정 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('일정 수정 실패:', error);
      alert('일정 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 삭제 확인 다이얼로그 표시
  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  // 삭제 취소
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // 일정 삭제
  const deleteSchedule = async () => {
    if (!scheduleSq) return;

    try {
      setDeleting(true);
      
      // API 호출 - 실제 엔드포인트에 맞게 수정
      const response = await axios.delete(`/api/calendar/schedule/${scheduleSq}`);

      if (response.data.success || response.data.status === 'OK') {
        alert('일정이 삭제되었습니다.');
        setShowDeleteConfirm(false);
        if (onDeleted) {
          onDeleted();
        }
        closeModal();
      } else {
        alert('일정 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      alert('일정 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  // 프로젝트 상세 페이지로 이동
  const goToProject = () => {
    // 프로젝트 일정인 경우
    if (scheduleDetail?.projectDetail?.routePath) {
      window.location.href = scheduleDetail.projectDetail.routePath;
    }
    // 인터뷰 일정인 경우
    else if (scheduleDetail?.interviewDetail?.projectSq) {
      window.location.href = `/project/spec/user/${scheduleDetail.interviewDetail.projectSq}`;
    }
  };

  // ==================== 유틸리티 함수 ====================
  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
    } catch (error) {
      return dateString;
    }
  };

  // 날짜+시간 포맷팅
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    } catch (error) {
      return dateString;
    }
  };

  // 프로젝트 상태 확인
  const getProjectStatus = (projectDetail) => {
    const today = new Date();
    const startDate = new Date(projectDetail.recruitStartDt);
    const endDate = new Date(projectDetail.recruitEndDt);

    if (today < startDate) {
      return '모집 예정';
    } else if (today > endDate) {
      return '모집 마감';
    } else {
      return '모집 중';
    }
  };

  const getProjectStatusClass = (projectDetail) => {
    const status = getProjectStatus(projectDetail);
    switch (status) {
      case '모집 예정':
        return 'status-upcoming';
      case '모집 중':
        return 'status-active';
      case '모집 마감':
        return 'status-ended';
      default:
        return '';
    }
  };

  // 폼 입력 핸들러
  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // 모달이 보이지 않으면 null 반환
  if (!show) return null;

  return (
    <>
      {/* 메인 모달 */}
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>일정 상세</h3>
            <button className="close-btn" onClick={closeModal}>
              <i className="bi bi-x"></i>
            </button>
          </div>

          <div className="modal-body">
            {/* 로딩 */}
            {loading && (
              <div className="loading">
                <i className="bi bi-arrow-clockwise"></i>
                <span>로딩 중...</span>
              </div>
            )}

            {/* 일정 상세 */}
            {!loading && scheduleDetail && (
              <div className="schedule-detail">
                {/* 개인 일정 상세 */}
                {scheduleDetail.sourceType === 'PERSONAL' && scheduleDetail.personalDetail && (
                  <div className="personal-detail">
                    <div className="detail-item">
                      <label>제목</label>
                      {!isEditing ? (
                        <div className="value">{scheduleDetail.personalDetail.title}</div>
                      ) : (
                        <input
                          value={editForm.title}
                          onChange={(e) => handleEditFormChange('title', e.target.value)}
                          type="text"
                          className="form-input"
                          placeholder="제목을 입력하세요"
                        />
                      )}
                    </div>

                    <div className="detail-item">
                      <label>시작일시</label>
                      {!isEditing ? (
                        <div className="value">
                          {formatDateTime(scheduleDetail.personalDetail.startDt)}
                        </div>
                      ) : (
                        <input
                          value={editForm.startDt}
                          onChange={(e) => handleEditFormChange('startDt', e.target.value)}
                          type="datetime-local"
                          className="form-input"
                        />
                      )}
                    </div>

                    <div className="detail-item">
                      <label>종료일시</label>
                      {!isEditing ? (
                        <div className="value">
                          {scheduleDetail.personalDetail.endDt
                            ? formatDateTime(scheduleDetail.personalDetail.endDt)
                            : '종료일시 없음'}
                        </div>
                      ) : (
                        <div className="end-date-container">
                          <input
                            value={editForm.endDt}
                            onChange={(e) => handleEditFormChange('endDt', e.target.value)}
                            type="datetime-local"
                            className="form-input"
                            disabled={editForm.clearEndDt}
                          />
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={editForm.clearEndDt}
                              onChange={(e) =>
                                handleEditFormChange('clearEndDt', e.target.checked)
                              }
                            />
                            종료일시 없음
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="detail-item">
                      <label>메모</label>
                      {!isEditing ? (
                        <div className="value memo">
                          {scheduleDetail.personalDetail.memo || '메모 없음'}
                        </div>
                      ) : (
                        <textarea
                          value={editForm.memo}
                          onChange={(e) => handleEditFormChange('memo', e.target.value)}
                          className="form-textarea"
                          placeholder="메모를 입력하세요"
                          rows="3"
                        ></textarea>
                      )}
                    </div>
                  </div>
                )}

                {/* 프로젝트 일정 상세 */}
                {scheduleDetail.sourceType === 'PROJECT' && scheduleDetail.projectDetail && (
                  <div className="project-detail">
                    <div className="detail-item">
                      <label>프로젝트명</label>
                      <div className="value">{scheduleDetail.projectDetail.projectTtl}</div>
                    </div>

                    <div className="detail-item">
                      <label>모집 시작일</label>
                      <div className="value">
                        {formatDate(scheduleDetail.projectDetail.recruitStartDt)}
                      </div>
                    </div>

                    <div className="detail-item">
                      <label>모집 마감일</label>
                      <div className="value">
                        {formatDate(scheduleDetail.projectDetail.recruitEndDt)}
                      </div>
                    </div>

                    <div className="detail-item">
                      <label>상태</label>
                      <div className="value">
                        <span
                          className={`status-badge ${getProjectStatusClass(
                            scheduleDetail.projectDetail
                          )}`}
                        >
                          {getProjectStatus(scheduleDetail.projectDetail)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 인터뷰 일정 상세 */}
                {scheduleDetail.interviewDetail && (
                  <div className="interview-detail">
                    <div className="detail-item">
                      <label>제목</label>
                      <div className="value">{scheduleDetail.interviewDetail.title}</div>
                    </div>

                    <div className="detail-item">
                      <label>시작 시간</label>
                      <div className="value">
                        {formatDateTime(scheduleDetail.interviewDetail.startDt)}
                      </div>
                    </div>

                    <div className="detail-item">
                      <label>마감 시간</label>
                      <div className="value">
                        {formatDateTime(scheduleDetail.interviewDetail.endDt)}
                      </div>
                    </div>

                    {scheduleDetail.interviewDetail.memo && (
                      <div className="detail-item">
                        <label>메모</label>
                        <div className="value memo">
                          {scheduleDetail.interviewDetail.memo}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 에러 */}
            {!loading && !scheduleDetail && (
              <div className="error">
                <i className="bi bi-exclamation-triangle"></i>
                <span>일정 정보를 불러올 수 없습니다.</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            {/* 개인일정 수정 모드 버튼들 */}
            {scheduleDetail?.sourceType === 'PERSONAL' && (
              <>
                {!isEditing ? (
                  <>
                    <button className="btn btn-warning" onClick={startEdit}>
                      수정
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={confirmDelete}
                      disabled={deleting}
                    >
                      {deleting ? '삭제 중...' : '삭제'}
                    </button>
                    <button className="btn btn-secondary" onClick={closeModal}>
                      닫기
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={saveEdit}
                      disabled={saving}
                    >
                      {saving ? '저장 중...' : '저장'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      취소
                    </button>
                  </>
                )}
              </>
            )}

            {/* 프로젝트일정 버튼들 */}
            {scheduleDetail?.sourceType === 'PROJECT' && (
              <>
                <button className="btn btn-primary" onClick={goToProject}>
                  프로젝트 상세보기
                </button>
                <button className="btn btn-secondary" onClick={closeModal}>
                  닫기
                </button>
              </>
            )}

            {/* 인터뷰일정 버튼들 */}
            {scheduleDetail?.interviewDetail && (
              <>
                {scheduleDetail.interviewDetail?.projectSq && (
                  <button className="btn btn-primary" onClick={goToProject}>
                    프로젝트 상세보기
                  </button>
                )}
                <button className="btn btn-secondary" onClick={closeModal}>
                  닫기
                </button>
              </>
            )}

            {/* 기본 닫기 버튼 */}
            {!scheduleDetail?.sourceType &&
              !scheduleDetail?.interviewDetail && (
                <button className="btn btn-secondary" onClick={closeModal}>
                  닫기
                </button>
              )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div
            className="modal-content delete-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>일정 삭제</h3>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <i className="bi bi-exclamation-triangle"></i>
                <p>정말로 이 일정을 삭제하시겠습니까?</p>
                <p className="warning-text">삭제된 일정은 복구할 수 없습니다.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-danger"
                onClick={deleteSchedule}
                disabled={deleting}
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={cancelDelete}
                disabled={deleting}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleDetailModal;

