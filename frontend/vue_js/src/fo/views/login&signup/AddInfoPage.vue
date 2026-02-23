<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="추가 정보 입력"
      :breadcrumbs="[
        { text: 'Home', link: '/' },
        { text: 'Login', link: '/login' },
        { text: 'AddInfo' },
      ]"
    />

    <div class="row justify-content-md-center">
      <div class="col-md-7">
        <div class="featured-box featured-box-primary text-start mt-0">
          <div class="box-content">
            <h4
              class="color-primary font-weight-semibold text-7 text-uppercase mb-3"
            >
              추가 정보 입력
            </h4>
            <div class="container">
              <form @submit.prevent="handleSubmit">
                <!-- 이름 -->
                <div class="row">
                  <div class="form-group col-lg-6">
                    <label class="form-label">
                      이름
                      <i
                        v-if="nameValid"
                        class="bi bi-check-circle-fill ms-1"
                        style="color: #007bff"
                      ></i>
                    </label>
                    <input
                      type="text"
                      v-model="form.userNm"
                      class="form-control form-control-lg"
                      placeholder="실명을 입력해주세요"
                      maxlength="20"
                      @input="validateName"
                    />
                    <div v-if="nameError" class="invalid-feedback">
                      {{ nameError }}
                    </div>
                  </div>
                </div>

                <!-- 생년월일 / 성별 -->
                <div class="row">
                  <div class="form-group col-lg-8">
                    <label class="form-label">
                      생년월일
                      <i
                        v-if="dobValid"
                        class="bi bi-check-circle-fill ms-1"
                        style="color: #007bff"
                      ></i>
                    </label>
                    <div class="datepicker-wrapper">
                      <Datepicker
                        v-model="form.userBirthDt"
                        :locale="ko"
                        :inputFormat="inputFormat"
                        dayPickerHeadingFormat="yyyy년 LLLL"
                        @update:model-value="validateDob"
                        placeholder="생년월일을 선택하세요"
                        class="form-control form-control-lg"
                        :upper-limit="new Date()"
                      />
                      <i class="fas fa-calendar datepicker-icon"></i>
                    </div>
                    <div v-if="dobError" class="invalid-feedback">
                      {{ dobError }}
                    </div>
                  </div>

                  <div class="form-group col-lg-4">
                    <label class="form-label">
                      성별
                      <i
                        v-if="genderValid"
                        class="bi bi-check-circle-fill ms-1"
                        style="color: #007bff"
                      ></i>
                    </label>
                    <select
                      v-model="form.userGenderCd"
                      class="form-control form-control-lg"
                      @change="validateGender"
                    >
                      <option disabled value="">성별</option>
                      <option value="101">남성</option>
                      <option value="102">여성</option>
                    </select>
                    <div v-if="genderError" class="invalid-feedback">
                      {{ genderError }}
                    </div>
                  </div>
                </div>

                <!-- 휴대폰 -->
                <div class="row">
                  <div class="form-group col-lg-6">
                    <label class="form-label">
                      휴대폰 번호
                      <i
                        v-if="phoneValid"
                        class="bi bi-check-circle-fill ms-1"
                        style="color: #007bff"
                      ></i>
                    </label>
                    <input
                      type="text"
                      v-model="form.userPhoneNum"
                      class="form-control form-control-lg"
                      placeholder="010-0000-0000"
                      maxlength="13"
                      @input="formatPhone"
                    />
                    <div v-if="phoneError" class="invalid-feedback">
                      {{ phoneError }}
                    </div>
                  </div>
                </div>

                <!-- 주소 -->
                <div class="row">
                  <div class="form-group col-lg-7 mb-2">
                    <label class="form-label">
                      주소
                      <i
                        v-if="addressValid"
                        class="bi bi-check-circle-fill ms-1"
                        style="color: #007bff"
                      ></i>
                    </label>
                    <input
                      type="text"
                      v-model="form.userAddr"
                      class="form-control form-control-lg"
                      placeholder="주소를 검색하세요"
                      readonly
                      @click="openPostcode"
                    />
                    <div v-if="addressError" class="invalid-feedback">
                      {{ addressError }}
                    </div>
                  </div>

                  <div class="form-group col-lg-5">
                    <label class="form-label">상세 주소</label>
                    <input
                      type="text"
                      v-model="form.userAddrDetail"
                      class="form-control form-control-lg"
                      placeholder="상세 주소 (동, 호수 등)"
                    />
                  </div>
                </div>

                <!-- 이메일 -->
                <div class="row">
                  <div class="form-group col-lg-12">
                    <label class="form-label">
                      이메일 주소
                      <i
                        v-if="emailValid"
                        class="bi bi-check-circle-fill ms-1"
                        style="color: #007bff"
                      ></i>
                    </label>
                    <div class="input-group">
                      <input
                        type="text"
                        v-model="form.emailId"
                        class="form-control form-control-lg"
                        @input="validateEmail"
                        placeholder="이메일 아이디"
                      />
                      <span class="input-group-text">@</span>

                      <input
                        type="text"
                        v-model="form.emailDomain"
                        :readonly="!isCustomDomain"
                        class="form-control form-control-lg"
                        @input="validateEmail"
                        placeholder="도메인 입력"
                      />

                      <select
                        v-model="selectedDomain"
                        @change="handleDomainChange"
                        class="form-control form-control-lg"
                      >
                        <option disabled value="">선택하세요</option>
                        <option value="naver.com">naver.com</option>
                        <option value="gmail.com">gmail.com</option>
                        <option value="daum.net">daum.net</option>
                        <option value="nate.com">nate.com</option>
                        <option value="hotmail.com">hotmail.com</option>
                        <option value="custom">직접입력</option>
                      </select>

                      <button
                        type="button"
                        class="btn btn-primary btn-lg"
                        @click="sendVerification"
                      >
                        인증 요청
                      </button>
                    </div>
                    <div v-if="emailError" class="invalid-feedback">
                      {{ emailError }}
                    </div>
                  </div>
                </div>

                <!-- 인증번호 -->
                <div class="row">
                  <div class="form-group col-lg-8">
                    <label class="form-label">
                      인증번호
                      <i
                        v-if="verifyCodeValid"
                        class="bi bi-check-circle-fill ms-1"
                        style="color: #007bff"
                      ></i>
                    </label>
                    <div class="input-group">
                      <input
                        type="text"
                        v-model="form.verificationCode"
                        class="form-control form-control-lg"
                        @input="validateVerifyCode"
                      />
                      <button
                        type="button"
                        class="btn btn-primary btn-lg"
                        @click="verifyCode"
                      >
                        확인
                      </button>
                    </div>
                    <div v-if="verifycodeError" class="invalid-feedback">
                      {{ verifycodeError }}
                    </div>
                  </div>
                </div>

                <!-- 약관 동의 -->
                <div class="row">
                  <div class="form-group col">
                    <div class="form-check">
                      <input
                        type="checkbox"
                        v-model="form.terms"
                        id="terms"
                        class="form-check-input"
                        @change="validateTerms"
                      />
                      <label for="terms" class="form-check-label me-1">
                        약관에 동의합니다.
                      </label>
                      <a
                        class="font-primary"
                        style="cursor: pointer"
                        @click="openTermsModal"
                        >이용약관</a
                      >
                    </div>
                    <div v-if="termsError" class="invalid-feedback">
                      {{ termsError }}
                    </div>
                  </div>
                </div>

                <!-- 제출 버튼 -->
                <div class="row">
                  <div class="form-group col text-6">
                    <button
                      type="submit"
                      class="btn btn-primary btn-modern w-100"
                      :disabled="isSubmitting"
                    >
                      <span v-if="!isSubmitting">제출하기</span>
                      <span v-else class="loading-spinner"></span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import { ref, onMounted } from 'vue'
