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
import { useChatSocketStore } from './fo/stores/chatSocketStore.js'

const userStore = useUserStore()
const route = useRoute()
const modalStore = useModalStore()
const chatSocketStore = useChatSocketStore()

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

// 로그인 되면 websocket 연결 시작

const connectChatSocketIfPossible = () => {
  const token = localStorage.getItem('accessToken')

  if (!token) return
  if (!userStore.userSq) return

  const isCounselor =
    userStore.userType === 'COMPANY' && userStore.userNm === '김상담'

  chatSocketStore.connectWebSocket({
    token,
    userSq: userStore.userSq,
    isCounselor,
  })
}
watch(
  () => [userStore.userSq, userStore.userType, userStore.userNm],
  () => {
    connectChatSocketIfPossible()
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

  chatSocketStore.loadUnreadState()
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
