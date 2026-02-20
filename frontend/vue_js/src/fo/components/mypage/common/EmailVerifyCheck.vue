<template>
  <div>
    <div class="overflow-hidden mb-3">
      <slot />
    </div>
    <div class="overflow-hidden mb-4 pb-3">
      <p class="mb-0">이메일 인증</p>
    </div>

    <div class="form-group row">
      <label class="col-lg-3 col-form-label text-2">이메일</label>
      <div class="col-lg-7">
        <!-- 등록된 이메일 표시 (마스킹) -->
        <input
          class="form-control text-3 h-auto py-2"
          type="text"
          :value="maskedEmail"
          readonly
        />
      </div>
      <div class="col-lg-2">
        <button type="button" class="btn btn-primary" @click="sendCode">
          인증 요청
        </button>
      </div>
    </div>

    <div class="form-group row mt-2">
      <label class="col-lg-3 col-form-label text-2">인증번호</label>
      <div class="col-lg-7">
        <input
          v-model="verifyCode"
          class="form-control text-3 h-auto py-2"
          type="text"
          placeholder="인증번호 입력"
        />
        <div class="invalid-feedback" style="display: block">{{ error }}</div>
      </div>
      <div class="col-lg-2">
        <button type="button" class="btn btn-primary" @click="confirmCode">
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/axios'

const emit = defineEmits(['confirmed'])

const email = ref('') // 실제 이메일 (API에서 가져옴)
const verifyCode = ref('')
const error = ref('')

// 이메일 마스킹: abc@gmail.com → a**@gmail.com
const maskedEmail = computed(() => {
  if (!email.value) return ''
  const [id, domain] = email.value.split('@')
  return id[0] + '*'.repeat(id.length - 1) + '@' + domain
})

// 마운트 시 등록된 이메일 조회
onMounted(async () => {
  const res = await api.$get('/mypage/edit/info', null)
  email.value = res.output.userEmail
})

// 인증코드 발송
const sendCode = async () => {
  error.value = ''
  try {
    await api.$post('/email/find/send-code', { email: email.value })
    error.value = '인증코드가 전송되었습니다.'
  } catch (e) {
    error.value = '인증코드 전송에 실패했습니다.'
  }
}

// 인증코드 확인
const confirmCode = async () => {
  if (!verifyCode.value) {
    error.value = '인증번호를 입력해주세요.'
    return
  }
  try {
    const res = await api.$post('/email/verify-code', {
      email: email.value,
      code: verifyCode.value,
    })
    if (res.status === 'OK') {
      emit('confirmed')
    } else {
      error.value = '인증번호가 일치하지 않습니다.'
    }
  } catch (e) {
    error.value = '인증번호가 일치하지 않습니다.'
  }
}
</script>
