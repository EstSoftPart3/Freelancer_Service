<template>
  <div>
    <div class="overflow-hidden mb-3">
      <slot />
      <!-- <h2 class="font-weight-normal text-7 mb-0">회원 정보 수정</h2> -->
    </div>
    <div class="overflow-hidden mb-4 pb-3">
      <p class="mb-0">비밀번호 확인</p>
    </div>

    <form
      @submit.prevent="handleCheck"
      class="needs-validation"
      novalidate="novalidate"
    >
      <div class="form-group row">
        <label
          class="col-lg-3 col-form-label form-control-label line-height-9 pt-2 text-2 required"
          >비밀번호</label
        >
        <div class="col-lg-9">
          <input
            v-model="password"
            class="form-control text-3 h-auto py-2"
            type="password"
            required
          />
          <div class="invalid-feedback text-primary" style="display: block">
            {{ error }}
          </div>
        </div>
      </div>
      <div class="form-group row">
        <div class="form-group col-lg-9"></div>
        <div class="form-group col-lg-3">
          <input
            type="submit"
            value="확인"
            class="btn btn-primary btn-modern float-end"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { api } from '@/axios'

const emit = defineEmits(['confirmed'])

const password = ref('')
const error = ref('')

const handleCheck = async () => {
  try {
    // API 요청 바디
    const requestBody = {
      currentPassword: password.value, // 입력한 비밀번호
    }

    // 실제 API 호출
    const response = await api.$post('/mypage/edit/check-password', requestBody)

    if (response.status === 'OK' && response.output === true) {
      // 비밀번호 일치
      // console.log('emit confirmed')
      emit('confirmed')
    } else {
      // 비밀번호 불일치 시 메시지 표시
      error.value = response.message || '비밀번호가 일치하지 않습니다.'
    }
  } catch (e) {
    error.value = '서버와 통신 중 오류가 발생했습니다.'
    console.error(e)
  }
}
</script>
