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

    localStorage.setItem('userNm', data.userNm)
    localStorage.setItem('userTypeCd', data.userTypeCd)

    userStore.setUser({
      // 인턴 추가 작업: userSq 추가
      userSq: data.userSq,
      userNm: data.userNm,
      userTypeCd: data.userTypeCd,
    })
  } catch (error) {
    // console.error('자동 로그인 실패:', error)

    // 리프레시 토큰도 없을 경우까지 포함해서 처리
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
  fetchUserInfo()
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
