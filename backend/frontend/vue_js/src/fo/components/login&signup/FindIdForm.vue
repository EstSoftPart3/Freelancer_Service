<template>
  <form @submit.prevent="handleFindId">
    <div class="mb-3">
      <label for="findIdEmailName" class="form-label"
        >이름
        <i
          v-if="nameValid"
          class="bi bi-check-circle-fill ms-1"
          style="color: #007bff"
        ></i>
      </label>
      <input
        v-model="name"
        type="text"
        class="form-control"
        id="findIdEmailName"
        @input="validateName"
      />
      <div v-if="nameError" class="invalid-feedback">{{ nameError }}</div>
    </div>
    <div class="mb-3">
      <label class="form-label"
        >이메일 주소
        <i
          v-if="emailValid"
          class="bi bi-check-circle-fill ms-1"
          style="color: #007bff"
        ></i
      ></label>
      <div class="input-group">
        <input
          v-model="emailId"
          type="text"
          class="form-control form-control-sm"
          @input="validateEmail"
          placeholder="이메일 아이디"
        />
        <span class="input-group-text">@</span>
        <input
          v-model="customDomain"
          type="text"
          class="form-control form-control-sm"
          @input="validateEmail"
          placeholder="도메인"
        />
        <select
          v-model="emailDomain"
          class="form-control form-control-sm"
          @change="updateCustomDomain"
        >
          <option value="" disabled selected>선택하세요</option>
          <option value="naver.com">naver.com</option>
          <option value="gmail.com">gmail.com</option>
          <option value="daum.net">daum.net</option>
          <option value="nate.com">nate.com</option>
          <option value="hotmail.com">hotmail.com</option>
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
          v-model="verificationCode"
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
      <button type="submit" class="btn btn-primary">아이디 찾기</button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useAlertStore } from '@/fo/stores/alertStore'
import { api } from '@/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const alertStore = useAlertStore()

const name = ref('')
const emailId = ref('')
const emailDomain = ref('')
const customDomain = ref('')
const verificationCode = ref('')

const nameError = ref('')
const emailError = ref('')
const verifycodeError = ref('')

const nameValid = ref(false)
const emailValid = ref(false)
const verifyCodeValid = ref(false)

const validateName = () => {
  nameError.value = ''
  nameValid.value = false

  if (!name.value) {
    nameError.value = '이름을 입력해주세요.'
  } else if (name.value.length < 2) {
    nameError.value = '이름은 두 글자 이상 입력해주세요.'
  } else {
    nameValid.value = true
  }
}

const validateEmail = () => {
  emailError.value = ''
  emailValid.value = false

  const domain =
    emailDomain.value === 'custom' ? customDomain.value : emailDomain.value
  const fullEmail = `${emailId.value}@${domain}`

  if (!emailId.value) {
    emailError.value = '이메일 아이디를 입력해주세요.'
  } else if (!domain) {
    emailError.value = '이메일 도메인을 선택하거나 입력해주세요.'
  } else if (!/\S+@\S+\.\S+/.test(fullEmail)) {
    emailError.value = '올바른 이메일 주소 형식이 아닙니다.'
  } else {
    emailValid.value = true
  }
}

const updateCustomDomain = () => {
  if (emailDomain.value === 'custom') {
    customDomain.value = ''
  } else {
    customDomain.value = emailDomain.value
  }
  validateEmail()
}

const validateVerifycode = () => {
  verifycodeError.value = ''
  if (!verificationCode.value) {
    verifycodeError.value = '인증번호를 입력하세요.'
    verifyCodeValid.value = false
  } else if (!verifyCodeValid.value) {
    verifycodeError.value = '인증을 진행해주세요.'
  } else {
    verifycodeError.value = ''
  }
}

const sendVerification = async () => {
  validateEmail()
  if (!emailValid.value) return

  const domain =
    emailDomain.value === 'custom' ? customDomain.value : emailDomain.value
  const email = `${emailId.value}@${domain}`

  try {
    // const response =
    await api.$post('/email/find/send-code', { email })
    // alertStore.show(
    //   '인증 코드를 전송했습니다. 인증 코드 : ' + response.output.code,
    //   'info',
    // )
    alertStore.show('인증 코드를 전송했습니다. ', 'info')
  } catch (error) {
    console.error('이메일 인증 요청 실패:', error)
    alertStore.show('이메일 인증 요청에 실패했습니다.', 'danger')
  }
}

const verifyCode = async () => {
  validateVerifycode()
  if (!verificationCode.value) return

  const domain =
    emailDomain.value === 'custom' ? customDomain.value : emailDomain.value
  const email = `${emailId.value}@${domain}`
  const code = verificationCode.value

  try {
    await api.$post('/email/verify-code', { email, code })
    alertStore.show('이메일 인증에 성공하였습니다.', 'sucess')
    verifyCodeValid.value = true
    validateVerifycode()
  } catch (error) {
    console.error('인증 코드 검증 실패:', error)
    verifycodeError.value = '인증번호가 일치하지 않습니다.'
    alertStore.show('이메일 인증에 실패하였습니다.', 'danger')
  }
}

const handleFindId = async () => {
  validateName()
  validateEmail()
  validateVerifycode()

  if (nameValid.value && emailValid.value && verifyCodeValid.value) {
    // console.log('✅ 유효성 통과. 아이디 찾기 실행')

    const domain =
      emailDomain.value === 'custom' ? customDomain.value : emailDomain.value
    const email = `${emailId.value}@${domain}`

    try {
      const response = await api.$post('/find-id', {
        name: name.value,
        email: email,
      })

      if (response && response.output && response.output.userId) {
        // console.log('response', response)
        const outputStr = encodeURIComponent(JSON.stringify(response.output))
        // 성공: 아이디 결과 페이지로 userData 넘기기
        router.push({
          name: 'FindIdResult',
          query: { output: outputStr },
        })
      } else {
        alertStore.show('일치하는 회원 정보를 찾을 수 없습니다.', 'danger')
      }
    } catch (error) {
      console.error('아이디 찾기 API 요청 실패:', error)
      alertStore.show('아이디 찾기에 실패했습니다.', 'danger')
    }
  } else {
    alertStore.show('입력 정보를 확인해주세요.', 'danger')
  }
}
</script>

<style scoped>
.invalid-feedback {
  color: #007bff;
  display: block;
}
</style>
