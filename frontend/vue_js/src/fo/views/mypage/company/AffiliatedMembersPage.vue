ew
<template>
  <div>
    <!-- 🔽 필터/검색 UI -->
    <div class="row align-items-center mt-3 mb-2">
      <div class="col-md-12 d-flex justify-content-end gap-2">
        <select
          v-model="searchType"
          class="form-select form-select-sm w-auto"
          style="font-size: 14px; padding: 4px"
        >
          <option value="all">전체</option>
          <option value="name">이름</option>
          <option value="skill">사용 기술</option>
        </select>
        <input
          v-model="searchText"
          type="text"
          class="form-control form-control-sm w-auto"
          placeholder="검색어 입력"
          style="font-size: 14px; padding: 4px"
        />
        <button
          class="btn btn-primary btn-sm"
          style="font-size: 14px; padding: 4px"
          @click="search"
        >
          검색
        </button>
      </div>
    </div>

    <div class="row">
      <div class="col pt-2 mt-1">
        <hr class="my-4" />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div
          v-if="members.length === 0"
          class="text-muted py-3"
          style="font-size: 14px"
        >
          소속 인원이 없습니다.
        </div>
        <ul class="simple-post-list m-0 position-relative" style="padding: 0">
          <li
            v-for="member in members"
            :key="member.id"
            style="
              border-bottom: 1px rgb(230, 230, 230) solid;
              padding: 8px 10px;
              font-size: 14px;
            "
            class="d-flex flex-column gap-2"
          >
            <!-- 상단: 이름/소개 + 퇴사처리 버튼 -->
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex gap-2 align-items-center">
                <a
                  @click="openResumeSelectModal(member.userSq)"
                  class="text-5 m-0"
                  style="font-size: 14px; cursor: pointer"
                  >{{ member.userNm }} /</a
                >
                <a
                  href="#"
                  class="text-4 m-0"
                  style="font-size: 14px"
                  @click.prevent="openResumeDetail(member.resumeSq)"
                  >{{ member.resumeTtl }}</a
                >
              </div>
              <span
                v-if="member.leavedYn === 401"
                class="btn btn-primary btn-outline btn-lg"
                style="font-size: 14px; padding: 8px 12px"
                @click="confirmFire(6, member.userSq)"
                >퇴사 처리</span
              >
              <span
                v-else
                class="btn btn-light btn-lg"
                style="font-size: 14px; padding: 8px 12px"
                >퇴사</span
              >
            </div>

            <div
              class="d-flex justify-content-between align-items-center"
              style="font-size: 14px"
            >
              <!-- 좌측: 경력 / 사용 기술 -->
              <div class="d-flex align-items-center gap-2">
                <div class="post-meta text-4">
                  <span class="text-dark text-uppercase font-weight-semibold"
                    >경력</span
                  >
                  | {{ member.careerYr }}년차
                </div>
                <div class="d-flex align-items-center gap-2 ms-3">
                  <span class="text-dark text-uppercase font-weight-semibold"
                    >사용 기술</span
                  >
                  |
                  <div
                    v-for="skill in member.skillTagNms"
                    :key="skill.name"
                    class="btn d-flex align-items-center gap-2 border-0"
                    style="padding: 2px 6px"
                  >
                    <img :src="getSkillIcon(skill)" width="16" />
                    {{ skill }}
                  </div>
                </div>
              </div>
              <!-- 우측: 입사일자/퇴사일자 -->
              <div class="text-muted" style="white-space: nowrap">
                <span class="text-dark text-uppercase font-weight-semibold">
                  {{ member.careerEndDt ? '퇴사일자' : '입사일자' }}
                </span>
                |
                {{ member.careerEndDt || member.careerStartDt }}
              </div>
            </div>
          </li>
        </ul>

        <!-- 페이징 -->
        <div class="mt-5">
          <ul class="pagination float-end">
            <li class="page-item">
              <a
                class="page-link"
                href="#"
                @click.prevent="changePage(currentPage - 1)"
                ><i class="fas fa-angle-left"></i
              ></a>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: currentPage === page }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{
                page
              }}</a>
            </li>
            <li class="page-item">
              <a
                class="page-link"
                href="#"
                @click.prevent="changePage(currentPage + 1)"
                ><i class="fas fa-angle-right"></i
              ></a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/axios.js'

import { useModalStore } from '../../../stores/modalStore.js'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'
import ResumeSelectModal from '@/fo/components/mypage/common/ResumeSelectModal.vue'
import ResumeDetailModal from '@/fo/components/mypage/common/ResumeDetailModal.vue'
import iconMap from '@/assets/skillIconMap.js'

const searchType = ref('all')
const searchText = ref('')
const currentPage = ref('1')
const totalPages = ref('1')
const pageSize = ref(5)

const modalStore = useModalStore()

onMounted(() => {
  fetchAffiliationMemberList()
})

const members = ref([])

const getSkillIcon = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '') // 공백/점 제거
  return iconMap[key] || iconMap.default
}

const search = () => {
  currentPage.value = 1
  fetchAffiliationMemberList()
}

const fetchAffiliationMemberList = async () => {
  try {
    const response = await api.$get('/companies', {
      withCredentials: true,
      params: {
        page: currentPage.value,
        size: pageSize.value,
        searchType: searchType.value === 'all' ? null : searchType.value,
        keyword: searchText.value.trim() || null,
      },
    })

    const output = response.output
    console.log('output', output)
    members.value = output.members
    currentPage.value = output.page
    totalPages.value = Math.max(1, output.totalPages)
  } catch (e) {
    console.log(e)
  }
}

const openResumeSelectModal = (memberSq) => {
  modalStore.openModal(ResumeSelectModal, {
    size: 'modal-lg',
    userSq: memberSq,
    role: 'COMPANY',
    onConfirm: () => {
      fetchAffiliationMemberList()
    },
  })
}

function openResumeDetail(resumeSq) {
  console.log('resumeSq', resumeSq)
  modalStore.openModal(ResumeDetailModal, {
    title: '이력서 상세보기',
    size: 'modal-lg',
    resumeSq: resumeSq,
    onConfirm: () => {
      modalStore.closeModal()
    },
  })
}

const fireMember = async (companySq, userSq) => {
  try {
    await api.$patch(`/companies/${companySq}`, {
      withCredentials: true,
      userSq: userSq,
      newStatus: '퇴사',
    })
  } catch (e) {
    console.error(e)
  }
}

const confirmFire = (companySq, userSq) => {
  modalStore.openModal(CommonConfirmModal, {
    title: '소속 인원 퇴사 처리',
    message: '해당 인원을 퇴사처리 하겠습니까?',
    onConfirm: async () => {
      await fireMember(companySq, userSq)
      await fetchAffiliationMemberList()
      modalStore.closeModal()
    },
  })
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchAffiliationMemberList()
}
</script>

<style scoped>
.simple-post-list {
  list-style: none;
  padding: 0;
}
</style>