import Datepicker from 'vue3-datepicker'
import { ko } from 'date-fns/locale'
import { api } from '@/axios'
import router from '@/fo/router'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useModalStore } from '@/fo/stores/modalStore'
import { useUserStore } from '@/fo/stores/userStore'
import { personalAgreementText } from '@/assets/terms'
import TermsAgreementModal from '@/fo/components/login&signup/TermsAgreementModal.vue'

const alertStore = useAlertStore()
const modalStore = useModalStore()
const userStore = useUserStore()
const inputFormat = ref('yyyy-MM-dd')

const form = ref({
  userNm: '',
  userBirthDt: '',
  userGenderCd: '',
  userPhoneNum: '',
  userAddr: '',
  userAddrDetail: '',
  zonecode: '',
  sigunguCode: '',
  latitude: '',
  longitude: '',
  emailId: '',
  emailDomain: '',
  verificationCode: '',
  terms: false,
  tempToken: sessionStorage.getItem('tempToken') || '',
})

const isSubmitting = ref(false)
const selectedDomain = ref('')
const isCustomDomain = ref(false)

// 에러 메시지
const nameError = ref('')
const dobError = ref('')
const genderError = ref('')
const phoneError = ref('')
const addressError = ref('')
const emailError = ref('')
const verifycodeError = ref('')
const termsError = ref('')

