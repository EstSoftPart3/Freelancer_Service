<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-title">{{
          isDateSelection ? '학력 기간 입력' : '학력 검색'
        }}</span>
        <button class="modal-close" @click="close">×</button>
      </div>
      <div v-if="!isDateSelection">
        <div class="modal-tabs">
          <button
            :class="{ active: tab === 'high' }"
            @click="onTabChange('high')"
          >
            고등학교
          </button>
          <button
            :class="{ active: tab === 'univ' }"
            @click="onTabChange('univ')"
          >
            대학교
          </button>
        </div>
        <div class="modal-search">
          <input
            v-model="search"
            @keyup.enter="fetchSchools"
            placeholder="학교명을 입력하세요"
          />
          <button class="modal-search-btn" @click="fetchSchools">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <circle cx="8" cy="8" r="7" stroke="#fff" stroke-width="2" />
              <path
                d="M13 13l3 3"
                stroke="#fff"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <div class="modal-list">
          <div v-if="schools.length">
            <div v-for="school in schools" :key="school.id" class="modal-item">
              <div>
                <div class="school-name">{{ school.name }}</div>
                <div class="school-address">{{ school.address }}</div>
              </div>
              <button class="modal-add-btn" @click="selectSchool(school)">
                선택
              </button>
            </div>
          </div>
          <div v-else class="modal-empty">검색 결과가 없습니다.</div>
        </div>
        <div class="modal-pagination">
          <button :disabled="page === 1" @click="prevPage">&lt;</button>

          <button
            v-for="p in pageGroup"
            :key="p"
            :class="{ active: page === p }"
            @click="goPage(p)"
          >
            {{ p }}
          </button>

          <button :disabled="page === totalPages" @click="nextPage">
            &gt;
          </button>
        </div>
      </div>
      <div v-else class="date-selection">
        <div class="selected-school">
          <div class="school-name">{{ selectedSchool.name }}</div>
          <div class="school-address">{{ selectedSchool.address }}</div>
        </div>
        <div class="date-inputs">
          <div class="date-input-group">
            <label>입학년월 <span style="color: red">*</span></label>
            <input type="date" v-model="startDate" />
          </div>
          <div class="date-input-group">
            <label>졸업년월</label>
            <input type="date" v-model="endDate" />
          </div>
        </div>
        <div class="date-input-group" style="margin-top: 20px">
          <label>전공명 <span style="color: red">*</span></label>
          <input
            type="text"
            v-model="majorName"
            placeholder="전공명을 입력하세요"
            required
          />
        </div>
      </div>
      <div class="modal-footer">
        <button
          v-if="isDateSelection"
          class="modal-footer-back"
          @click="backToSearch"
        >
          이전
        </button>
        <button
          v-if="isDateSelection"
          class="modal-footer-complete"
          @click="completeSelection"
        >
          완료
        </button>
        <button v-else class="modal-footer-close" @click="close">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, computed, onMounted } from 'vue'
import { ref, defineProps } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import axios from 'axios'
import { useAlertStore } from '@/fo/stores/alertStore'

const alertStore = useAlertStore()
const props = defineProps(['onComplete'])
const modalStore = useModalStore()

const tab = ref('high') // 'high' 또는 'univ'
const search = ref('')
const schools = ref([])
const page = ref(1)
const totalPages = ref(1)
const perPage = '3'
const selectedSchool = ref(null)
const isDateSelection = ref(false)
const startDate = ref('')
const endDate = ref('')
const majorName = ref('')
const groupSize = 3

const currentGroup = computed(() => Math.ceil(page.value / groupSize))

