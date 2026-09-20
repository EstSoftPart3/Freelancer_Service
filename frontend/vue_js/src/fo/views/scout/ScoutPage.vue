<template>
  <CommonPageHeader
    title=""
    strongText="스카우트 목록"
    :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '스카우트' }]"
  />

  <div class="bg-white border-bottom py-1">
    <div class="container-fluid">
      <ScoutFilterBar @update="updateFilters" @search="handleSearch" />
    </div>
  </div>

  <div class="container my-4">
    <ScoutCardList
      v-if="scoutList.length > 0"
      :scouts="scoutList"
      :selectedSkillTags="selectedSkills"
      @click-skill-tag="handleSkillTagClick"
      @open-resume="handleOpenResume"
    />

    <div v-else class="text-center py-5 text-muted">
      <i class="bi bi-person-exclamation fs-1 d-block mb-2"></i>
      조건에 맞는 인재 검색 결과가 없습니다.
    </div>
  </div>

  <ScoutResumeDetailModal
    ref="scoutResumeModalRef"
    @open-scout-offer="handleOpenScoutOffer"
  />

  <ScoutOfferModal ref="scoutOfferModalRef" />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import ScoutFilterBar from '@/fo/components/common/ScoutFilterBar.vue'
import ScoutCardList from '@/fo/components/scout/ScoutCardList.vue'
import ScoutOfferModal from '@/fo/components/scout/ScoutOfferModal.vue'
import ScoutResumeDetailModal from '@/fo/components/scout/ScoutResumeDetailModal.vue'

import { api } from '@/axios.js'
import { useAlertStore } from '@/fo/stores/alertStore'

const alertStore = useAlertStore()
const isLoading = ref(false)

const scoutOfferModalRef = ref(null)
const scoutResumeModalRef = ref(null)

const scoutList = ref([])

const currentFilters = reactive({
  addressCodeSq: [],
  careerCodeSq: [],
  skillSq: [],
  jobStatusCodeSq: [],
  searchKeyword: '',
  page: 0,
  size: 10
})

const selectedSkills = computed(() => currentFilters.skillSq)

const fetchScouts = async () => {
  isLoading.value = true
  try {

  const addressParam = currentFilters.addressCodeSq.length > 0 ? currentFilters.addressCodeSq.join(',') : undefined
    const careerParam = currentFilters.careerCodeSq.length > 0 ? currentFilters.careerCodeSq.join(',') : undefined
    const skillParam = currentFilters.skillSq.length > 0 ? currentFilters.skillSq.join(',') : undefined
    const jobStatusParam = currentFilters.jobStatusCodeSq.length > 0 ? currentFilters.jobStatusCodeSq.join(',') : undefined

    const res = await api.$get('/v1/freelancers', {
      params: {
        addressCodeSq: addressParam,
        careerCodeSq: careerParam,
        skillSq: skillParam,
        jobStatusCodeSq: jobStatusParam,
        searchKeyword: currentFilters.searchKeyword || undefined,
        page: currentFilters.page,
        size: currentFilters.size
      }
    })

    if (res && res.output) {
      scoutList.value = res.output.freelancers || res.output || []
    } else if (res && res.data) {
      scoutList.value = res.data.freelancers || res.data || []
    }
  } catch (error) {
    alertStore.show('인재 목록을 불러오는데 실패했습니다.', 'danger')
  } finally {
    isLoading.value = false
  }
}

const updateFilters = (filters) => {
  Object.assign(currentFilters, filters)
}

const handleSearch = () => {
  currentFilters.page = 0
  fetchScouts()
}

const handleSkillTagClick = (skill) => {
  const index = currentFilters.skillSq.indexOf(skill)
  if (index > -1) {
    currentFilters.skillSq.splice(index, 1)
  } else {
    currentFilters.skillSq.push(skill)
  }

  currentFilters.page = 0
  fetchScouts()
}

const handleOpenResume = (scoutData) => {
  console.log('카드 클릭 -> 이력서 상세 오픈:', scoutData)
  if (scoutResumeModalRef.value) {
    scoutResumeModalRef.value.openModal(scoutData)
  }
}

const handleOpenScoutOffer = (scoutData) => {
  if (scoutResumeModalRef.value) {
    scoutResumeModalRef.value.closeModal()
  }

  if (scoutOfferModalRef.value) {
    scoutOfferModalRef.value.openModal(scoutData)
  }
}

onMounted(() => {
  fetchScouts()
})
</script>