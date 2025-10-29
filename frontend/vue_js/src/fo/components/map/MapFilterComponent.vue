<template>
  <div class="filter-section">
        <!-- 위치 기준 선택 (세그먼트 버튼) -->
        <div class="mb-3">
          <label class="form-label text-color-dark fw-bold d-block mb-2">기준</label>
          <div class="btn-group w-100" role="group" aria-label="위치 기준 선택">
            <button 
              type="button"
              :class="['btn', 'btn-rounded', filters.locationType === 'address' ? 'btn-primary' : 'btn-light']"
              @click="filters.locationType = 'address'"
            >
              내 주소
            </button>
            <button 
              type="button"
              :class="['btn', 'btn-rounded', filters.locationType === 'current' ? 'btn-primary' : 'btn-light']"
              @click="filters.locationType = 'current'"
            >
              현재 위치
            </button>
            <button 
              type="button"
              :class="['btn', 'btn-rounded', filters.locationType === 'custom' ? 'btn-primary' : 'btn-light']"
              @click="selectCustomLocation"
            >
              위치 선택
            </button>
          </div>
        </div>

        <!-- 선택된 위치 정보 (마커 아이콘 + 주소만) -->
        <div class="selected-location-simple mb-3">
          <i class="bi bi-geo-alt-fill text-primary me-2"></i>
          <span class="text-color-dark">{{ displayAddress }}</span>
        </div>
        
        <!-- 반경 필터 (칩 버튼) -->
        <div class="mb-3">
          <label class="form-label text-color-dark fw-bold d-block mb-2">반경</label>
          <div class="radius-chips d-flex gap-2">
            <button 
              v-for="r in [3, 5, 10, 20]" 
              :key="r"
              type="button"
              :class="['btn', 'btn-rounded', filters.radius === String(r) ? 'btn-primary' : 'btn-light']"
              @click="filters.radius = String(r)"
            >
              {{ r }}km
            </button>
          </div>
        </div>
        
        <div class="row">
          <!-- 직무 필터 -->
          <div class="col-md-6 mb-3">
            <label class="form-label text-color-dark fw-bold">직무</label>
            <select v-model="filters.jobRole" class="form-select">
              <option value="">전체</option>
              <option value="프론트엔드">프론트엔드</option>
              <option value="백엔드">백엔드</option>
              <option value="데이터분석가">데이터분석가</option>
              <option value="UI/UX디자이너">UI/UX디자이너</option>
              <option value="기획자">기획자</option>
              <option value="마케터">마케터</option>
              <option value="DevOps">DevOps</option>
              <option value="QA">QA</option>
              <option value="PM">PM</option>
              <option value="데이터엔지니어">데이터엔지니어</option>
              <option value="AI개발자">AI개발자</option>
              <option value="모바일개발자">모바일개발자</option>
              <option value="게임개발자">게임개발자</option>
              <option value="시스템관리자">시스템관리자</option>
            </select>
          </div>
          
          <!-- 검색 입력 -->
          <div class="col-md-6 mb-3">
            <label class="form-label text-color-dark fw-bold">검색어</label>
            <input 
              v-model="filters.keyword"
              type="text" 
              class="form-control" 
              placeholder="프로젝트명, 기업명 검색"
            />
          </div>
        </div>
        
        <!-- 버튼들 -->
        <div class="d-flex gap-2 mt-3">
          <button @click="resetFilters" class="btn btn-rounded btn-light flex-fill">
            초기화
          </button>
          <button @click="applyFilters" class="btn btn-rounded btn-primary flex-fill">
            검색
          </button>
        </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps, watch } from 'vue'

const props = defineProps({
  currentFilters: {
    type: Object,
    default: () => ({
      locationType: 'address',
      radius: '5',
      jobRole: '',
      keyword: ''
    })
  },
  userLocation: {
    type: Object,
    default: () => ({ address: '위치 정보 없음' })
  },
  tempSelectedLocation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['filter-change', 'open-location-modal'])

// 표시할 주소 계산
const displayAddress = computed(() => {
  if (filters.value.locationType === 'custom' && props.tempSelectedLocation) {
    return props.tempSelectedLocation.address
  }
  return props.userLocation?.address || '위치 정보 없음'
})

// 필터 상태 (props로부터 초기화)
const filters = ref({
  locationType: props.currentFilters.locationType || 'address',
  radius: props.currentFilters.radius || '5',
  jobRole: props.currentFilters.jobRole || '',
  keyword: props.currentFilters.keyword || ''
})

// 위치 선택 버튼 클릭 핸들러
const selectCustomLocation = () => {
  filters.value.locationType = 'custom'
  // 부모 컴포넌트에 위치 선택 모달 열기 요청
  emit('open-location-modal')
}

// props 변경 감지하여 필터 업데이트
watch(() => props.currentFilters, (newFilters) => {
  if (newFilters) {
    filters.value = {
      locationType: newFilters.locationType || 'address',
      radius: newFilters.radius || '5',
      jobRole: newFilters.jobRole || '',
      keyword: newFilters.keyword || ''
    }
  }
}, { deep: true, immediate: true })

// 필터 함수들
const resetFilters = () => {
  filters.value = {
    locationType: 'address',
    radius: '5',
    jobRole: '',
    keyword: ''
  }
  applyFilters()
}

const applyFilters = () => {
  emit('filter-change', filters.value)
}
</script>

<style scoped>
.filter-section {
  background: transparent;
}

.text-color-dark {
  color: #333;
}

/* 선택된 위치 정보 (심플) */
.selected-location-simple {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  padding: 0.5rem 0;
}

.selected-location-simple i {
  font-size: 1.1rem;
}

/* 위치 기준 세그먼트 버튼 */
.btn-group {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  overflow: hidden;
}

.btn-group .btn {
  padding: 0.65rem 1rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border: none;
}

/* 반경 칩 버튼 */
.radius-chips {
  justify-content: flex-start;
}

.radius-chips .btn {
  min-width: 70px;
  padding: 0.65rem 1rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

/* 폼 요소 */
.form-label {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.form-control, .form-select {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.65rem 0.75rem;
  font-size: 0.95rem;
}

.form-control:focus, .form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* 반응형 */
@media (max-width: 768px) {
  .btn-group .btn {
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
  }
  
  .radius-chips {
    flex-wrap: wrap;
  }
  
  .radius-chips .btn {
    min-width: 65px;
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
  }
}
</style>