const pageGroup = computed(() => {
  const start = (currentGroup.value - 1) * groupSize + 1
  const end = Math.min(start + groupSize - 1, totalPages.value)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const fetchSchools = async () => {
  const apiKey = '28c12cecb3e103d5b10acd6a0e76209f'
  const gubun = tab.value === 'high' ? 'high_list' : 'univ_list'
  const keyword = search.value.trim()

  try {
    const res = await axios.get(
      'https://www.career.go.kr/cnet/openapi/getOpenApi',
      {
        params: {
          apiKey,
          svcType: 'api',
          svcCode: 'SCHOOL',
          contentType: 'json',
          gubun,
          thisPage: page.value,
          perPage: perPage,
          searchSchulNm: keyword,
        },
      },
    )

    let content = res.data?.dataSearch?.content
    if (!content) {
      content = []
    } else if (!Array.isArray(content)) {
      content = [content]
    }

    schools.value = content.map((item, idx) => ({
      id: item.seq || idx,
      name: item.schoolName,
      address: item.adres || item.addr || '',
      type: tab.value === 'high' ? '고등학교' : '대학교',
    }))

    const totalCount = content.length > 0 ? parseInt(content[0].totalCount) : 0
    console.log('res.data.dataSearch', res.data.dataSearch)
    totalPages.value = Math.ceil(totalCount / perPage)
  } catch (error) {
    console.error('학교 검색 오류:', error)
    schools.value = []
  }
}

// 탭 또는 페이지 변경 시 새로 요청
watch([tab, page], () => {
  fetchSchools()
})

const selectSchool = (school) => {
  selectedSchool.value = {
    name: school.name,
    type: school.type,
    address: school.address,
  }
  isDateSelection.value = true
}

const backToSearch = () => {
  isDateSelection.value = false
  selectedSchool.value = null
  startDate.value = ''
  endDate.value = ''
  majorName.value = ''
}

function formatDate(dateString) {
  if (!dateString) return ''
  return dateString.substring(0, 10).replace(/-/g, '.')
}

const completeSelection = () => {
  if (!startDate.value) {
    alertStore.show('입학년월을 입력해주세요.', 'danger')
    return
  }
  if (!majorName.value) {
    alertStore.show('전공명을 입력하세요.', 'danger')
    return
  }

  const period = endDate.value
    ? `${formatDate(startDate.value)} ~ ${formatDate(endDate.value)}`
    : `${formatDate(startDate.value)} ~`

  props.onComplete &&
    props.onComplete({
      educationSchoolNm: selectedSchool.value.name,
      educationMajorNm: majorName.value,
      educationAdmissionDt: startDate.value,
      educationGraduationDt: endDate.value,
      educationStatusCd: endDate.value ? 1201 : 1202, // 졸업 or 졸업예정
      period,
    })

  close()
}

const close = () => modalStore.closeModal()
const prevPage = () => {
  if (page.value > 1) page.value--
}
const nextPage = () => {
  if (page.value < totalPages.value) page.value++
}
const goPage = (p) => {
  page.value = p
}

const onTabChange = (newTab) => {
  tab.value = newTab
  search.value = ''
  page.value = 1
  totalPages.value = 1
  fetchSchools()
}

onMounted(() => {
  fetchSchools()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 550px;
  max-width: 98vw;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 36px 12px 36px;
  border-bottom: 1px solid #eee;
}
.modal-title {
  font-size: 21px;
  font-weight: bold;
  color: #222;
}
.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #888;
  line-height: 1;
  transition: color 0.2s;
}
.modal-close:hover {
  color: var(--primary);
}
.modal-tabs {
  display: flex;
  gap: 5px;
  padding: 18px 36px 0 36px;
  justify-content: flex-start;
}
.modal-tabs button {
  flex: 0 1 auto;
  padding: 8px 20px;
  border: none;
  background: #f5f5f5;
  color: #333;
  font-weight: 500;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-size: 14px;
  transition:
    background 0.2s,
    color 0.2s;
}
.modal-tabs button.active {
  background: var(--primary);
  color: #fff;
  border-bottom: 2.5px solid var(--primary);
}
.modal-search {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 14px 36px;
}
.modal-search input {
  flex: 1;
  padding: 11px 15px;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
  height: 42px;
  box-sizing: border-box;
}
.modal-search-btn {
  background: var(--primary);
  color: #fff;
  border-radius: 0 4px 4px 0;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid var(--primary);
  border-left: none;
  transition: background 0.2s;
  font-size: 18px;
  box-sizing: border-box;
}
.modal-search-btn:hover {
  background: var(--primary);
}
.modal-search-btn svg {
  display: block;
}
.modal-search-btn svg circle,
.modal-search-btn svg path {
  stroke: #fff;
  transition: stroke 0.2s;
}
.modal-search-btn:hover svg circle,
.modal-search-btn:hover svg path {
  stroke: #fff;
}
.modal-list {
  max-height: 280px;
  overflow-y: auto;
  padding: 0 30px;
}
.modal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  padding: 15px 0;
}
.school-name {
  font-weight: 500;
  color: #222;
  font-size: 16px;
}
.school-address {
  color: #666;
  font-size: 0.9em;
  margin-top: 4px;
}
.modal-add-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-size: 15px;
  flex-shrink: 0;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s;
}
.modal-add-btn:hover {
  background: #0056b3;
}
.modal-empty {
  color: #aaa;
  text-align: center;
  padding: 36px 0;
}
.modal-pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  padding: 14px 36px;
}
.modal-pagination button {
  background: #fff;
  border: 1px solid #f5f5f5;
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 16px;
  cursor: pointer;
  color: var(--primary);
  transition:
    background 0.2s,
    color 0.2s;
}
.modal-pagination button.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.modal-pagination button:disabled {
  background: #fff;
  color: #bbb;
  border-color: #eee;
  cursor: not-allowed;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 36px 10px 36px;
  border-top: 1px solid #eee;
}
.modal-footer-close {
  background: #fff;
  color: #333;
  border: 1px solid #f5f5f5;
  border-radius: 4px;
  padding: 9px 26px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.modal-footer-close:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.date-selection {
  padding: 20px 36px;
}

.selected-school {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.selected-school .school-name {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 8px;
}

.selected-school .school-address {
  color: #666;
  font-size: 0.9em;
}

.date-inputs {
  display: flex;
  gap: 20px;
}

.date-input-group {
  flex: 1;
}

.date-input-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.date-input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.modal-footer-back {
  background: #fff;
  color: #333;
  border: 1px solid #f5f5f5;
  border-radius: 4px;
  padding: 9px 26px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 10px;
}

.modal-footer-back:hover {
  background: #f5f5f5;
}

.modal-footer-complete {
  background: var(--primary);
  color: #fff;
  border: 1px solid var(--primary);
  border-radius: 4px;
  padding: 9px 26px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-footer-complete:hover {
  background: #0056b3;
}
</style>
