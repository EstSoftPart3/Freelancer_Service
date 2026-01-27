<template>
  <div>
    <div class="modal-header">
      <h4 class="modal-title text-bold">프로젝트 요약</h4>
      <button
        type="button"
        class="btn-close"
        @click="closeModal"
        aria-hidden="true"
      ></button>
    </div>

    <div class="modal-body bg-f5">
      <div class="mb-3">
        <div class="text-dark fs-5 text-bold">
          [{{ info.address.split(' ')[1] }}] {{ info.projectTtl }}
        </div>
      </div>

      <div class="mb-3">
        <div class="text-dark">
          {{ info.companyNm }} / {{ info.devGradeNm }}
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label text-primary text-bold">주소</label>
        <div class="text-dark">{{ info.address }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label text-primary text-bold">나와의 거리</label>
        <div class="text-dark text-danger text-bold">
          {{ info.distance ? info.distance.toFixed(1) + 'km' : '측정 불가' }}
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-primary" @click="goToDetail">
        상세보기
      </button>
      <button type="button" class="btn btn-primary" @click="openNavigation">
        경로 & 소요시간
      </button>
    </div>
  </div>
</template>

<script setup>
import { useModalStore } from '@/fo/stores/modalStore'
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import { navigateByUserTypeAndProjectSq } from '@/fo/router/userTypeRouter.js'
import { computed, defineProps } from 'vue'

const props = defineProps({
  projectInfo: { type: Object, default: () => ({}) },
})

const info = computed(() => props.projectInfo)
const modalStore = useModalStore()
const userStore = useUserStore()
const alertStore = useAlertStore()

const closeModal = () => {
  modalStore.closeModal()
}

const goToDetail = () => {
  modalStore.closeModal()
  navigateByUserTypeAndProjectSq(userStore.getUserType, info.value.projectSq)
}

const openNavigation = () => {
  // 1. 출발지 정보 (내 위치)
  // 이름이 없으면 '내 위치'로 표시, 좌표는 store에서 가져옴
  const startName = encodeURIComponent(userStore.userAddress || '내 위치')
  const startLat = userStore.userLat
  const startLng = userStore.userLng

  // 2. 목적지 정보 (프로젝트 위치)
  const destName = encodeURIComponent(props.projectInfo.projectTtl)
  const destLat = props.projectInfo.latitude
  const destLng = props.projectInfo.longitude

  // 3. 유효성 검사 (좌표가 하나라도 없으면 실행 불가)
  if (!startLat || !startLng || !destLat || !destLng) {
    alertStore.show('로그인 후 이용해주세요', 'danger')
    return
  }

  /**
   * 카카오맵 길찾기 URL 포맷:
   * https://map.kakao.com/link/from/출발지명,위도,경도/to/목적지명,위도,경도
   */
  const url = `https://map.kakao.com/link/from/${startName},${startLat},${startLng}/to/${destName},${destLat},${destLng}`

  // 새창으로 열기
  window.open(url, '_blank')
}
</script>

<style scoped>
.text-bold {
  font-weight: bold;
}
.bg-f5 {
  background: #f5f5f5;
}
</style>
