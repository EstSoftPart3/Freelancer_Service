<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h5 class="modal-title">위치 선택</h5>
        <button @click="closeModal" class="btn-close">×</button>
      </div>
      
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label fw-bold">주소 검색</label>
          <div class="input-group">
            <input 
              v-model="postcode" 
              type="text" 
              class="form-control" 
              placeholder="우편번호"
              readonly
            />
            <button @click="openPostcode" class="btn btn-rounded btn-primary">
              우편번호 검색
            </button>
          </div>
        </div>
        
        
        <div v-if="selectedAddress" class="selected-address p-3 bg-light rounded">
          <strong>선택된 주소:</strong><br>
          {{ selectedAddress }}
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="closeModal" class="btn btn-rounded btn-secondary">취소</button>
        <button @click="confirmLocation" class="btn btn-rounded btn-primary" :disabled="!selectedAddress">
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['close', 'location-selected'])

const postcode = ref('')
const selectedAddress = ref('')
const jibunAddress = ref('')
const selectedCoordinates = ref(null)

// 우편번호 검색 (다음 우편번호 서비스)
const openPostcode = () => {
  // 다음 우편번호 서비스 스크립트 로드 확인
  if (typeof window.daum === 'undefined') {
    alert('우편번호 서비스를 로드할 수 없습니다. 잠시 후 다시 시도해주세요.')
    return
  }
  
  new window.daum.Postcode({
    oncomplete: function(data) {
      console.log('다음 우편번호 서비스 전체 데이터:', data)
      
      postcode.value = data.zonecode
      selectedAddress.value = data.address
      jibunAddress.value = data.jibunAddress
      
      // 좌표 정보 확인
      console.log('다음 우편번호 서비스 전체 데이터:', data)
      console.log('좌표 정보 - x:', data.x, 'y:', data.y)
      console.log('roadAddress:', data.roadAddress)
      console.log('jibunAddress:', data.jibunAddress)
      
      // 좌표가 있으면 저장
      if (data.x && data.y) {
        const lat = parseFloat(data.y)
        const lng = parseFloat(data.x)
        
        // 좌표 유효성 검사
        if (!isNaN(lat) && !isNaN(lng)) {
          selectedCoordinates.value = {
            latitude: lat,
            longitude: lng
          }
          console.log('저장된 좌표:', selectedCoordinates.value)
        } else {
          console.log('유효하지 않은 좌표 - y:', data.y, 'x:', data.x)
        }
      } else {
        console.log('좌표 정보 없음! data.x:', data.x, 'data.y:', data.y)
        console.log('다음 우편번호 서비스에서 좌표를 제공하지 않음')
      }
    }
  }).open()
}

// 위치 확인
const confirmLocation = async () => {
  if (!selectedAddress.value) {
    alert('주소를 선택해주세요')
    return
  }
  
  console.log('도로명 주소:', selectedAddress.value)
  console.log('지번 주소:', jibunAddress.value)
  
  // 좌표가 이미 있으면 바로 사용
  if (selectedCoordinates.value) {
    const location = {
      latitude: selectedCoordinates.value.latitude,
      longitude: selectedCoordinates.value.longitude,
      address: selectedAddress.value
    }
    console.log('저장된 좌표 사용:', location)
    emit('location-selected', location)
    return
  }

  try {
    // 카카오 지오코딩 사용 (회원가입과 동일한 방식)
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.addressSearch(selectedAddress.value, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const location = {
            latitude: parseFloat(result[0].y),
            longitude: parseFloat(result[0].x),
            address: selectedAddress.value
          }
          console.log('카카오 지오코딩 성공:', location)
          emit('location-selected', location)
        } else {
          console.log('카카오 지오코딩 실패:', status)
          alert('주소를 좌표로 변환할 수 없습니다')
        }
      })
    } else {
      console.log('카카오 지도 API가 로드되지 않음')
      alert('지도 서비스를 사용할 수 없습니다')
    }
  } catch (error) {
    console.error('주소 변환 실패:', error)
    alert('주소를 좌표로 변환할 수 없습니다')
  }
}

// 모달 닫기
const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.btn-close:hover {
  color: #000;
}

.selected-address {
  margin-top: 15px;
  font-size: 0.9rem;
  color: #333;
}
</style>
