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
              <input
                v-model="form.trainingStartDt"
                type="date"
                class="form-control"
                style="width: 48%"
                placeholder="시작년월"
              />
              <span style="align-self: center">~</span>
              <input
                v-model="form.trainingEndDt"
                type="date"
                class="form-control"
                style="width: 48%"
                placeholder="종료년월"
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
  trainingProgramNm: '',
  trainingInstitutionNm: '',
  trainingStartDt: '',
  trainingEndDt: '',
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
  function formatDate(dateString) {
    if (!dateString) return ''
    return dateString.substring(0, 10).replace(/-/g, '.')
  }

  form.value.period = `${formatDate(form.value.trainingStartDt)} ~ ${formatDate(form.value.trainingEndDt)}`
  props.onComplete({ ...form.value }) // 부모에게 데이터 전달
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
