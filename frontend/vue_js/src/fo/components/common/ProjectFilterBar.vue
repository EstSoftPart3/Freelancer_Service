<template>
  <div
    class="filter-bar border rounded p-3 d-flex align-items-center gap-3 flex-wrap"
    style="max-width: 880px; margin: 0 auto"
  >
    <!-- Region Dropdown -->
    <div class="dropdown">
      <button
        class="btn btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
      >
        {{ selectedRegionText }}
      </button>
      <ul class="dropdown-menu" @click.stop>
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="clearSelection('regions')"
            >전체</a
          >
        </li>
        <li v-for="local in localOptions" :key="local.areaSq">
          <div class="dropdown-item">
            <input
              type="checkbox"
              :id="'region-' + local.areaSq"
              :value="local.areaSq"
              v-model="selectedRegions"
              class="form-check-input me-2"
            />
            <label :for="'region-' + local.areaSq">{{ local.areaName }}</label>
          </div>
        </li>
      </ul>
    </div>

    <!-- Career Dropdown -->
    <div class="dropdown">
      <button
        class="btn btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
      >
        {{ selectedCareerText }}
      </button>
      <ul class="dropdown-menu" @click.stop>
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="clearSelection('careers')"
            >전체</a
          >
        </li>
        <li v-for="career in careerOptions" :key="career.common_code_sq">
          <div class="dropdown-item">
            <input
              type="checkbox"
              :id="'career-' + career.common_code_sq"
              :value="career.common_code_sq"
              v-model="selectedCareers"
              class="form-check-input me-2"
            />
            <label :for="'career-' + career.common_code_sq">{{
              career.common_code_nm
            }}</label>
          </div>
        </li>
      </ul>
    </div>

    <!-- Education Dropdown -->
    <div class="dropdown">
      <button
        class="btn btn-outline btn-primary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
      >
        {{ selectedEducationText }}
      </button>
      <ul class="dropdown-menu" @click.stop>
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="clearSelection('educations')"
            >전체</a
          >
        </li>
        <li
          v-for="education in educationOptions"
          :key="education.common_code_sq"
        >
          <div class="dropdown-item">
            <input
              type="checkbox"
              :id="'education-' + education.common_code_sq"
              :value="education.common_code_sq"
              v-model="selectedEducations"
              class="form-check-input me-2"
            />
            <label :for="'education-' + education.common_code_sq">{{
              education.common_code_nm
            }}</label>
          </div>
        </li>
      </ul>
    </div>

    <!-- Job Type Dropdown -->
    <div class="dropdown">
      <button
        class="btn btn-outline btn-primary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
      >
        {{ selectedJobTypeText }}
      </button>
      <ul class="dropdown-menu" @click.stop>
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="clearSelection('jobTypes')"
            >전체</a
          >
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
            <label :for="'job-' + job.common_code_sq">{{
              job.common_code_nm
            }}</label>
          </div>
        </li>
      </ul>
    </div>

    <!-- Search Input -->
    <div class="flex-grow-1">
      <input
        type="text"
        class="form-control"
        placeholder="검색어를 입력하세요..."
        style="max-width: 400px"
        @input="updateKeyword"
        v-model="searchKeyword"
      />
    </div>

    <!-- Search Type Dropdown -->
    <div class="dropdown">
      <button
        class="btn btn-outline btn-primary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
      >
        {{ selectedTargetField }}
      </button>
      <ul class="dropdown-menu">
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="updateTargetField('전체')"
            >전체</a
          >
        </li>
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="updateTargetField('제목')"
            >제목</a
          >
        </li>
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="updateTargetField('작성자명')"
            >작성자명</a
          >
        </li>
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="updateTargetField('내용')"
            >내용</a
          >
        </li>
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="updateTargetField('태그')"
            >태그</a
          >
        </li>
      </ul>
    </div>

    <!-- Sort Dropdown -->
    <div class="dropdown">
      <button
        class="btn btn-outline btn-primary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
      >
        {{ selectedSort }}
      </button>
      <ul class="dropdown-menu">
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="updateSort('최신순')"
            >최신순</a
          >
        </li>
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="updateSort('조회순')"
            >조회순</a
          >
        </li>
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="updateSort('지원자순')"
            >지원자순</a
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, computed, watch } from 'vue'
import { api } from '@/axios.js'
import { useRoute } from 'vue-router'

