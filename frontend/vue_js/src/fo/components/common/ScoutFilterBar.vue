<template>
  <div class="filter-bar border rounded p-3 d-flex align-items-center gap-3 flex-wrap"
    style="max-width: 1300px; margin: 0 auto"
  >
    <div class="dropdown">
      <button class="btn btn-outline btn-primary dropdown-toggle fw-semibold" 
      type="button" 
      data-bs-toggle="dropdown"
      style="max-width: 130px">
        {{ selectedRegionText }}
      </button>
      <ul class="dropdown-menu" @click.stop>
        <li>
          <a class="dropdown-item" href="#" @click.prevent="clearSelection('regions')">전체</a>
        </li>
        <li v-for="(local, index) in localOptions" :key="getItemKey(local, index, 'areaSq')">
          <div class="dropdown-item">
            <input
              type="checkbox"
              :id="'scout-region-' + local.areaSq"
              :value="local.areaSq"
              v-model="selectedRegions"
              class="form-check-input me-2"
            />
            <label :for="'scout-region-' + local.areaSq" class="form-check-label">{{ local.areaName }}</label>
          </div>
        </li>
      </ul>
    </div>

    <div class="dropdown">
      <button class="btn btn-outline btn-primary dropdown-toggle fw-semibold" 
      type="button" 
      data-bs-toggle="dropdown"
      style="max-width: 130px">
        {{ selectedCareerText }}
      </button>
      <ul class="dropdown-menu" @click.stop>
        <li>
          <a class="dropdown-item" href="#" @click.prevent="clearSelection('careers')">전체</a>
        </li>
        <li v-for="(career, index) in careerOptions" :key="getItemKey(career, index, 'common_code_sq')">
          <div class="dropdown-item">
            <input
              type="checkbox"
              :id="'scout-career-' + career.common_code_sq"
              :value="career.common_code_sq"
              v-model="selectedCareers"
              class="form-check-input me-2"
            />
            <label :for="'scout-career-' + career.common_code_sq" class="form-check-label">{{ career.common_code_nm }}</label>
          </div>
        </li>
      </ul>
    </div>

    <div class="dropdown">
      <button class="btn btn-outline btn-primary dropdown-toggle fw-semibold" 
      type="button" 
      data-bs-toggle="dropdown"
      style="max-width: 140px">
        {{ selectedSkillText }}
      </button>
      <ul class="dropdown-menu" style="max-height: 300px; overflow-y: auto;" @click.stop>
        <li>
          <a class="dropdown-item" href="#" @click.prevent="clearSelection('skills')">전체</a>
        </li>
        <li v-for="(skill, index) in skillOptions" :key="getItemKey(skill, index, 'skillSq')">
          <div class="dropdown-item">
            <input
              type="checkbox"
              :id="'scout-skill-' + (skill.skillSq || skill.skill_sq || skill.common_code_sq)"
              :value="skill.skillSq || skill.skill_sq || skill.common_code_sq"
              v-model="selectedSkills"
              class="form-check-input me-2"
            />
            <label :for="'scout-skill-' + (skill.skillSq || skill.skill_sq || skill.common_code_sq)" class="form-check-label">
              {{ skill.skillName || skill.skill_name || skill.common_code_nm }}
            </label>
          </div>
        </li>
      </ul>
    </div>

    <div class="dropdown">
      <button class="btn btn-outline btn-primary dropdown-toggle fw-semibold" 
      type="button" 
      data-bs-toggle="dropdown"
      style="max-width: 140px">
        {{ selectedJobStatusText }}
      </button>
      <ul class="dropdown-menu" style="max-height: 300px; overflow-y: auto;" @click.stop>
        <li>
          <a class="dropdown-item" href="#" @click.prevent="clearSelection('jobStatus')">전체</a>
        </li>
        <li v-for="(status, index) in jobStatusOptions" :key="getItemKey(status, index, 'common_code_sq')">
          <div class="dropdown-item">
            <input
              type="checkbox"
              :id="'scout-status-' + (status.common_code_sq || status.commonCodeSq || status.codeSq)"
              :value="status.common_code_sq || status.commonCodeSq || status.codeSq"
              v-model="selectedJobStatus"
              class="form-check-input me-2"
            />
            <label :for="'scout-status-' + (status.common_code_sq || status.commonCodeSq || status.codeSq)" class="form-check-label">
              {{ status.common_code_nm || status.commonCodeNm || status.codeNm }}
            </label>
          </div>
        </li>
      </ul>
    </div>

    <div class="flex-grow-1">
      <input
        type="text"
        class="form-control"
        placeholder="프리랜서 이름 또는 키워드 입력..."
        style="max-width: 400px"
        v-model="searchKeyword"
        @keyup.enter="$emit('search')"
      />
    </div>

    <button class="btn btn-primary" @click="$emit('search')">검색</button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineEmits } from 'vue'
