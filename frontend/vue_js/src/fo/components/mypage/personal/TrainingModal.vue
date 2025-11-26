<template>
  <div class="modal-layer">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">교육 이력 추가하기</h4>
        <button class="close-btn" @click="modalStore.closeModal()">×</button>
      </div>

      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label class="modal-label">교육명</label>
            <input
              v-model="form.trainingProgramNm"
              type="text"
              class="form-control"
              placeholder="교육명"
            />
          </div>
          <div class="form-group">
            <label class="modal-label">교육 기관</label>
            <input
              v-model="form.trainingInstitutionNm"
              type="text"
              class="form-control"
              placeholder="교육 기관"
            />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group position-group">
            <label class="modal-label">교육 기간</label>
            <div style="display: flex; gap: 8px">
              <div class="datepicker-wrapper flex-grow-1">
                <Datepicker
                  :key="datepickerKey1"
                  v-model="form.trainingStartDt"
                  :locale="ko"
                  :inputFormat="inputFormat"
                  placeholder="시작년월"
                  class="form-control"
                  teleport="body"
                  dayPickerHeadingFormat="yyyy년 LLLL"
                  @update:modelValue="datepickerKey1++"
                />
                <i class="fas fa-calendar datepicker-icon"></i>
              </div>
              <span style="align-self: center">~</span>
              <div class="datepicker-wrapper flex-grow-1">
                <Datepicker
                  :key="datepickerKey2"
                  v-model="form.trainingEndDt"
                  :locale="ko"
                  :inputFormat="inputFormat"
                  placeholder="종료년월"
                  class="form-control"
                  teleport="body"
                  dayPickerHeadingFormat="yyyy년 LLLL"
                  @update:modelValue="datepickerKey2++"
                />
                <i class="fas fa-calendar datepicker-icon"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-primary" @click="submit">저장하기</button>
        <button class="btn btn-light" @click="modalStore.closeModal()">
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import Datepicker from 'vue3-datepicker'
import { ko } from 'date-fns/locale'

const props = defineProps({
  onComplete: Function, // 부모에서 내려주는 콜백함수
})
const modalStore = useModalStore()
const alertStore = useAlertStore()

const inputFormat = ref('yyyy-MM-dd')
const datepickerKey1 = ref(0)
const datepickerKey2 = ref(0)

const form = ref({
  trainingProgramNm: '',
  trainingInstitutionNm: '',
  trainingStartDt: undefined,
  trainingEndDt: undefined,
  period: '',
})

const submit = () => {
  if (!form.value.trainingProgramNm) {
    alertStore.show('교육명을 입력해주세요.', 'danger')
    return
  }
  if (!form.value.trainingInstitutionNm) {
    alertStore.show('교육 기관을 입력하세요.', 'danger')
    return
  }
  if (!form.value.trainingStartDt) {
    alertStore.show('교육 기간을 선택하세요.', 'danger')
    return
  }

  // 날짜 비교 
  if (form.value.trainingEndDt && form.value.trainingStartDt > form.value.trainingEndDt) {
    alertStore.show('종료일은 시작일보다 이후여야 합니다.', 'danger');
    return;
  }

  function formatDate(dateString) {
    // datepicker가 date객체를 반환한 경우 
    if (dateString instanceof Date) {
      const year = dateString.getFullYear()
      const month = String(dateString.getMonth() + 1).padStart(2, '0')
      const day = String(dateString.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    }

    if (typeof dateString === 'string') {
      return dateString.substring(0, 10).replace(/-/g, '.')
    }

    return ''
  }

  const toDateString = (dateString) => {
    if (!dateString) return ''
    if (dateString instanceof Date) {
      const year = dateString.getFullYear()
      const month = String(dateString.getMonth() + 1).padStart(2, '0')
      const day = String(dateString.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    return dateString
  }

  form.value.period = `${formatDate(form.value.trainingStartDt)} ~ ${formatDate(form.value.trainingEndDt)}`
  // props.onComplete({ ...form.value }) // 부모에게 데이터 전달
  props.onComplete({
    trainingProgramNm: form.value.trainingProgramNm,
    trainingInstitutionNm: form.value.trainingInstitutionNm,
    trainingStartDt: toDateString(form.value.trainingStartDt),
    trainingEndDt: toDateString(form.value.trainingEndDt),
    period: form.value.period,
  })
  modalStore.closeModal()
}
</script>

<style scoped>
.modal-layer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  position: relative;
  width: 540px;
  max-width: 95vw;
  background: #fff;
  padding: 28px 20px 16px 20px;
  overflow-x: visible;
  overflow-y: visible;
  box-sizing: border-box;
  border-radius: 8px;
}
.modal-header {
  height: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 4px;
  padding-top: 0;
}
.modal-title {
  color: #222;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 0;
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  display: block;
  line-height: 1;
  padding: 0 8px;
  color: #888;
  position: relative;
  top: -6px;
}
.modal-label {
  color: #222;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 4px;
  display: inline-block;
}
.modal-body .form-group {
  margin-bottom: 0;
}
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.form-row .form-group {
  flex: 1 1 0;
}

.form-control {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.datepicker-wrapper {
  position: relative;
  --vdp-hover-bg-color: #007bff;
  --vdp-selected-bg-color: #007bff;
  --vdp-hover-color: #ffffff;
  --vdp-selected-color: #ffffff;
}

.datepicker-wrapper :deep(.form-control) {
  padding-right: 3rem; /* 아이콘 공간 확보 */
  height: auto;
  padding-top: 8px;
  padding-bottom: 8px;
}

.datepicker-icon {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: #adb5bd;
  pointer-events: none;
}
</style>
