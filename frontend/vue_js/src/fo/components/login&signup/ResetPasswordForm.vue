<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-3">
      <label for="resetPasswordUserId" class="form-label">
        아이디
        <i
          v-if="userIdValid"
          class="bi bi-check-circle-fill ms-1"
          style="color: #007bff"
        ></i>
      </label>
      <input
        v-model="form.userId"
        type="text"
        class="form-control"
        id="resetPasswordUserId"
        @input="validateUserId"
      />
      <div v-if="userIdError" class="invalid-feedback">{{ userIdError }}</div>
    </div>

    <div class="mb-3">
      <label for="resetPasswordName" class="form-label">
        이름
        <i
          v-if="nameValid"
          class="bi bi-check-circle-fill ms-1"
          style="color: #007bff"
        ></i>
      </label>
      <input
        v-model="form.name"
        type="text"
        class="form-control"
        id="resetPasswordName"
        @input="validateName"
      />
      <div v-if="nameError" class="invalid-feedback">{{ nameError }}</div>
    </div>

    <div class="mb-3">
      <label for="resetPasswordEmailDomain" class="form-label">
        이메일 주소
        <i
          v-if="emailValid"
          class="bi bi-check-circle-fill ms-1"
          style="color: #007bff"
        ></i>
      </label>
      <div class="input-group">
        <input
          v-model="form.emailId"
          type="text"
          class="form-control form-control-sm"
          placeholder="이메일 아이디"
          @input="validateEmail"
        />
        <span class="input-group-text small">@</span>
        <input
          v-model="form.customDomain"
          type="text"
          class="form-control form-control-sm"
          placeholder="이메일 도메인"
          @input="validateEmail"
          :readonly="form.domain !== 'custom'"
        />
        <select
          v-model="form.domain"
          class="form-control form-control-sm"
          @change="updateEmailInput"
        >
          <option value="" disabled>선택하세요</option>
          <option value="naver.com">naver.com</option>
          <option value="gmail.com">gmail.com</option>
          <option value="yahoo.com">yahoo.com</option>
          <option value="custom">직접 입력</option>
        </select>
        <button type="button" class="btn btn-primary" @click="sendVerification">
          인증
        </button>
      </div>
      <div v-if="emailError" class="invalid-feedback">{{ emailError }}</div>
    </div>

    <div class="mb-3">
      <label class="form-label"
        >인증번호
        <i
          v-if="verifyCodeValid"
          class="bi bi-check-circle-fill ms-1"
          style="color: #007bff"
        ></i>
      </label>
      <div class="input-group">
        <input
          v-model="form.verificationCode"
          type="text"
          class="form-control"
          @input="validateVerifycode"
        />
        <button type="button" class="btn btn-primary" @click="verifyCode">
          확인
        </button>
      </div>
      <div v-if="verifycodeError" class="invalid-feedback">
        {{ verifycodeError }}
      </div>
    </div>
    <div class="d-grid mb-3">
      <button type="submit" class="btn btn-primary btn-block">
        비밀번호 찾기
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useRouter } from 'vue-router'

const alertStore = useAlertStore()
const router = useRouter()

const form = reactive({
  userId: '',
  name: '',
  emailId: '',
  domain: '',
  customDomain: '',
  verificationCode: '',
})

const userIdError = ref('')
const nameError = ref('')
const emailError = ref('')
const verifycodeError = ref('')
const verificationError = ref(false)

const userIdValid = ref(false)
const nameValid = ref(false)
const emailValid = ref(false)
const verifyCodeValid = ref(false)

const validateUserId = () => {
  userIdError.value = ''
  userIdValid.value = false
  if (!form.userId) {
    userIdError.value = '아이디를 입력해주세요.'
  } else if (form.userId.length < 4) {
    userIdError.value = '아이디는 4자 이상 입력해주세요.'
  } else {
    userIdValid.value = true
  }
}

