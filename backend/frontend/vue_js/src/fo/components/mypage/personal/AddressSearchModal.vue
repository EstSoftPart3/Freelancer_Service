<template>
  <div class="modal-layer">
    <div class="modal-content">
      <div class="modal-header">
        <button class="close-btn" @click="modalStore.closeModal()">×</button>
      </div>
      <div id="daum-postcode"></div>
    </div>
  </div>
</template>

<script setup>
/* global daum, kakao */ // 주소/좌표 API 전역 선언

import { onMounted, defineProps } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'

const props = defineProps({
  onComplete: Function,
})

const modalStore = useModalStore()

onMounted(() => {
  new daum.Postcode({
    onComplete: function (data) {
      const addr =
        data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
      const parts = addr.split(' ')
      let sido = parts[0] || ''
      let sigungu = parts[1] || ''
      // 복합명칭(예: "광주 동구") 처리
      if (sido.endsWith('시') && parts.length > 2) {
        sigungu = parts[1] + ' ' + parts[2]
      }
      if (!sido || !sigungu) {
        alert(
          '주소에서 시군구 정보를 추출할 수 없습니다. 다른 주소를 선택해주세요.',
        )
        return
      }

      // 좌표 변환
      const geocoder = new kakao.maps.services.Geocoder()
      geocoder.addressSearch(addr, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          const latitude = result[0].y
          const longitude = result[0].x

          props.onComplete?.({
            zonecode: data.zonecode,
            address: addr,
            sido,
            sigungu,
            latitude,
            longitude,
          })

          // console.log('[주소 선택 완료]', {
          //   zonecode: data.zonecode,
          //   address: addr,
          //   sido,
          //   sigungu,
          //   latitude,
          //   longitude,
          // })

          modalStore.closeModal()
        } else {
          alert('선택한 주소의 좌표 정보를 찾을 수 없습니다.')
          console.warn('[좌표 변환 실패]', addr)
        }
      })
    },
  }).embed(document.getElementById('daum-postcode'))
})
</script>

<style scoped>
.modal-layer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  position: relative;
  width: 540px;
  max-width: 95vw;
  background: #fff;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
}
.modal-header {
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  z-index: 10;
}
#daum-postcode {
  min-width: 0;
  width: 100% !important;
}
</style>
