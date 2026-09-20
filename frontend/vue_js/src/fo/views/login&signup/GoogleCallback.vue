<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/axios'
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'

const route = useRoute()
const userStore = useUserStore()
const alertStore = useAlertStore()

let isProcessing = false

onMounted(async () => {
  if (isProcessing) return
  isProcessing = true

  const authCode = route.query.code

  if (!authCode) {
    alertStore.show('구글 인증 코드가 올바르지 않습니다.', 'danger')
    isProcessing = false
    window.location.href = '/login'
    return
  }

  try {
    const redirectUri = window.location.origin + '/oauth/callback'

    const response = await api.$post('/v1/auth/google/login', {
      auth_code: authCode,
      redirect_uri: redirectUri
    })

    const resData = response.output || response.data || response
    const token = resData.access_token || resData.accessToken

    if (token) {
      localStorage.setItem('accessToken', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      userStore.setUser({
        userSq: resData.user_sq || resData.userSq,
        userNm: resData.user_nm || resData.userNm,
        userTypeCd: resData.userTypeCd || resData.user_type_cd,
        addressSq: resData.addressSq
      })

      alertStore.show('구글 로그인에 성공했습니다.', 'success')

      window.location.href = '/'
    } else {
      throw new Error('토큰 정보가 응답에 없습니다.')
    }

  } catch (error) {
    console.error('구글 로그인 실패 원인:', error)
    
        if (localStorage.getItem('accessToken')) {
      window.location.href = '/'
    } else {
      alertStore.show('구글 로그인 처리에 실패했습니다.', 'danger')
      window.location.href = '/login'
    }
  } finally {
    isProcessing = false
  }
})
</script>

<template>
  <div class="d-flex justify-content-center align-items-center my-5">
    <p>구글 로그인 처리 중입니다...</p>
  </div>
</template>