const validateName = () => {
  nameError.value = ''
  nameValid.value = false
  if (!form.name) {
    nameError.value = '이름을 입력해주세요.'
  } else if (form.name.length < 2) {
    nameError.value = '이름은 두 글자 이상 입력해주세요.'
  } else {
    nameValid.value = true
  }
}

const validateEmail = () => {
  emailError.value = ''
  emailValid.value = false
  const domain = form.domain === 'custom' ? form.customDomain : form.domain
  const fullEmail = `${form.emailId}@${domain}`
  if (!form.emailId) {
    emailError.value = '이메일 아이디를 입력해주세요.'
  } else if (!domain) {
    emailError.value = '이메일 도메인을 선택하거나 입력해주세요.'
  } else if (!/\S+@\S+\.\S+/.test(fullEmail)) {
    emailError.value = '올바른 이메일 주소 형식이 아닙니다.'
  } else {
    emailValid.value = true
  }
}

const validateVerifyCode = () => {
  verifycodeError.value = ''
  verificationError.value = false
  if (!form.verificationCode) {
    verifycodeError.value = '인증번호를 입력하세요.'
    verifyCodeValid.value = false
  } else if (!verifyCodeValid.value) {
    verifycodeError.value = '인증을 진행해주세요.'
  } else {
    verifycodeError.value = ''
  }
}

const updateEmailInput = () => {
  if (form.domain !== 'custom') {
    form.customDomain = form.domain
  } else {
    form.customDomain = ''
  }
  validateEmail()
}

const sendVerification = async () => {
  validateEmail()
  if (!emailValid.value) return

  const domain = form.domain === 'custom' ? form.customDomain : form.domain
  const email = `${form.emailId}@${domain}`

  try {
    const response = await api.$post('/email/find/send-code', { email })
    alertStore.show(
      `인증 코드를 전송했습니다. 인증 코드: ${response.output.code}`,
      'info',
    )
  } catch (error) {
    console.error('이메일 인증 요청 실패:', error)
    alertStore.show('이메일 인증 요청에 실패했습니다.', 'danger')
  }
}

const verifyCode = async () => {
  validateVerifyCode()
  if (!form.verificationCode) return

  const domain = form.domain === 'custom' ? form.customDomain : form.domain
  const email = `${form.emailId}@${domain}`
  const code = form.verificationCode

  try {
    await api.$post('/email/verify-code', { email, code })
    alertStore.show('이메일 인증에 성공하였습니다.', 'info')
    verifyCodeValid.value = true
    validateVerifyCode()
    verificationError.value = false
  } catch (error) {
    console.error('인증 코드 검증 실패:', error)
    verifyCodeValid.value = false
    verificationError.value = true
    alertStore.show('이메일 인증에 실패하였습니다.', 'danger')
  }
}

const handleSubmit = async () => {
  validateUserId()
  validateName()
  validateEmail()
  validateVerifyCode()

  if (
    !(
      userIdValid.value &&
      nameValid.value &&
      emailValid.value &&
      verifyCodeValid.value
    )
  ) {
    alertStore.show('입력 정보를 확인해주세요.', 'danger')
    return
  }

  const domain = form.domain === 'custom' ? form.customDomain : form.domain
  const email = `${form.emailId}@${domain}`

  try {
    const response = await api.$post(
      '/reset-password/verify',
      {
        userId: form.userId,
        name: form.name,
        email,
      },
      {
        withCredentials: true,
      },
    )

    // 표준화된 응답 구조 사용
    if (response.status === 'OK') {
      alertStore.show('비밀번호 재설정 페이지로 이동합니다.', 'success')
      router.push({ name: 'ResetPassword' })
    } else if (response.status === 'BAD_REQUEST') {
      alertStore.show('일치하는 회원 정보를 찾을 수 없습니다.', 'danger')
    }
  } catch (error) {
    console.error(error)
    alertStore.show('서버 요청 중 오류가 발생했습니다.', 'danger')
  }
}
</script>

<style scoped>
.invalid-feedback {
  color: #007bff;
  display: block;
}
</style>