import { api } from '@/axios.js'

const emit = defineEmits(['update', 'search'])

const localOptions = ref([])
const careerOptions = ref([])
const skillOptions = ref([])
const jobStatusOptions = ref([])

const selectedRegions = ref([])
const selectedCareers = ref([])
const selectedSkills = ref([])
const selectedJobStatus = ref([])
const searchKeyword = ref('')

const getItemKey = (item, index, preferredKey) => {
  if (!item) return index
  return item[preferredKey] ?? item.common_code_sq ?? item.commonCodeSq ?? item.areaSq ?? item.skillSq ?? item.skill_sq ?? item.codeSq ?? item.value ?? index
}

const getItemName = (item, preferredName) => {
  if (!item) return ''
  return item[preferredName] ?? item.common_code_nm ?? item.commonCodeNm ?? item.areaName ?? item.skillName ?? item.skill_name ?? item.codeNm ?? item.label ?? ''
}

const fetchFilterOptions = async () => {
  try {
    const res = await api.$get('/v1/scout/filters')
    console.log('[스카우트 필터 응답 raw 데이터]:', res)

    // axios 응답 구조에 맞춰 3단계 확인
    let data = res
    if (res && res.data) data = res.data
    if (data && data.output) data = data.output

    console.log('[파싱된 필터 데이터]:', data)

    localOptions.value = data.addresses || data.addressList || data.localList || []
    careerOptions.value = data.careers || data.careerList || []
    skillOptions.value = data.skills || data.skillList || []
    jobStatusOptions.value = data.jobStatuses || data.jobStatusList || []

  } catch (e) {
    console.error('스카우트 필터 옵션 로드 실패:', e)
  }
}

onMounted(fetchFilterOptions)

// 드롭다운 버튼 표시 텍스트 Computed
const selectedRegionText = computed(() => {
  if (selectedRegions.value.length === 0) return '지역 (전체)'
  if (selectedRegions.value.length === 1) {
    const selected = localOptions.value.find(
      (opt) => (opt.areaSq || opt.value) === selectedRegions.value[0]
    )
    return selected ? getItemName(selected, 'areaName') : '지역'
  }
  return `지역 (${selectedRegions.value.length}개)`
})

const selectedCareerText = computed(() => {
  if (selectedCareers.value.length === 0) return '경력 (전체)'
  if (selectedCareers.value.length === 1) {
    const selected = careerOptions.value.find(
      (opt) => (opt.common_code_sq || opt.value) === selectedCareers.value[0]
    )
    return selected ? getItemName(selected, 'common_code_nm') : '경력'
  }
  return `경력 (${selectedCareers.value.length}개)`
})

const selectedSkillText = computed(() => {
  if (selectedSkills.value.length === 0) return '기술 스택 (전체)'
  if (selectedSkills.value.length === 1) {
    const selected = skillOptions.value.find(
      (opt) => (opt.skillSq || opt.skill_sq || opt.common_code_sq || opt.value) === selectedSkills.value[0]
    )
    return selected ? getItemName(selected, 'skillName') : '기술 스택'
  }
  return `기술 스택 (${selectedSkills.value.length}개)`
})

const selectedJobStatusText = computed(() => {
  if (selectedJobStatus.value.length === 0) return '구직 상태 (전체)'
  if (selectedJobStatus.value.length === 1) {
    const selected = jobStatusOptions.value.find(
      (opt) => (opt.common_code_sq || opt.commonCodeSq || opt.codeSq || opt.value) === selectedJobStatus.value[0]
    )
    return selected ? getItemName(selected, 'common_code_nm') : '구직 상태'
  }
  return `구직 상태 (${selectedJobStatus.value.length}개)`
})

watch(
  [selectedRegions, selectedCareers, selectedSkills, selectedJobStatus, searchKeyword],
  () => {
    emit('update', {
      addressCodeSq: selectedRegions.value,
      careerCodeSq: selectedCareers.value,
      skillSq: selectedSkills.value,
      jobStatusCodeSq: selectedJobStatus.value,
      searchKeyword: searchKeyword.value
    })
  },
  { deep: true }
)

const clearSelection = (type) => {
  if (type === 'regions') selectedRegions.value = []
  if (type === 'careers') selectedCareers.value = []
  if (type === 'skills') selectedSkills.value = []
  if (type === 'jobStatus') selectedJobStatus.value = []
}
</script>

<style scoped>
.filter-bar .dropdown .btn-outline-primary {
  border-width: 2px;
}
</style>