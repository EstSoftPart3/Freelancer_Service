<template>
  <section>
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <div v-if="isLoading" class="py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">로딩중...</span>
            </div>
            <p class="text-muted">소셜 로그인 처리 중입니다...</p>
          </div>
          <div v-if="errorMsg" class="py-5">
            <p class="text-danger">{{ errorMsg }}</p>
            <router-link to="/login" class="btn btn-primary mt-3">
              로그인 페이지로 이동
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/axios'
import router from '@/fo/router'
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'

const route = useRoute()
const userStore = useUserStore()
const alertStore = useAlertStore()

const isLoading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  const code = route.query.code

  if (!code) {
    errorMsg.value = '인증 코드가 없습니다. 다시 로그인해주세요.'
    isLoading.value = false
    return
  }

  try {
    // 백엔드에 인증 코드 전달 (provider별 엔드포인트)
    const response = await api.$post(`/auth/kakao/login`, { code })

    if (response.isNewUser) {
      // 신규 사용자 → 추가정보 입력 페이지로 이동
      sessionStorage.setItem('tempToken', response.tempToken)
      sessionStorage.setItem('providerCd', 'KAKAO')
      router.push('/social/addinfo')
    } else {
      // 기존 사용자 → 토큰 저장 후 홈으로 이동
      const { accessToken, refreshToken } = response.token
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      // 사용자 정보 조회
      const userInfo = await api.$post('/me')
      const data = userInfo.output
      userStore.setUser({
        userNm: data.userNm,
        userTypeCd: data.userTypeCd,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
      })

      alertStore.show(data.userNm + '님 안녕하세요.', 'success')
      router.push('/')
    }
  } catch (error) {
    console.error('소셜 로그인 처리 실패:', error)
    errorMsg.value =
      error.response?.data?.message ||
      '소셜 로그인 처리 중 오류가 발생했습니다.'
    isLoading.value = false
  }
})
</script>