const emit = defineEmits(['update'])
const route = useRoute()

// Options from API
const localOptions = ref([])
const careerOptions = ref([])
const educationOptions = ref([])
const jobTypeOptions = ref([])

// Selected values (arrays for multi-select)
const selectedRegions = ref([])
const selectedCareers = ref([])
const selectedEducations = ref([])
const selectedJobTypes = ref([])

// Other filter values
const searchKeyword = ref('')
const selectedTargetField = ref('전체')
const selectedSort = ref('최신순')

// Computed properties for dropdown button text
const createSelectedText = (options, selectedIds, defaultText, keyMap) => {
  return computed(() => {
    if (selectedIds.value.length === 0) return `${defaultText} (전체)`
    if (selectedIds.value.length === 1) {
      const selected = options.value.find(
        (opt) => opt[keyMap.id] === selectedIds.value[0],
      )
      return selected ? selected[keyMap.name] : defaultText
    }
    return `${defaultText} (${selectedIds.value.length}개)`
  })
}

const selectedRegionText = createSelectedText(
  localOptions,
  selectedRegions,
  '지역',
  { id: 'areaSq', name: 'areaName' },
)
const selectedCareerText = createSelectedText(
  careerOptions,
  selectedCareers,
  '경력',
  { id: 'common_code_sq', name: 'common_code_nm' },
)
const selectedEducationText = createSelectedText(
  educationOptions,
  selectedEducations,
  '학력',
  { id: 'common_code_sq', name: 'common_code_nm' },
)
const selectedJobTypeText = createSelectedText(
  jobTypeOptions,
  selectedJobTypes,
  '직종',
  { id: 'common_code_sq', name: 'common_code_nm' },
)

// Fetch options from API
const basePath = route.path.includes('/affiliation')
  ? '/affiliations'
  : '/projects'
const fetchFilterOptions = async () => {
  try {
    const [regionRes, careerRes, educationRes, jobTypeRes] = await Promise.all([
      api.$get(`${basePath}/filters`, { params: { type: '지역' } }),
      api.$get(`${basePath}/filters`, { params: { type: '경력' } }),
      api.$get(`${basePath}/filters`, { params: { type: '학력' } }),
      api.$get(`${basePath}/filters`, { params: { type: '직종' } }),
    ])
    localOptions.value = regionRes.output
    careerOptions.value = careerRes.output
    educationOptions.value = educationRes.output
    jobTypeOptions.value = jobTypeRes.output
  } catch (e) {
    console.error('필터 데이터 불러오기 실패', e)
  }
}

onMounted(fetchFilterOptions)

// Watch for changes and emit update
watch(
  [
    selectedRegions,
    selectedCareers,
    selectedEducations,
    selectedJobTypes,
    searchKeyword,
    selectedTargetField,
    selectedSort,
  ],
  () => {
    const filters = {
      addressCodeSq: selectedRegions.value,
      projectDeveloperGradeCd: selectedCareers.value,
      educationCd: selectedEducations.value,
      jobRoleCd: selectedJobTypes.value,
      searchKeyword: searchKeyword.value,
      searchType: selectedTargetField.value,
    }
    if (selectedSort.value === '최신순') {
      filters.sortBy = 'project_start_dt'
      filters.sortOrder = 'desc'
    } else if (selectedSort.value === '조회순') {
      filters.sortBy = 'view_count'
      filters.sortOrder = 'desc'
    } else if (selectedSort.value === '지원자순') {
      filters.sortBy = 'applicant_count'
      filters.sortOrder = 'desc'
    }
    emit('update', filters)
  },
  { deep: true },
)

// Methods to handle selection from template
const updateKeyword = (event) => {
  searchKeyword.value = event.target.value
}

const updateTargetField = (value) => {
  selectedTargetField.value = value
}

const updateSort = (value) => {
  selectedSort.value = value
}

const clearSelection = (type) => {
  if (type === 'regions') selectedRegions.value = []
  if (type === 'careers') selectedCareers.value = []
  if (type === 'educations') selectedEducations.value = []
  if (type === 'jobTypes') selectedJobTypes.value = []
}
</script>
