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
      address: data.address, // 백엔드에서 넘겨주는 필드명 확인 필요
      latitude: data.latitude, // 백엔드에서 넘겨주는 필드명 확인 필요
      longitude: data.longitude, // 백엔드에서 넘겨주는 필드명 확인 필요
    })
  } catch (error) {
    console.error('사용자 조회 실패 : ', error)
  }
}

// const clearLoginState = () => {
//   localStorage.removeItem('accessToken')
//   localStorage.removeItem('refreshToken')
//   localStorage.removeItem('userNm')
//   localStorage.removeItem('userTypeCd')
//   localStorage.removeItem('autoLogin')

//   userStore.clearUser()
// }

function clearLoginStateFunc() {
  localStorage.removeItem('userNm')
  localStorage.removeItem('userTypeCd')
  localStorage.removeItem('autoLogin')
  userStore.clearUser() // store에 로그인 정보 초기화 메서드가 있어야 합니다.
}

setClearLoginState(clearLoginStateFunc)

onMounted(async () => {
  const hasAccessToken = localStorage.getItem('accessToken')
  const hasRefreshToken = localStorage.getItem('refreshToken')
  if (hasAccessToken || hasRefreshToken) {
    await fetchUserInfo()
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
