<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>일정 상세</h3>
        <button class="close-btn" @click="closeModal">
          <i class="bi bi-x"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div v-if="loading" class="loading">
          <i class="bi bi-arrow-clockwise"></i>
          <span>로딩 중...</span>
        </div>
        
        <div v-else-if="scheduleDetail" class="schedule-detail">
          <!-- 개인 일정 상세 -->
          <div v-if="scheduleDetail.sourceType === 'PERSONAL' && scheduleDetail.personalDetail" class="personal-detail">
            <div class="detail-item">
              <label>제목</label>
              <div v-if="!isEditing" class="value">{{ scheduleDetail.personalDetail.title }}</div>
              <input v-else v-model="editForm.title" type="text" class="form-input" placeholder="제목을 입력하세요">
            </div>
            
            <div class="detail-item">
              <label>시작일</label>
              <div v-if="!isEditing" class="value">{{ formatDate(scheduleDetail.personalDetail.startDt) }}</div>
              <input v-else v-model="editForm.startDt" type="date" class="form-input">
            </div>
            
            <div class="detail-item">
              <label>종료일</label>
              <div v-if="!isEditing" class="value">{{ scheduleDetail.personalDetail.endDt ? formatDate(scheduleDetail.personalDetail.endDt) : '종료일 없음' }}</div>
              <div v-else class="end-date-container">
                <input v-model="editForm.endDt" type="date" class="form-input">
                <label class="checkbox-label">
                  <input v-model="editForm.clearEndDt" type="checkbox">
                  종료일 없음
                </label>
              </div>
            </div>
            
            <div class="detail-item">
              <label>메모</label>
              <div v-if="!isEditing" class="value memo">{{ scheduleDetail.personalDetail.memo || '메모 없음' }}</div>
              <textarea v-else v-model="editForm.memo" class="form-textarea" placeholder="메모를 입력하세요" rows="3"></textarea>
            </div>
          </div>
          
          <!-- 프로젝트 일정 상세 -->
          <div v-else-if="scheduleDetail.sourceType === 'PROJECT' && scheduleDetail.projectDetail" class="project-detail">
            <div class="detail-item">
              <label>프로젝트명</label>
              <div class="value">{{ scheduleDetail.projectDetail.projectTtl }}</div>
            </div>
            
            <div class="detail-item">
              <label>모집 시작일</label>
              <div class="value">{{ formatDate(scheduleDetail.projectDetail.recruitStartDt) }}</div>
            </div>
            
            <div class="detail-item">
              <label>모집 마감일</label>
              <div class="value">{{ formatDate(scheduleDetail.projectDetail.recruitEndDt) }}</div>
            </div>
            
            <div class="detail-item">
              <label>상태</label>
              <div class="value">
                <span class="status-badge" :class="getProjectStatusClass(scheduleDetail.projectDetail)">
                  {{ getProjectStatus(scheduleDetail.projectDetail) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="error">
          <i class="bi bi-exclamation-triangle"></i>
          <span>일정 정보를 불러올 수 없습니다.</span>
        </div>
      </div>
      
      <div class="modal-footer">
        <!-- 개인일정 수정 모드 버튼들 -->
        <template v-if="scheduleDetail?.sourceType === 'PERSONAL'">
          <template v-if="!isEditing">
            <button class="btn btn-warning" @click="startEdit">
              수정
            </button>
            <button class="btn btn-danger" @click="confirmDelete" :disabled="deleting">
              {{ deleting ? '삭제 중...' : '삭제' }}
            </button>
            <button class="btn btn-secondary" @click="closeModal">
              닫기
            </button>
          </template>
          <template v-else>
            <button class="btn btn-primary" @click="saveEdit" :disabled="saving">
              {{ saving ? '저장 중...' : '저장' }}
            </button>
            <button class="btn btn-secondary" @click="cancelEdit" :disabled="saving">
              취소
            </button>
          </template>
        </template>
        
        <!-- 프로젝트일정 버튼들 -->
        <template v-else-if="scheduleDetail?.sourceType === 'PROJECT'">
          <button class="btn btn-primary" @click="goToProject">
            프로젝트 상세보기
          </button>
          <button class="btn btn-secondary" @click="closeModal">
            닫기
          </button>
        </template>
        
        <!-- 기본 닫기 버튼 -->
        <template v-else>
          <button class="btn btn-secondary" @click="closeModal">
            닫기
          </button>
        </template>
      </div>
    </div>

    <!-- 삭제 확인 다이얼로그 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content delete-confirm-modal" @click.stop>
        <div class="modal-header">
          <h3>일정 삭제</h3>
        </div>
        
        <div class="modal-body">
          <div class="delete-warning">
            <i class="bi bi-exclamation-triangle"></i>
            <p>정말로 이 일정을 삭제하시겠습니까?</p>
            <p class="warning-text">삭제된 일정은 복구할 수 없습니다.</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-danger" @click="deleteSchedule" :disabled="deleting">
            {{ deleting ? '삭제 중...' : '삭제' }}
          </button>
          <button class="btn btn-secondary" @click="cancelDelete" :disabled="deleting">
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import calendarService from '@/fo/services/calendarService'
import { useAlertStore } from '@/fo/stores/alertStore'

export default {
  name: 'ScheduleDetailModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    scheduleSq: {
      type: Number,
      default: null
    }
  },
  emits: ['close', 'updated', 'deleted'],
  setup(props, { emit }) {
    const alertStore = useAlertStore()
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const scheduleDetail = ref(null)
    const isEditing = ref(false)
    const showDeleteConfirm = ref(false)
    const editForm = ref({
      title: '',
      startDt: '',
      endDt: '',
      memo: '',
      clearEndDt: false
    })
    
    // 일정 상세 조회
    const loadScheduleDetail = async () => {
      if (!props.scheduleSq) return
      
      try {
        loading.value = true
        const { success, data } = await calendarService.getScheduleDetail(props.scheduleSq)
        
        if (success && data) {
          scheduleDetail.value = data
        } else {
          alertStore.show('일정 정보를 불러오는데 실패했습니다.', 'danger')
        }
      } catch (error) {
        console.error('일정 상세 조회 실패:', error)
        alertStore.show('일정 정보를 불러오는데 실패했습니다.', 'danger')
      } finally {
        loading.value = false
      }
    }
    
    // 모달 닫기
    const closeModal = () => {
      isEditing.value = false
      showDeleteConfirm.value = false
      editForm.value = {
        title: '',
        startDt: '',
        endDt: '',
        memo: '',
        clearEndDt: false
      }
      emit('close')
    }
    
    // 수정 모드 시작
    const startEdit = () => {
      if (scheduleDetail.value?.personalDetail) {
        const detail = scheduleDetail.value.personalDetail
        editForm.value = {
          title: detail.title || '',
          startDt: detail.startDt || '',
          endDt: detail.endDt || '',
          memo: detail.memo || '',
          clearEndDt: !detail.endDt
        }
        isEditing.value = true
      }
    }
    
    // 수정 취소
    const cancelEdit = () => {
      isEditing.value = false
      editForm.value = {
        title: '',
        startDt: '',
        endDt: '',
        memo: '',
        clearEndDt: false
      }
    }
    
    // 수정 저장
    const saveEdit = async () => {
      if (!props.scheduleSq) return
      
      // 유효성 검사
      if (!editForm.value.title.trim()) {
        alertStore.show('제목을 입력해주세요.', 'warning')
        return
      }
      
      if (!editForm.value.startDt) {
        alertStore.show('시작일을 선택해주세요.', 'warning')
        return
      }
      
      try {
        saving.value = true
        
        const updateData = {
          title: editForm.value.title.trim(),
          startDt: editForm.value.startDt,
          memo: editForm.value.memo.trim() || null,
          clearEndDt: editForm.value.clearEndDt
        }
        
        // 종료일 처리
        if (editForm.value.clearEndDt) {
          updateData.clearEndDt = true
        } else if (editForm.value.endDt) {
          updateData.endDt = editForm.value.endDt
        }
        
        const { success } = await calendarService.updateSchedule(props.scheduleSq, updateData)
        
        if (success) {
          alertStore.show('일정이 수정되었습니다.', 'success')
          isEditing.value = false
          // 수정된 데이터로 다시 로드
          await loadScheduleDetail()
          emit('updated')
        } else {
          alertStore.show('일정 수정에 실패했습니다.', 'danger')
        }
      } catch (error) {
        console.error('일정 수정 실패:', error)
        alertStore.show('일정 수정에 실패했습니다.', 'danger')
      } finally {
        saving.value = false
      }
    }
    
    // 삭제 확인 다이얼로그 표시
    const confirmDelete = () => {
      showDeleteConfirm.value = true
    }
    
    // 삭제 취소
    const cancelDelete = () => {
      showDeleteConfirm.value = false
    }
    
    // 일정 삭제
    const deleteSchedule = async () => {
      if (!props.scheduleSq) return
      
      try {
        deleting.value = true
        const { success } = await calendarService.deleteSchedule(props.scheduleSq)
        
        if (success) {
          alertStore.show('일정이 삭제되었습니다.', 'success')
          showDeleteConfirm.value = false
          emit('deleted')
          closeModal()
        } else {
          alertStore.show('일정 삭제에 실패했습니다.', 'danger')
        }
      } catch (error) {
        console.error('일정 삭제 실패:', error)
        alertStore.show('일정 삭제에 실패했습니다.', 'danger')
      } finally {
        deleting.value = false
      }
    }
    
    // 프로젝트 상세 페이지로 이동
    const goToProject = () => {
      if (scheduleDetail.value?.projectDetail?.routePath) {
        window.location.href = scheduleDetail.value.projectDetail.routePath
      }
    }
    
    // 날짜 포맷팅
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko })
      } catch (error) {
        return dateString
      }
    }
    
    // 프로젝트 상태 확인
    const getProjectStatus = (projectDetail) => {
      const today = new Date()
      const startDate = new Date(projectDetail.recruitStartDt)
      const endDate = new Date(projectDetail.recruitEndDt)
      
      if (today < startDate) {
        return '모집 예정'
      } else if (today > endDate) {
        return '모집 마감'
      } else {
        return '모집 중'
      }
    }
    
    const getProjectStatusClass = (projectDetail) => {
      const status = getProjectStatus(projectDetail)
      switch (status) {
        case '모집 예정':
          return 'status-upcoming'
        case '모집 중':
          return 'status-active'
        case '모집 마감':
          return 'status-ended'
        default:
          return ''
      }
    }
    
    // scheduleSq 변경 감지
    watch(() => props.scheduleSq, (newScheduleSq) => {
      if (newScheduleSq && props.show) {
        loadScheduleDetail()
      }
    })
    
    // 모달 표시 감지
    watch(() => props.show, (newShow) => {
      if (newShow && props.scheduleSq) {
        loadScheduleDetail()
      } else if (!newShow) {
        scheduleDetail.value = null
      }
    })
    
    return {
      loading,
      saving,
      deleting,
      scheduleDetail,
      isEditing,
      showDeleteConfirm,
      editForm,
      closeModal,
      startEdit,
      cancelEdit,
      saveEdit,
      confirmDelete,
      cancelDelete,
      deleteSchedule,
      goToProject,
      formatDate,
      getProjectStatus,
      getProjectStatusClass
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.loading i {
  font-size: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #dc3545;
}

.error i {
  font-size: 2rem;
}

.schedule-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item label {
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
}

.detail-item .value {
  color: #6c757d;
  font-size: 1rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  border: 1px solid #dee2e6;
}

.detail-item .value.memo {
  min-height: 3rem;
  white-space: pre-wrap;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.status-upcoming {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-badge.status-active {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.status-badge.status-ended {
  background-color: #ffebee;
  color: #c62828;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background-color: #e0a800;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 삭제 확인 다이얼로그 */
.delete-confirm-modal {
  max-width: 400px;
}

.delete-warning {
  text-align: center;
  padding: 1rem;
}

.delete-warning i {
  font-size: 3rem;
  color: #ffc107;
  margin-bottom: 1rem;
}

.delete-warning p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.warning-text {
  color: #6c757d;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.end-date-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
}
</style>
