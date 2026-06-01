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
import { onMounted, watch, nextTick } from 'vue'
import CommonHeader from './fo/components/common/CommonHeader.vue'
import CommonFooter from './fo/components/common/CommonFooter.vue'
import CommonModalContainer from './fo/components/common/CommonModalContainer.vue'
import CommonAlert from './fo/components/common/CommonAlert.vue'
import { useUserStore } from './fo/stores/userStore'
import { api } from '@/axios'
import { setClearLoginState } from '@/axios'
import { useRoute } from 'vue-router'
import { useModalStore } from '@/fo/stores/modalStore'
import AttendanceCheckCompleteModal from '@/fo/components/attendance/AttendanceCheckCompleteModal.vue'

const userStore = useUserStore()
const route = useRoute()
const modalStore = useModalStore()

const fetchUserInfo = async () => {
  try {
    const res = await api.$post('/me')
    const data = res.output

    // console.log('✅ 서버 응답 데이터:', data)

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
    })
  } catch (error) {
    // console.error('유저 정보 불러오기 실패:', error)
    clearLoginState()
  }
}

const clearLoginState = () => {
  userStore.clearUser()
}

function clearLoginStateFunc() {
  userStore.clearUser() // store에 로그인 정보 초기화 메서드가 있어야 합니다.
}

setClearLoginState(clearLoginStateFunc)

watch(
  () => route.fullPath,
  async () => {
    const shouldShowAttendanceModal = sessionStorage.getItem(
      'showAttendanceCheckModal',
    )

    if (shouldShowAttendanceModal === 'Y') {
      await nextTick()

      setTimeout(() => {
        modalStore.openModal(AttendanceCheckCompleteModal, {
          size: 'modal-sm modal-dialog-centered',
        })

        sessionStorage.removeItem('showAttendanceCheckModal')
      }, 300)
    }
  },
  { immediate: true },
)

onMounted(() => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    fetchUserInfo()
  } else {
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
