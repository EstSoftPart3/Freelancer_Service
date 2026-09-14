<template>
  <!-- Web Layout -->
  <div class="filter-bar border rounded p-3 d-none d-lg-flex align-items-center gap-3 flex-wrap" style="max-width: 1300px; margin: 0 auto;">
    
    <!-- 1. 지역 Dropdown -->
    <div class="dropdown">
      <button class="btn btn-outline btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
        {{ selectedRegionText }}
      </button>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#" @click.prevent="resetFilter('region')">전체</a></li>
        <li v-for="item in regionOptions" :key="item.value">
          <div class="dropdown-item">
            <input 
              type="checkbox" 
              :id="'region-' + item.value" 
              class="form-check-input me-2" 
              :value="item.value"
              v-model="filters.regions"
              @change="emitUpdate"
            >
            <label :for="'region-' + item.value">{{ item.label }}</label>
          </div>
        </li>
      </ul>
    </div>

    <!-- 2. 경력 Dropdown -->
    <div class="dropdown">
      <button class="btn btn-outline btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
        {{ selectedCareerText }}
      </button>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#" @click.prevent="resetFilter('career')">전체</a></li>
        <li v-for="item in careerOptions" :key="item.value">
          <div class="dropdown-item">
            <input 
              type="checkbox" 
              :id="'career-' + item.value" 
              class="form-check-input me-2" 
              :value="item.value"
              v-model="filters.careers"
              @change="emitUpdate"
            >
            <label :for="'career-' + item.value">{{ item.label }}</label>
          </div>
        </li>
      </ul>
    </div>

    <!-- 3. 기술 스택 Dropdown (스카우트용 변경) -->
    <div class="dropdown">
      <button class="btn btn-outline btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
        {{ selectedSkillText }}
      </button>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#" @click.prevent="resetFilter('skill')">전체</a></li>
        <li v-for="item in skillOptions" :key="item.value">
          <div class="dropdown-item">
            <input 
              type="checkbox" 
              :id="'skill-' + item.value" 
              class="form-check-input me-2" 
              :value="item.value"
              v-model="filters.skills"
              @change="emitUpdate"
            >
            <label :for="'skill-' + item.value">{{ item.label }}</label>
          </div>
        </li>
      </ul>
    </div>

    <!-- 4. 구직 상태 Dropdown (스카우트용 추가) -->
    <div class="dropdown">
      <button class="btn btn-outline btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
        {{ selectedJobStatusText }}
      </button>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#" @click.prevent="resetFilter('jobStatus')">전체</a></li>
        <li v-for="item in jobStatusOptions" :key="item.value">
          <div class="dropdown-item">
            <input 
              type="checkbox" 
              :id="'jobstatus-' + item.value" 
              class="form-check-input me-2" 
              :value="item.value"
              v-model="filters.jobStatus"
              @change="emitUpdate"
            >
            <label :for="'jobstatus-' + item.value">{{ item.label }}</label>
          </div>
        </li>
      </ul>
    </div>

    <!-- 5. Search Input -->
    <div class="flex-grow-1">
      <input 
        type="text" 
        class="form-control" 
        placeholder="프리랜서 이름 또는 키워드 입력..." 
        v-model="filters.keyword"
        @keyup.enter="handleSearch"
        style="max-width: 400px;"
      >
    </div>

    <!-- 6. Sort Dropdown -->
    <div class="dropdown">
      <button class="btn btn-outline btn-primary dropdown-toggle text-truncate" type="button" data-bs-toggle="dropdown" style="max-width: 120px;">
        {{ selectedSortText }}
      </button>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#" @click.prevent="setSort('latest')">최신순</a></li>
        <li><a class="dropdown-item" href="#" @click.prevent="setSort('views')">조회순</a></li>
        <li><a class="dropdown-item" href="#" @click.prevent="setSort('popular')">인기순</a></li>
      </ul>
    </div>

    <!-- 검색 버튼 -->
    <button class="btn btn-primary" @click="handleSearch">검색</button>
  </div>
</template>

<script setup>
import { reactive, computed, defineEmits } from 'vue'

const emit = defineEmits(['update', 'search'])

const filters = reactive({
  regions: [],
  careers: [],
  skills: [],
  jobStatus: '',
  keyword: '',
  sort: 'latest'
})

const regionOptions = [
  { label: '서울특별시', value: '11000' },
  { label: '경기도', value: '41000' },
  { label: '인천광역시', value: '28000' },
  { label: '부산광역시', value: '26000' }
]

const careerOptions = [
  { label: '신입', value: '701' },
  { label: '1~3년', value: '702' },
  { label: '4~6년', value: '703' },
  { label: '7년 이상', value: '704' }
]

const skillOptions = [
  { label: 'Java', value: 'JAVA' },
  { label: 'Spring', value: 'SPRING' },
  { label: 'Vue.js', value: 'VUE' },
  { label: 'React', value: 'REACT' }
]

const jobStatusOptions = [
  { label: '구직중', value: 'LOOKING' },
  { label: '재직중', value: 'WORKING' },
  { label: '협의가능', value: 'OPEN' }
]

// 버튼 텍스트 가공 Computed
const selectedRegionText = computed(() => {
  return filters.regions.length ? `지역 (${filters.regions.length})` : '지역 (전체)'
})
const selectedCareerText = computed(() => {
  return filters.careers.length ? `경력 (${filters.careers.length})` : '경력 (전체)'
})
const selectedSkillText = computed(() => {
  return filters.skills.length ? `기술 (${filters.skills.length})` : '기술 (전체)'
})
const selectedJobStatusText = computed(() => {
  const match = jobStatusOptions.find(o => o.value === filters.jobStatus)
  return match ? `구직 상태 (${match.label})` : '구직 상태 (전체)'
})
const selectedSortText = computed(() => {
  if (filters.sort === 'views') return '조회순'
  if (filters.sort === 'popular') return '인기순'
  return '최신순'
})

const emitUpdate = () => {
  emit('update', { ...filters })
}

const handleSearch = () => {
  emit('search', { ...filters })
}

const resetFilter = (type) => {
  if (type === 'region') filters.regions = []
  if (type === 'career') filters.careers = []
  if (type === 'skill') filters.skills = []
  if (type === 'jobStatus') filters.jobStatus = ''
  emitUpdate()
}

const setSort = (sortValue) => {
  filters.sort = sortValue
  emitUpdate()
  handleSearch()
}
</script>