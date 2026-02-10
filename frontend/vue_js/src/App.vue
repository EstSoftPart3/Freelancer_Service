<template>
  <div>
    <CommonHeader />
    <CommonAlert />
    <div class="main">
      <router-view />
      <CommonModalContainer />
    </div>
    <CommonFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import CommonHeader from './fo/components/common/CommonHeader.vue'
import CommonFooter from './fo/components/common/CommonFooter.vue'
import CommonModalContainer from './fo/components/common/CommonModalContainer.vue'
import CommonAlert from './fo/components/common/CommonAlert.vue'
import { useUserStore } from './fo/stores/userStore'
import { api } from '@/axios'
import { setClearLoginState } from '@/axios'

const userStore = useUserStore()

const fetchUserInfo = async () => {
  try {
    const res = await api.$post('/me')
    const data = res.output

    console.log('✅ 서버 응답 데이터:', data)

    userStore.setUser({
      userNm: data.userNm,
      userTypeCd: data.userTypeCd,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      isAffiliated: data.isAffiliated,
    })
  } catch (error) {
    clearLoginState()
  }
}

const clearLoginState = () => {
  localStorage.removeItem('userNm')
  localStorage.removeItem('userTypeCd')
  localStorage.removeItem('autoLogin')

  userStore.clearUser()
}

function clearLoginStateFunc() {
  localStorage.removeItem('userNm')
  localStorage.removeItem('userTypeCd')
  localStorage.removeItem('autoLogin')
  userStore.clearUser() // store에 로그인 정보 초기화 메서드가 있어야 합니다.
}

setClearLoginState(clearLoginStateFunc)

onMounted(() => {
  const token = localStorage.getItem('accessToken')

  // 토큰이 있을 때만 유저 정보를 가져옵니다.
  if (token) {
    fetchUserInfo()
  } else {
    // 토큰이 없으면 비로그인 상태이므로 아무것도 하지 않거나
    // 필요한 초기화만 수행합니다.
    userStore.clearUser()
  }
})
</script>

<style>
#app {
  flex-direction: column;
}

.main {
  flex: 1;
  min-height: 700px;
  padding-top: 100px;
}
</style>
