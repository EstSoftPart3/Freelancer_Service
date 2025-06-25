<template>
  <div class="modal-layer">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">회사 이력 추가하기</h4>
        <button class="close-btn" @click="modalStore.closeModal()">×</button>
      </div>

      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label class="modal-label">회사명</label>
            <input
              v-model="form.company"
              type="text"
              class="form-control"
              placeholder="회사명"
            />
          </div>
          <div class="form-group">
            <label class="modal-label">부서</label>
            <input
              v-model="form.department"
              type="text"
              class="form-control"
              placeholder="부서"
            />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group position-group">
            <label class="modal-label">직급</label>
            <input
              v-model="form.position"
              type="text"
              class="form-control"
              placeholder="직급"
            />
          </div>
          <div class="form-group period-group">
            <label class="modal-label">근무 기간</label>
            <div style="display: flex; gap: 8px">
              <input
                v-model="form.startDate"
                type="date"
                class="form-control"
                style="width: 48%"
                placeholder="입사년월"
              />
              <span style="align-self: center">~</span>
              <input
                v-model="form.endDate"
                type="date"
                class="form-control"
                style="width: 48%"
                placeholder="퇴사년월"
              />
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

const props = defineProps({
  onComplete: Function, // 부모에서 내려주는 콜백함수
})
const modalStore = useModalStore()
const alertStore = useAlertStore()

const form = ref({
  company: '',
  department: '',
  position: '',
  startDate: '',
  endDate: '',
  period: '',
})

const submit = () => {
  if (!form.value.company) {
    alertStore.show('회사명을 입력해주세요.', 'danger')
    return
  }
  if (!form.value.department) {
    alertStore.show('부서를 입력하세요.', 'danger')
    return
  }

  if (!form.value.position) {
    alertStore.show('직급을 입력하세요.', 'danger')
    return
  }

  if (!form.value.startDate) {
    alertStore.show('근무 기간을 선택하세요.', 'danger')
    return
  }
  // 화면 표시용 기간 (YYYY.MM ~ YYYY.MM)
  function formatDate(dateString) {
    if (!dateString) return ''
    return dateString.substring(0, 10).replace(/-/g, '.')
  }
  form.value.period = form.value.endDate
    ? `${formatDate(form.value.startDate)} ~ ${formatDate(form.value.endDate)}`
    : `${formatDate(form.value.startDate)} ~`

  // 부모로 넘길 때는 YYYY-MM-dd로 넘기기
  props.onComplete({
    careerCompanyNm: form.value.company,
    careerDepartmentNm: form.value.department,
    careerPositionNm: form.value.position,
    careerStartDt: form.value.startDate,
    careerEndDt: form.value.endDate,
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
  overflow-x: hidden;
  overflow-y: auto;
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
.form-row .position-group {
  flex: 0 0 30% !important;
}
.form-row .period-group {
  flex: 0 0 70% !important;
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
</style>
