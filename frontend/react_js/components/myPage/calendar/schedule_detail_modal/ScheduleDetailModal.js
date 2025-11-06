import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { api } from '@/lib/axios';
import { useAlertStore } from '@/store/alertStore';
import styles from './ScheduleDetailModal.module.css';

const ScheduleDetailModal = ({ show, scheduleSq, onClose, onUpdated, onDeleted }) => {
  const alertStore = useAlertStore();

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
      
      // API 호출 - 토큰이 자동으로 포함됩니다
      const response = await api.$get(`/calendar/evnts/detail/${scheduleSq}`);

      console.log('=== 일정 상세 조회 응답 ===', response);

      if (response.status === 'OK') {
        setScheduleDetail(response.output);
      } else {
        alertStore.show('일정 정보를 불러오는데 실패했습니다.', 'danger');
      }
    } catch (error) {
      console.error('일정 상세 조회 실패:', error);
      alertStore.show(
        error?.response?.data?.message || '일정 정보를 불러오는데 실패했습니다.',
        'danger'
      );
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
      alertStore.show('제목을 입력해주세요.', 'danger');
      return;
    }

    if (!editForm.startDt) {
      alertStore.show('시작일시를 선택해주세요.', 'danger');
      return;
    }

    // 종료일이 시작일보다 이전인지 검증
    if (editForm.endDt && !editForm.clearEndDt) {
      const startDate = new Date(editForm.startDt);
      const endDate = new Date(editForm.endDt);

      if (endDate < startDate) {
        alertStore.show('종료일시는 시작일시보다 이전일 수 없습니다.', 'danger');
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

      // API 호출 - 토큰이 자동으로 포함됩니다
      const response = await api.$patch(
        `/calendar/evnts/${scheduleSq}`,
        updateData
      );

      if (response.status === 'OK') {
        alertStore.show(response.message || '일정이 수정되었습니다.', 'success');
        setIsEditing(false);
        // 수정된 데이터로 다시 로드
        await loadScheduleDetail();
        if (onUpdated) {
          onUpdated();
        }
      } else {
        alertStore.show('일정 수정에 실패했습니다.', 'danger');
      }
    } catch (error) {
      console.error('일정 수정 실패:', error);
      alertStore.show(
        error?.response?.data?.message || '일정 수정에 실패했습니다.',
        'danger'
      );
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
      
      // API 호출 - 토큰이 자동으로 포함됩니다
      const response = await api.$delete(`/calendar/evnts/${scheduleSq}`);

      if (response.status === 'OK') {
        alertStore.show(response.message || '일정이 삭제되었습니다.', 'success');
        setShowDeleteConfirm(false);
        if (onDeleted) {
          onDeleted();
        }
        closeModal();
      } else {
        alertStore.show('일정 삭제에 실패했습니다.', 'danger');
      }
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      alertStore.show(
        error?.response?.data?.message || '일정 삭제에 실패했습니다.',
        'danger'
      );
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
        return 'statusUpcoming';
      case '모집 중':
        return 'statusActive';
      case '모집 마감':
        return 'statusEnded';
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
      <div className={styles.modalOverlay} onClick={closeModal}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <div className={styles.headerContent}>
              <i className="fas fa-calendar-day me-2"></i>
              <h3 className={styles.modalTitle}>일정 상세</h3>
            </div>
            <button className={styles.btnClose} onClick={closeModal}>
              ×
            </button>
          </div>

          <div className={styles.modalBody}>
            {/* 로딩 */}
            {loading && (
              <div className={styles.loading}>
                <span className={styles.spinner}></span>
                <span>로딩 중...</span>
              </div>
            )}

            {/* 일정 상세 */}
            {!loading && scheduleDetail && (
              <div className={styles.scheduleDetail}>
                {/* 개인 일정 상세 */}
                {scheduleDetail.sourceType === 'PERSONAL' && scheduleDetail.personalDetail && (
                  <div className={styles.personalDetail}>
                    <div className={styles.detailItem}>
                      <label className={styles.detailLabel}>
                        <i className="fas fa-heading me-2"></i>
                        제목
                      </label>
                      {!isEditing ? (
                        <div className={styles.detailValue}>{scheduleDetail.personalDetail.title}</div>
                      ) : (
                        <input
                          value={editForm.title}
                          onChange={(e) => handleEditFormChange('title', e.target.value)}
                          type="text"
                          className={styles.formInput}
                          placeholder="제목을 입력하세요"
                        />
                      )}
                    </div>

                    <div className={styles.detailItem}>
                      <label className={styles.detailLabel}>
                        <i className="fas fa-play-circle me-2"></i>
                        시작일시
                      </label>
                      {!isEditing ? (
                        <div className={styles.detailValue}>
                          {formatDateTime(scheduleDetail.personalDetail.startDt)}
                        </div>
                      ) : (
                        <input
                          value={editForm.startDt}
                          onChange={(e) => handleEditFormChange('startDt', e.target.value)}
                          type="datetime-local"
                          className={styles.formInput}
                        />
                      )}
                    </div>

                    <div className={styles.detailItem}>
                      <label className={styles.detailLabel}>
                        <i className="fas fa-stop-circle me-2"></i>
                        종료일시
                      </label>
                      {!isEditing ? (
                        <div className={styles.detailValue}>
                          {scheduleDetail.personalDetail.endDt
                            ? formatDateTime(scheduleDetail.personalDetail.endDt)
                            : '종료일시 없음'}
                        </div>
                      ) : (
                        <div className={styles.endDateContainer}>
                          <input
                            value={editForm.endDt}
                            onChange={(e) => handleEditFormChange('endDt', e.target.value)}
                            type="datetime-local"
                            className={styles.formInput}
                            disabled={editForm.clearEndDt}
                          />
                          <label className={styles.checkboxLabel}>
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

                    <div className={styles.detailItem}>
                      <label className={styles.detailLabel}>
                        <i className="fas fa-sticky-note me-2"></i>
                        메모
                      </label>
                      {!isEditing ? (
                        <div className={`${styles.detailValue} ${styles.memo}`}>
                          {scheduleDetail.personalDetail.memo || '메모 없음'}
                        </div>
                      ) : (
                        <textarea
                          value={editForm.memo}
                          onChange={(e) => handleEditFormChange('memo', e.target.value)}
                          className={styles.formTextarea}
                          placeholder="메모를 입력하세요"
                          rows="4"
                        ></textarea>
                      )}
                    </div>
                  </div>
                )}

                {/* 프로젝트 일정 상세 */}
                {scheduleDetail.sourceType === 'PROJECT' && scheduleDetail.projectDetail && (
                  <div className={styles.projectDetail}>
                    <div className={styles.detailItem}>
                      <label className={styles.detailLabel}>
                        <i className="fas fa-project-diagram me-2"></i>
                        프로젝트명
                      </label>
                      <div className={styles.detailValue}>{scheduleDetail.projectDetail.projectTtl}</div>
                    </div>

                    <div className={styles.detailItem}>
                      <label className={styles.detailLabel}>
                        <i className="fas fa-calendar-check me-2"></i>
                        모집 시작일
                      </label>
                      <div className={styles.detailValue}>
                        {formatDate(scheduleDetail.projectDetail.recruitStartDt)}
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <label className={styles.detailLabel}>
                        <i className="fas fa-calendar-times me-2"></i>
                        모집 마감일
                      </label>
                      <div className={styles.detailValue}>
                        {formatDate(scheduleDetail.projectDetail.recruitEndDt)}
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <label className={styles.detailLabel}>
                        <i className="fas fa-info-circle me-2"></i>
                        상태
                      </label>
                      <div className={styles.detailValue}>
                        <span className={styles[getProjectStatusClass(scheduleDetail.projectDetail)]}>
                          {getProjectStatus(scheduleDetail.projectDetail)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 인터뷰 일정 상세 */}
                {scheduleDetail.interviewDetail && (
                  <div className={styles.interviewDetail}>
                    <div className={styles.detailItem}>
                      <label className={styles.detailLabel}>
                        <i className="fas fa-heading me-2"></i>
                        제목
                      </label>
                      <div className={styles.detailValue}>{scheduleDetail.interviewDetail.title}</div>
                    </div>

                    <div className={styles.detailItem}>
                      <label className={styles.detailLabel}>
                        <i className="fas fa-play-circle me-2"></i>
                        시작 시간
                      </label>
                      <div className={styles.detailValue}>
                        {formatDateTime(scheduleDetail.interviewDetail.startDt)}
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <label className={styles.detailLabel}>
                        <i className="fas fa-stop-circle me-2"></i>
                        마감 시간
                      </label>
                      <div className={styles.detailValue}>
                        {formatDateTime(scheduleDetail.interviewDetail.endDt)}
                      </div>
                    </div>

                    {scheduleDetail.interviewDetail.memo && (
                      <div className={styles.detailItem}>
                        <label className={styles.detailLabel}>
                          <i className="fas fa-sticky-note me-2"></i>
                          메모
                        </label>
                        <div className={`${styles.detailValue} ${styles.memo}`}>
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
              <div className={styles.error}>
                <i className="fas fa-exclamation-triangle"></i>
                <span>일정 정보를 불러올 수 없습니다.</span>
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            {/* 개인일정 수정 모드 버튼들 */}
            {scheduleDetail?.sourceType === 'PERSONAL' && (
              <>
                {!isEditing ? (
                  <>
                    <button className={styles.btnEdit} onClick={startEdit}>
                      <i className="fas fa-edit me-2"></i>
                      수정
                    </button>
                    <button
                      className={styles.btnDanger}
                      onClick={confirmDelete}
                      disabled={deleting}
                    >
                      <i className="fas fa-trash me-2"></i>
                      {deleting ? '삭제 중...' : '삭제'}
                    </button>
                    <button className={styles.btnSecondary} onClick={closeModal}>
                      <i className="fas fa-times me-2"></i>
                      닫기
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={styles.btnPrimary}
                      onClick={saveEdit}
                      disabled={saving}
                    >
                      {saving ? (
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
                    <button
                      className={styles.btnSecondary}
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      <i className="fas fa-times me-2"></i>
                      취소
                    </button>
                  </>
                )}
              </>
            )}

            {/* 프로젝트일정 버튼들 */}
            {scheduleDetail?.sourceType === 'PROJECT' && (
              <>
                <button className={styles.btnPrimary} onClick={goToProject}>
                  <i className="fas fa-external-link-alt me-2"></i>
                  프로젝트 상세보기
                </button>
                <button className={styles.btnSecondary} onClick={closeModal}>
                  <i className="fas fa-times me-2"></i>
                  닫기
                </button>
              </>
            )}

            {/* 인터뷰일정 버튼들 */}
            {scheduleDetail?.interviewDetail && (
              <>
                {scheduleDetail.interviewDetail?.projectSq && (
                  <button className={styles.btnPrimary} onClick={goToProject}>
                    <i className="fas fa-external-link-alt me-2"></i>
                    프로젝트 상세보기
                  </button>
                )}
                <button className={styles.btnSecondary} onClick={closeModal}>
                  <i className="fas fa-times me-2"></i>
                  닫기
                </button>
              </>
            )}

            {/* 기본 닫기 버튼 */}
            {!scheduleDetail?.sourceType &&
              !scheduleDetail?.interviewDetail && (
                <button className={styles.btnSecondary} onClick={closeModal}>
                  <i className="fas fa-times me-2"></i>
                  닫기
                </button>
              )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div
            className={`${styles.modalContent} ${styles.deleteConfirmModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.headerContent}>
                <i className="fas fa-exclamation-triangle me-2"></i>
                <h3 className={styles.modalTitle}>일정 삭제</h3>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.deleteWarning}>
                <i className="fas fa-exclamation-circle"></i>
                <p>정말로 이 일정을 삭제하시겠습니까?</p>
                <p className={styles.warningText}>삭제된 일정은 복구할 수 없습니다.</p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnDanger}
                onClick={deleteSchedule}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className={styles.spinner}></span>
                    삭제 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash me-2"></i>
                    삭제
                  </>
                )}
              </button>
              <button
                className={styles.btnSecondary}
                onClick={cancelDelete}
                disabled={deleting}
              >
                <i className="fas fa-times me-2"></i>
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

