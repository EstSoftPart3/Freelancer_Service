<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">구글 로그인 중...</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { api } from '@/axios'
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const alertStore = useAlertStore()

onMounted(async () => {
  const needSignup = route.query.needSignup
  const token = route.query.token

  if (needSignup == 'true') {
    const email = route.query.email
    const name = route.query.name

    alertStore.show('구글 연동 완료. 추가 정보 입력이 필요합니다.', 'success')

    router.push({
      path: '/signUp',
      query: {
        loginType: 'PERSONAL',
        isSocial: 'true',
        email: email,
        name: name,
      },
    })
    return
  }

  if (token) {
    localStorage.setItem('accessToken', token)

    try {
      const res = await api.$post('/me')
      const data = res.output

      userStore.setUser({
        userSq: data.userSq,
        userNm: data.userNm,
        userTypeCd: data.userTypeCd,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        isAffiliated: data.isAffiliated,
        affiliatedCompanySq: data.affiliatedCompanySq,
        companyAuthStatusCd: data.companyAuthStatusCd,
        userSignupTypeCd: data.userSignupTypeCd,
      })

      alertStore.show(`${data.userNm}님, 환영합니다.`, 'success')
      router.push('/')
    } catch (error) {
      console.error('유저 정보 불러오기 실패:', error)
      alertStore.show(
        '유저 정보를 불러오는데 실패했습니다. 다시 로그인해주세요.',
        'danger',
      )
      router.push('/login')
    }
  } else {
    alertStore.show('구글 로그인에 실패했습니다. 다시 시도해주세요.', 'danger')
    router.push('/login')
  }
})
</script>
