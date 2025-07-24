<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">
        기업인증
        <i
          v-if="isVerified"
          class="bi bi-check-circle-fill ms-1"
          style="color: #007bff"
        ></i>
      </h5>
      <button
        type="button"
        class="btn-close"
        @click="closeModal"
        aria-hidden="true"
      ></button>
    </div>

    <div class="modal-body">
      <!-- 기업명 & 대표자명 -->
      <div class="row mb-3">
        <div class="col">
          <label class="form-label">
            기업명
            <i
              v-if="nameValid"
              class="bi bi-check-circle-fill ms-1"
              style="color: #007bff"
            ></i>
          </label>
          <input
            type="text"
            class="form-control"
            v-model="companyName"
            @input="handleInputChange('name')"
          />
          <div v-if="nameError" class="invalid-feedback">{{ nameError }}</div>
        </div>
        <div class="col">
          <label class="form-label">
            대표자명
            <i
              v-if="ceoValid"
              class="bi bi-check-circle-fill ms-1"
              style="color: #007bff"
            ></i>
          </label>
          <input
            type="text"
            class="form-control"
            v-model="ceoName"
            @input="handleInputChange('ceo')"
          />
          <div v-if="ceoError" class="invalid-feedback">{{ ceoError }}</div>
        </div>
      </div>

      <!-- 개업일자 -->
      <div class="mb-3">
        <label class="form-label">
          개업일자
          <i
            v-if="dateValid"
            class="bi bi-check-circle-fill ms-1"
            style="color: #007bff"
          ></i>
        </label>
        <div class="datepicker-wrapper">
          <Datepicker
            :key="datepickerKey"
            v-model="openDate"
            :locale="ko"
            :inputFormat="inputFormat"
            placeholder="개업일자"
            class="form-control"
            :upper-limit="new Date()"
            @input="handleInputChange('date')"
            title="키보드 입력은 불가합니다. 달력에서 선택해주세요."
            dayPickerHeadingFormat="yyyy년 LLLL"
            teleport="body"
            @update:modelValue="datepickerKey++"
          />
          <i class="fas fa-calendar datepicker-icon"></i>
        </div>
        <div v-if="dateError" class="invalid-feedback">{{ dateError }}</div>
      </div>

      <!-- 사업자번호 + 인증 -->
      <div class="mb-3">
        <label class="form-label">
          사업자 번호
          <i
            v-if="bizValid"
            class="bi bi-check-circle-fill ms-1"
            style="color: #007bff"
          ></i>
        </label>
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            v-model="bizNumber"
            @input="handleInputChange('biz')"
          />
          <button class="btn btn-primary" type="button" @click="handleVerify">
            인증하기
          </button>
        </div>
        <div v-if="bizError" class="invalid-feedback">{{ bizError }}</div>
      </div>

      <!-- 약관 동의 -->
      <div class="form-check mb-4">
        <input
          type="checkbox"
          v-model="companyPorfileStore.termsAgreed"
          id="agreeTerms"
          class="form-check-input"
        />
        <label class="form-check-label me-1" for="agreeTerms">
          약관에 동의합니다.
        </label>
        <a class="font-primary" @click="openTermsModal">이용약관</a>
      </div>

      <!-- 인증 완료 버튼 -->
      <div class="d-grid">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!canConfirm"
          @click="handleConfirm"
        >
          기업 인증 완료
        </button>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-light" @click="closeModal">닫기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue'
import Datepicker from 'vue3-datepicker'
import { ko } from 'date-fns/locale'
import { useModalStore } from '@/fo/stores/modalStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useCompanyProfileStore } from '@/fo/stores/companyProfileStore'
import TermsAgreementModal from './TermsAgreementModal.vue'
import { companyAgreementText } from '@/assets/terms'
import { api } from '@/axios'

const props = defineProps({
  onConfirm: Function,
})
const modalStore = useModalStore()
const alertStore = useAlertStore()
const companyPorfileStore = useCompanyProfileStore()
const termsText = companyAgreementText

// 입력값 ref
const companyName = ref('')
const ceoName = ref('')
const openDate = ref('')
const bizNumber = ref('')
const inputFormat = ref('yyyy-MM-dd')
const datepickerKey = ref(0)