// 유효성 통과 여부
const nameValid = ref(false)
const dobValid = ref(false)
const genderValid = ref(false)
const phoneValid = ref(false)
const addressValid = ref(false)
const emailValid = ref(false)
const verifyCodeValid = ref(false)
const termsValid = ref(false)

// ────────────────────────────────────────
// 도메인 셀렉트 변경
// ────────────────────────────────────────
const handleDomainChange = () => {
  if (selectedDomain.value === 'custom') {
    form.value.emailDomain = ''
    isCustomDomain.value = true
  } else {
    form.value.emailDomain = selectedDomain.value
    isCustomDomain.value = false
  }
  validateEmail()
}

// ────────────────────────────────────────
// 이메일 인증 요청
// ────────────────────────────────────────
const sendVerification = async () => {
  validateEmail()
  if (!emailValid.value) return

  const email = `${form.value.emailId}@${form.value.emailDomain}`
  try {
    const response = await api.$post('/email/send-social-code', { email })
    alertStore.show(
      '인증 코드를 전송했습니다. 인증 코드 : ' + response.output.code,
      'info',
    )
  } catch (error) {
    console.error('이메일 인증 요청 실패:', error)
    const message =
      error.response?.data?.message || '이메일 인증 요청에 실패했습니다.'
    emailValid.value = false
    emailError.value = message
  }
}

// ────────────────────────────────────────
// 인증 코드 확인
// ────────────────────────────────────────
const verifyCode = async () => {
  verifycodeError.value = ''
  verifyCodeValid.value = false

  const email = `${form.value.emailId}@${form.value.emailDomain}`
  const code = form.value.verificationCode

  if (!code) {
    verifycodeError.value = '인증번호를 입력하세요.'
    return
  }

  try {
    await api.$post('/email/verify-code', { email, code })
    alertStore.show('이메일 인증에 성공하였습니다.', 'info')
    verifyCodeValid.value = true
  } catch (error) {
    console.error('인증 코드 검증 실패:', error)
    verifycodeError.value = '인증번호가 일치하지 않습니다.'
    alertStore.show('이메일 인증에 실패하였습니다.', 'danger')
    verifyCodeValid.value = false
  }
}

// ────────────────────────────────────────
// Daum 우편번호
// ────────────────────────────────────────
const openPostcode = () => {
  new window.daum.Postcode({
    oncomplete: function (data) {
      const addr =
        data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress

      form.value.userAddr = addr
      form.value.userAddrDetail = ''
      form.value.zonecode = data.zonecode
      form.value.sigunguCode = data.sigunguCode

      // 주소 → 좌표 변환
      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.addressSearch(addr, function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          form.value.latitude = result[0].y
          form.value.longitude = result[0].x
        } else {
          form.value.latitude = null
          form.value.longitude = null
        }
      })

      validateAddress()
    },
  }).open()
}

