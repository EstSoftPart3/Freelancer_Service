<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="비밀번호 재설정"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: 'ResetPassword' }]"
    />
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card border-0 shadow-lg">
            <div class="card-header bg-grey text-dark">
              <h5 class="mb-0">비밀번호 재설정</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label for="password" class="form-label">
                  새로운 비밀번호
                  <i
                    v-if="passwordValid"
                    class="bi bi-check-circle-fill ms-1"
                    style="color: #007bff"
                  ></i>
                </label>
                <input
                  type="password"
                  id="password"
                  class="form-control"
                  v-model="password"
                  maxlength="32"
                  @input="validatePassword"
                />
                <div v-if="passwordError" class="invalid-feedback">
                  {{ passwordError }}
                </div>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">
                  비밀번호 확인
                  <i
                    v-if="confirmPasswordValid"
                    class="bi bi-check-circle-fill ms-1"
                    style="color: #007bff"
                  ></i>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  class="form-control"
                  v-model="confirmPassword"
                  maxlength="32"
                  @input="validateConfirmPassword"
                />
                <div v-if="confirmPasswordError" class="invalid-feedback">
                  {{ confirmPasswordError }}
                </div>
              </div>

              <div class="d-flex justify-content-center gap-3">
                <button class="btn btn-primary px-4" @click="resetPassword">
                  비밀번호 재설정
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import { useAlertStore } from '@/fo/stores/alertStore'
import { api } from '@/axios'

const alertStore = useAlertStore()

const router = useRouter()

const password = ref('')
const confirmPassword = ref('')

const passwordError = ref('')
const confirmPasswordError = ref('')

const passwordValid = ref(false)
const confirmPasswordValid = ref(false)

const validatePassword = () => {
  passwordError.value = ''
  passwordValid.value = false

  if (!password.value) {
    passwordError.value = '비밀번호를 입력해주세요.'
  } else if (
    !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password.value)
  ) {
    passwordError.value = '8자 이상, 영문·숫자·특수문자를 조합해 입력해주세요.'
  } else {
    passwordValid.value = true
  }
}

const validateConfirmPassword = () => {
  confirmPasswordError.value = ''
  confirmPasswordValid.value = false

  if (!confirmPassword.value) {
    confirmPasswordError.value = '비밀번호 확인을 입력해주세요.'
  } else if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = '비밀번호가 일치하지 않습니다.'
  } else {
    confirmPasswordValid.value = true
  }
}

const resetPassword = async () => {
  validatePassword()
  validateConfirmPassword()

  if (passwordValid.value && confirmPasswordValid.value) {
    try {
      const response = await api.$post(
        '/reset-password',
        { newPassword: password.value },
        { withCredentials: true },
      )

      if (response.status === 'OK') {
        alertStore.show('비밀번호 재설정 완료', 'success')
        router.push('/login')
      } else {
        alertStore.show(response.message || '비밀번호 재설정 실패', 'danger')
      }
    } catch (error) {
      console.error('에러 발생:', error)
      // console.log('알러트 호출 직전') // 이게 콘솔에 찍히는지 확인
      console.error(error)
      alertStore.show('서버 요청 중 오류가 발생했습니다.', 'danger')
    }
  } else {
    alertStore.show('입력 정보를 확인해주세요.', 'danger')
  }
}
</script>