// 에러 및 유효성 ref
const nameError = ref('')
const ceoError = ref('')
const dateError = ref('')
const bizError = ref('')

const nameValid = ref(false)
const ceoValid = ref(false)
const dateValid = ref(false)
const bizValid = ref(false)

// 인증 상태
const isVerified = ref(false)

// validation 함수
const validateName = () => {
  nameError.value = ''
  nameValid.value = false
  if (!companyName.value.trim()) {
    nameError.value = '기업명을 입력해주세요.'
  } else {
    nameValid.value = true
  }
}

const validateCeo = () => {
  ceoError.value = ''
  ceoValid.value = false
  if (!ceoName.value.trim()) {
    ceoError.value = '대표자명을 입력해주세요.'
  } else {
    ceoValid.value = true
  }
}

const validateDate = () => {
  dateError.value = ''
  dateValid.value = false
  if (!openDate.value) {
    dateError.value = '개업일자를 선택해주세요.'
  } else {
    dateValid.value = true
  }
}

const validateBiz = () => {
  bizError.value = ''
  bizValid.value = false
  if (!bizNumber.value.trim()) {
    bizError.value = '사업자 번호를 입력해주세요.'
  } else {
    bizValid.value = true
  }
}

// 전체 유효성 체크 (인증하기 눌렀을 때)
const verifyAllInputs = () => {
  validateName()
  validateCeo()
  validateDate()
  validateBiz()
  return nameValid.value && ceoValid.value && dateValid.value && bizValid.value
}

// 인증하기 버튼 클릭 시
async function handleVerify() {
  if (!verifyAllInputs()) {
    alertStore.show('모든 정보를 정확히 입력 후 인증해주세요.', 'danger')
    return
  }

  const formattedOpenDate = openDate.value.replace(/-/g, '')

  try {
    const response = await api.$post('/company/verify', {
      b_no: bizNumber.value,
      start_dt: formattedOpenDate,
      p_nm: ceoName.value,
      b_nm: companyName.value,
    })

    if (response.output === true) {
      isVerified.value = true
      alertStore.show('기업 인증이 성공했습니다.', 'success')
    } else {
      isVerified.value = false
      alertStore.show(response.message || '기업 인증 실패', 'danger')
    }
  } catch (error) {
    isVerified.value = false
    alertStore.show('서버 오류로 인증에 실패했습니다.', 'danger')
    console.error(error)
  }
}

// 입력값 변경 시 (인증 상태 초기화 및 해당 필드 재검증)
function handleInputChange(field) {
  isVerified.value = false

  switch (field) {
    case 'name':
      validateName()
      break
    case 'ceo':
      validateCeo()
      break
    case 'date':
      validateDate()
      break
    case 'biz':
      validateBiz()
      break
  }
}

// 약관 모달 열기
function openTermsModal() {
  modalStore.openModal(TermsAgreementModal, {
    title: '기업정보 수집 및 이용 동의서',
    body: termsText,
    onConfirm: () => {
      alertStore.show('약관 동의 처리되었습니다.', 'success')
      companyPorfileStore.termsAgreed = true
      modalStore.closeModal()
    },
  })
}

function closeModal() {
  modalStore.closeModal()
}

// 인증 완료 버튼 활성 조건
const canConfirm = computed(() => {
  return isVerified.value && companyPorfileStore.termsAgreed
})

// 인증 완료 버튼 클릭 시
function handleConfirm() {
  if (!canConfirm.value) {
    alertStore.show('약관 동의와 기업인증이 모두 완료되어야 합니다.', 'danger')
    return
  }

  // store에 정보 저장
  companyPorfileStore.setProfile({
    companyName: companyName.value,
    ceoName: ceoName.value,
    openDate: openDate.value,
    bizNumber: bizNumber.value,
    termsAgreed: true,
  })

  props.onConfirm()
  alertStore.show('기업 인증 완료되었습니다.', 'success')
  closeModal()
}
</script>

<style scoped>
.invalid-feedback {
  color: #007bff;
  display: block;
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