// ────────────────────────────────────────
// 휴대폰 자동 하이픈
// ────────────────────────────────────────
const formatPhone = () => {
  let val = form.value.userPhoneNum.replace(/\D/g, '')
  if (val.length <= 3) {
    form.value.userPhoneNum = val
  } else if (val.length <= 7) {
    form.value.userPhoneNum = `${val.slice(0, 3)}-${val.slice(3)}`
  } else {
    form.value.userPhoneNum = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7, 11)}`
  }
  validatePhone()
}

// ────────────────────────────────────────
// 유효성 검사
// ────────────────────────────────────────
const validateName = () => {
  nameError.value = ''
  nameValid.value = false
  if (!form.value.userNm.trim()) {
    nameError.value = '이름을 입력해주세요.'
  } else if (form.value.userNm.trim().length < 2) {
    nameError.value = '이름은 두 글자 이상 입력해주세요.'
  } else {
    nameValid.value = true
  }
}

const validateDob = () => {
  dobError.value = ''
  dobValid.value = false
  if (!form.value.userBirthDt) {
    dobError.value = '생년월일을 선택해주세요.'
  } else {
    dobValid.value = true
  }
}

const validateGender = () => {
  genderError.value = ''
  genderValid.value = false
  if (!form.value.userGenderCd) {
    genderError.value = '성별을 선택해주세요.'
  } else {
    genderValid.value = true
  }
}

const validatePhone = () => {
  phoneError.value = ''
  phoneValid.value = false
  const phoneReg = /^010-\d{4}-\d{4}$/
  if (!form.value.userPhoneNum) {
    phoneError.value = '휴대폰 번호를 입력해주세요.'
  } else if (!phoneReg.test(form.value.userPhoneNum)) {
    phoneError.value = '010-0000-0000 형식으로 입력해주세요.'
  } else {
    phoneValid.value = true
  }
}

const validateAddress = () => {
  addressError.value = ''
  addressValid.value = false
  if (!form.value.userAddr.trim()) {
    addressError.value = '주소를 입력해주세요.'
  } else {
    addressValid.value = true
  }
}

const validateEmail = () => {
  emailError.value = ''
  emailValid.value = false

  const fullEmail =
    form.value.emailId +
    '@' +
    (isCustomDomain.value ? form.value.emailDomain : selectedDomain.value)

  if (!form.value.emailId) {
    emailError.value = '이메일 아이디를 입력해주세요.'
  } else if (isCustomDomain.value && !form.value.emailDomain) {
    emailError.value = '도메인을 입력해주세요.'
  } else if (!/\S+@\S+\.\S+/.test(fullEmail)) {
    emailError.value = '올바른 이메일 주소 형식이 아닙니다.'
  } else {
    emailValid.value = true
  }
}

const validateVerifyCode = () => {
  verifycodeError.value = ''
  if (!form.value.verificationCode) {
    verifycodeError.value = '인증번호를 입력하세요.'
  } else if (!verifyCodeValid.value) {
    verifycodeError.value = '인증을 진행해주세요.'
  }
}

// 약관 유효성 검사
const validateTerms = () => {
  termsError.value = ''
  termsValid.value = false
  if (!form.value.terms) {
    termsError.value = '필수 약관에 동의해주세요.'
  } else {
    termsValid.value = true
  }
}

// 약관 모달
const openTermsModal = () => {
  modalStore.openModal(TermsAgreementModal, {
    title: '개인정보 수집 및 이용 동의서',
    body: personalAgreementText,
    onConfirm: () => {
      alertStore.show('약관 동의 처리되었습니다.', 'success')
      form.value.terms = true
      termsValid.value = true
      termsError.value = ''
      modalStore.closeModal()
    },
  })
}

// ────────────────────────────────────────
// 전체 유효성 검사
// ────────────────────────────────────────
const validateAll = () => {
  validateName()
  validateDob()
  validateGender()
  validatePhone()
  validateAddress()
  validateEmail()
  validateVerifyCode()
  validateTerms()

  return (
    nameValid.value &&
    dobValid.value &&
    genderValid.value &&
    phoneValid.value &&
    addressValid.value &&
    emailValid.value &&
    verifyCodeValid.value &&
    termsValid.value
  )
}

// ────────────────────────────────────────
// 제출
// ────────────────────────────────────────
const handleSubmit = async () => {
  if (!validateAll()) return

  isSubmitting.value = true

  const payload = {
    tempToken: form.value.tempToken,
    providerCd: sessionStorage.getItem('providerCd') || '',
    userNm: form.value.userNm,
    userEmail: `${form.value.emailId}@${form.value.emailDomain}`,
    userPhoneNum: form.value.userPhoneNum,
    userGenderCd: form.value.userGenderCd,
    userBirthDt: form.value.userBirthDt
      ? new Date(form.value.userBirthDt).toISOString().split('T')[0]
      : null,
    userTypeCd: 301,
    zonecode: form.value.zonecode,
    address: form.value.userAddr,
    detailAddress: form.value.userAddrDetail,
    sigunguCode: form.value.sigunguCode || null,
    latitude: Number(form.value.latitude),
    longitude: Number(form.value.longitude),
  }

  try {
    const response = await api.$post('/auth/social/signup', payload)
    const { accessToken, refreshToken } = response.token
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    userStore.setUser({
      userNm: response.userNm,
      userTypeCd: response.userTypeCd,
    })

    sessionStorage.removeItem('tempToken')
    sessionStorage.removeItem('providerCd')
    router.push('/')
  } catch (error) {
    console.error(error.response?.data?.message || error.message)
    alertStore.show(error.response?.data?.message || error.message, 'danger')
  } finally {
    isSubmitting.value = false
  }
}

// ────────────────────────────────────────
// onMounted - Daum 우편번호 확인
// ────────────────────────────────────────
onMounted(() => {
  if (!form.value.tempToken) {
    alertStore.show(
      '잘못된 접근입니다. 소셜 로그인을 먼저 진행해주세요.',
      'danger',
    )
    router.push('/login')
    return
  }

  if (!window.daum) {
    console.warn('❌ Daum 우편번호 API가 로드되지 않았습니다.')
  } else {
    console.log('✅ Daum 우편번호 API 로드됨')
  }
})
</script>

<style scoped>
select.form-control,
select.form-control-lg {
  line-height: 1.6;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  height: auto;
}

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
  padding-right: 3rem;
}

.datepicker-icon {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: #adb5bd;
  pointer-events: none;
}

.loading-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
