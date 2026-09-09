<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-title">자격증 검색</span>
        <button class="modal-close" @click="close">×</button>
      </div>

      <div class="modal-search">
        <input
          v-model="search"
          @keyup.enter="searchAndResetPage"
          placeholder="자격증을 입력하세요."
        />
        <button class="modal-search-btn" @click="searchAndResetPage">
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
        <div v-if="licenses.length">
          <div
            v-for="license in licenses"
            :key="license.id"
            class="modal-item"
            @click="selectLicense(license)"
          >
            <a class="license-name">{{ license.name }}</a>
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
        <button :disabled="page === totalPages" @click="nextPage">&gt;</button>
      </div>

      <div class="modal-footer">
        <button class="modal-footer-close" @click="close">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, onMounted, computed } from 'vue'
import { api } from '@/axios'
import { useModalStore } from '@/fo/stores/modalStore'
import { useAlertStore } from '@/fo/stores/alertStore'

const props = defineProps({
  onLicenseSelected: Function,
  selectedLicense: {
    type: Array,
    default: () => [],
  },
})
const modalStore = useModalStore()
const alertStroe = useAlertStore()

const search = ref('')
const licenses = ref([])
const page = ref(1)
const totalPages = ref(1)

// ✅ 페이지 그룹 관련 설정
const groupSize = 3
const currentGroup = computed(() => Math.ceil(page.value / groupSize))
const pageGroup = computed(() => {
  const start = (currentGroup.value - 1) * groupSize + 1
  const end = Math.min(start + groupSize - 1, totalPages.value)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const fetchLicenses = async () => {
  try {
    const res = await api.$get('/mypage/resume/certificates', {
      params: {
        searchNm: search.value,
        page: page.value,
        size: 5,
      },
    })

    const items = res.output.certificates || []
    licenses.value = items.map((item) => ({
      id: item.certificateCd,
      name: item.certificateNm,
    }))

    totalPages.value = res.output.totalPages || 1
  } catch (e) {
    console.error('자격증 API 호출 실패', e)
  }
}

watch(page, () => {
  fetchLicenses()
})

const selectLicense = (license) => {
  const selectedList = props.selectedLicense || []
  // console.log('selectedList', selectedList)

  const isDuplicate = selectedList.some(
    (item) => item.certificationCd === license.id,
  )

  if (isDuplicate) {
    alertStroe.show('이미 선택된 자격증입니다.', 'danger')
    return
  }

  props.onLicenseSelected(license)
  close()
}

const searchAndResetPage = () => {
  page.value = 1
  fetchLicenses()
}

const close = () => {
  search.value = ''
  licenses.value = []
  page.value = 1
  modalStore.closeModal()
}

const prevPage = () => {
  if (page.value > 1) page.value--
}
const nextPage = () => {
  if (page.value < totalPages.value) page.value++
}
const goPage = (p) => {
  page.value = p
}

onMounted(() => {
  fetchLicenses()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 450px;
  max-width: 98vw;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.13);
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px 8px 20px;
  border-bottom: 1px solid #eee;
}
.modal-title {
  font-size: 17px;
  font-weight: bold;
  color: #222;
}
.modal-close {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #888;
  line-height: 1;
  transition: color 0.2s;
}
.modal-close:hover {
  color: var(--primary);
}
.modal-search {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 12px 20px 8px 20px;
}
.modal-search input {
  flex: 1;
  padding: 7px 12px;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 4px 0 0 4px;
  font-size: 15px;
  height: 34px;
  box-sizing: border-box;
}
.modal-search-btn {
  background: var(--primary);
  color: #fff;
  border-radius: 0 4px 4px 0;
  width: 34px;
  height: 34px;
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
dal-search-btn svg {
  display: block;
}
.modal-list {
  /* max-height: 180px; */
  overflow-y: auto;
  padding: 0 20px;
}
.modal-item {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #f0f0f0;
  padding: 13px 10px 10px 10px;
}
.license-name {
  font-weight: 500;
  color: #222;
  font-size: 15px;
  margin-bottom: 2px;
}
.license-name:hover {
  color: var(--primary--100);
  cursor: pointer;
  text-decoration: none;
}
.license-meta {
  color: #888;
  font-size: 13px;
}
.modal-empty {
  color: #aaa;
  text-align: center;
  padding: 30px 0;
}
.modal-pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  padding: 10px 20px 10px 0;
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
  padding: 10px 20px 16px 10px;
  border-top: 1px solid #eee;
}
.modal-footer-close {
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 7px 18px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}
.modal-footer-close:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
</style>
