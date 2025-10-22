<template>
  <div class="calendar-filter-bar">
    <!-- 필터 영역 -->
    <div class="filters-section">
      <!-- 계약형태 필터 -->
      <div class="filter-dropdown">
        <button
          class="filter-btn"
          type="button"
          data-bs-toggle="dropdown"
          :class="{ active: selectedContractTypes.length > 0 }"
        >
          {{ selectedContractTypeText }}
        </button>
        <ul class="dropdown-menu">
          <li>
            <a class="dropdown-item" href="#" @click.prevent="clearSelection('contractTypes')">
              전체
            </a>
          </li>
          <li v-for="contract in contractTypeOptions" :key="contract.common_code_sq">
            <div class="dropdown-item">
              <input
                type="checkbox"
                :id="'contract-' + contract.common_code_sq"
                :value="contract.common_code_sq"
                v-model="selectedContractTypes"
                class="form-check-input me-2"
              />
              <label :for="'contract-' + contract.common_code_sq">
                {{ contract.common_code_nm }}
              </label>
            </div>
          </li>
        </ul>
      </div>

      <!-- 직무 필터 -->
      <div class="filter-dropdown">
        <button
          class="filter-btn"
          type="button"
          data-bs-toggle="dropdown"
          :class="{ active: selectedJobTypes.length > 0 }"
        >
          {{ selectedJobTypeText }}
        </button>
        <ul class="dropdown-menu">
          <li>
            <a class="dropdown-item" href="#" @click.prevent="clearSelection('jobTypes')">
              전체
            </a>
          </li>
          <li v-for="job in jobTypeOptions" :key="job.common_code_sq">
            <div class="dropdown-item">
              <input
                type="checkbox"
                :id="'job-' + job.common_code_sq"
                :value="job.common_code_sq"
                v-model="selectedJobTypes"
                class="form-check-input me-2"
              />
              <label :for="'job-' + job.common_code_sq">
                {{ job.common_code_nm }}
              </label>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- 검색 영역 -->
    <div class="search-section">
      <div class="search-wrapper">
        <div class="search-icon-wrapper">
          <i class="bi bi-search"></i>
        </div>
        <input
          type="text"
          class="search-input"
          placeholder="기업명, 직무명, 공고명을 검색하세요."
          v-model="searchKeyword"
          @keyup="handleSearch"
        />
        <div v-if="searchKeyword" class="clear-search" @click="clearSearch">
          <i class="bi bi-x-circle"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, computed, watch } from 'vue'
import { api } from '@/axios.js'

const emit = defineEmits(['update'])

// 필터 옵션 데이터
const contractTypeOptions = ref([])
const jobTypeOptions = ref([])

// 선택된 값들 (배열로 다중 선택 지원)
const selectedContractTypes = ref([])
const selectedJobTypes = ref([])

// 검색어
const searchKeyword = ref('')

// 계산된 속성 - 드롭다운 버튼 텍스트
const createSelectedText = (options, selectedIds, defaultText, keyMap) => {
  return computed(() => {
    if (selectedIds.value.length === 0) return `${defaultText}`
    if (selectedIds.value.length === 1) {
      const selected = options.value.find(
        (opt) => opt[keyMap.id] === selectedIds.value[0],
      )
      return selected ? selected[keyMap.name] : defaultText
    }
    return `${defaultText} (${selectedIds.value.length}개)`
  })
}

const selectedContractTypeText = createSelectedText(
  contractTypeOptions,
  selectedContractTypes,
  '계약형태',
  { id: 'common_code_sq', name: 'common_code_nm' },
)

const selectedJobTypeText = createSelectedText(
  jobTypeOptions,
  selectedJobTypes,
  '직무',
  { id: 'common_code_sq', name: 'common_code_nm' },
)

// 필터 옵션 가져오기
const fetchFilterOptions = async () => {
  try {
    const [contractRes, jobTypeRes] = await Promise.all([
      api.$get('/calendar/filter', { params: { type: '계약형태' } }),
      api.$get('/calendar/filter', { params: { type: '직무' } }),
    ])
    contractTypeOptions.value = contractRes.output
    jobTypeOptions.value = jobTypeRes.output
  } catch (e) {
    console.error('필터 데이터 불러오기 실패', e)
  }
}

// 필터 변경 감지 및 부모로 전달
watch(
  [selectedContractTypes, selectedJobTypes, searchKeyword],
  () => {
    const filters = {
      searchKeyword: searchKeyword.value,
      contractTypeCd: selectedContractTypes.value.length > 0 ? selectedContractTypes.value[0] : null,
      jobRoleCd: selectedJobTypes.value.length > 0 ? selectedJobTypes.value[0] : null,
    }
    emit('update', filters)
  },
  { deep: true },
)

// 메서드들
const handleSearch = () => {
  // 검색어 변경 시 즉시 부모로 전달 (watch가 처리)
}

const clearSearch = () => {
  searchKeyword.value = ''
}

const clearSelection = (type) => {
  if (type === 'contractTypes') selectedContractTypes.value = []
  if (type === 'jobTypes') selectedJobTypes.value = []
}

// 초기화
onMounted(fetchFilterOptions)
</script>

<style scoped>
.calendar-filter-bar {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  transition: all 0.3s ease;
}

.search-wrapper:focus-within {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.search-icon-wrapper {
  margin-right: 0.5rem;
  color: #6c757d;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
}

.clear-search {
  margin-left: 0.5rem;
  color: #6c757d;
  cursor: pointer;
  transition: color 0.3s ease;
}

.clear-search:hover {
  color: #dc3545;
}

.filters-section {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-dropdown {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 120px;
  padding: 0.5rem 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.filter-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.filter-btn::after {
  content: '';
  border: solid #6c757d;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 2px;
  transform: rotate(45deg);
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}

.filter-btn.active::after {
  border-color: white;
  transform: rotate(-135deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0.25rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #495057;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item input[type="checkbox"] {
  margin-right: 0.5rem;
}

.dropdown-item label {
  cursor: pointer;
  margin: 0;
  flex: 1;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .calendar-filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .search-section {
    min-width: auto;
  }
  
  .filters-section {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .filter-btn {
    min-width: 100px;
    flex: 1;
  }
}
</style>
