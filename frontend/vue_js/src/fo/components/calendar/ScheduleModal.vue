<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h5 class="modal-title">개인 일정 추가</h5>
        <button type="button" class="btn-close" @click="closeModal">
          <i class="bi bi-x"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="submitSchedule">
          <div class="mb-3">
            <label for="scheduleTitle" class="form-label">일정 제목 *</label>
            <input
              type="text"
              id="scheduleTitle"
              v-model="form.title"
              class="form-control"
              placeholder="일정 제목을 입력하세요"
              required
            />
          </div>
          
          <div class="mb-3">
            <label for="scheduleStartDate" class="form-label">시작일 *</label>
            <input
              type="date"
              id="scheduleStartDate"
              v-model="form.startDate"
              class="form-control"
              required
            />
          </div>
          
          <div class="mb-3">
            <label for="scheduleEndDate" class="form-label">종료일</label>
            <input
              type="date"
              id="scheduleEndDate"
              v-model="form.endDate"
              class="form-control"
            />
          </div>
          
          <div class="mb-3">
            <label for="scheduleDescription" class="form-label">설명</label>
            <textarea
              id="scheduleDescription"
              v-model="form.description"
              class="form-control"
              rows="3"
              placeholder="일정에 대한 설명을 입력하세요"
            ></textarea>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal">
          취소
        </button>
        <button 
          type="button" 
          class="btn btn-primary" 
          @click="submitSchedule"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { format } from 'date-fns'
import { useAlertStore } from '@/fo/stores/alertStore'
import calendarService from '@/fo/services/calendarService'
import { PersonalScheduleCreateRequest } from '@/fo/types/calendar'

export default {
  name: 'ScheduleModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    selectedDate: {
      type: Date,
      default: null
    }
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const alertStore = useAlertStore()
    const loading = ref(false)
    
    const form = ref({
      title: '',
      startDate: '',
      endDate: '',
      description: ''
    })

    // 선택된 날짜가 변경되면 폼 초기화
    watch(() => props.selectedDate, (newDate) => {
      if (newDate) {
        const dateStr = format(newDate, 'yyyy-MM-dd')
        form.value.startDate = dateStr
        form.value.endDate = dateStr
      }
    }, { immediate: true })

    // 모달이 열릴 때 폼 초기화
    watch(() => props.show, (show) => {
      if (show) {
        resetForm()
      }
    })

    const resetForm = () => {
      form.value = {
        title: '',
        startDate: props.selectedDate ? format(props.selectedDate, 'yyyy-MM-dd') : '',
        endDate: props.selectedDate ? format(props.selectedDate, 'yyyy-MM-dd') : '',
        description: ''
      }
    }

    const closeModal = () => {
      emit('close')
    }

    const submitSchedule = async () => {
      if (!form.value.title.trim()) {
        alertStore.show('일정 제목을 입력해주세요.', 'warning')
        return
      }

      if (!form.value.startDate) {
        alertStore.show('시작일을 선택해주세요.', 'warning')
        return
      }

      try {
        loading.value = true

        const scheduleRequest = new PersonalScheduleCreateRequest({
          title: form.value.title.trim(),
          startDt: form.value.startDate,
          endDt: form.value.endDate || form.value.startDate,
          description: form.value.description.trim()
        })

        const response = await calendarService.createPersonalSchedule(scheduleRequest.toApiFormat())

        if (response.success) {
          alertStore.show('일정이 성공적으로 추가되었습니다.', 'success')
          emit('success')
          closeModal()
        } else {
          alertStore.show('일정 추가에 실패했습니다.', 'danger')
        }
      } catch (error) {
        console.error('일정 추가 실패:', error)
        alertStore.show('일정 추가 중 오류가 발생했습니다.', 'danger')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      closeModal,
      submitSchedule,
      resetForm
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  justify-content: flex-end;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-control {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* 반응형 디자인 */
@media (max-width: 576px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
