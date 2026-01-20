<template>
  <div class="modal-header">
    <h5 class="modal-title">중복 계정 통합 안내</h5>
    <button type="button" class="close" @click="closeModal" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>

  <div class="modal-body">
    <template v-if="step === 1">
      <div class="text-center py-4">
        <p class="mb-2">
          이미 <strong>[{{ email }}]</strong>으로 가입된 계정이 있습니다.
        </p>
        <p>구글 계정을 연결하여 간편하게 로그인하시겠습니까?</p>
      </div>
    </template>

    <template v-else>
      <div class="p-3">
        <p class="font-weight-bold mb-3">
          보안을 위해 기존 계정의 비밀번호를 입력해주세요.
        </p>
        <div class="form-group">
          <label>비밀번호</label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            placeholder="비밀번호 입력"
            @keyup.enter="handleIntegration"
            autofocus
          />
          <div v-if="errorMessage" class="text-danger small mt-2">
            <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
          </div>
        </div>
      </div>
    </template>
  </div>

  <div class="modal-footer">
    <template v-if="step === 1">
      <button class="btn btn-primary" @click="step = 2">계정 통합</button>
      <button class="btn btn-default" @click="closeModal">다음에</button>
    </template>
    <template v-else>
      <button class="btn btn-primary" @click="handleIntegration">
        인증 및 통합 완료
      </button>
      <button class="btn btn-default" @click="step = 1">이전으로</button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import { api } from '@/axios'
import { useRouter } from 'vue-router'
import { useAlertStore } from '@/fo/stores/alertStore'

const props = defineProps({
  email: { type: String, default: '' },
  socialId: { type: String, default: '' },
})

const modalStore = useModalStore()
const alertStore = useAlertStore()
const router = useRouter()
const step = ref(1)
const password = ref('')
const errorMessage = ref('')

const closeModal = () => modalStore.closeModal()

const handleIntegration = async () => {
  if (!password.value) {
    errorMessage.value = '비밀번호를 입력해주세요.'
    return
  }
  errorMessage.value = ''
  try {
    const payload = {
      userEmail: props.email,
      userPw: password.value,
      socialId: props.socialId,
    }

    const res = await api.$post('/auth/social/link', payload)

    if (res.status === 'OK' || res.message === 'success') {
      alertStore.show(
        '계정 통합이 완료되었습니다. 다시 로그인해 주세요.',
        'success',
      )
      closeModal()
      router.push('/login')
    } else {
      errorMessage.value = res.message || '비밀번호가 일치하지 않습니다.'
    }
  } catch (error) {
    errorMessage.value =
      '에러 발생: ' + (error.response?.status || '네트워크 오류')
  }
}
</script>

<style scoped>
.modal-header {
  width: 100%;
}
.close {
  cursor: pointer;
  padding: 0;
  margin-left: auto; /* 제목이 길어져도 버튼을 오른쪽으로 밀어냅니다 */
}
</style>
