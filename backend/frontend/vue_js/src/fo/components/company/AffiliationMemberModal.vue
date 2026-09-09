<template>
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="modal-title" id="largeModalLabel">소속 인원 리스트</h3>
      <button
        @click="close"
        type="button"
        class="btn-close"
        data-bs-dismiss="modal"
        aria-hidden="true"
      >
        ×
      </button>
    </div>
    <div
      class="modal-body"
      style="max-height: 80vh; overflow-y: auto; padding: 0"
    >
      <!-- 🔽 여기에 기존 지원자 리스트 코드 전체 삽입 -->
      <div class="container py-1 mt-3">
        <!-- 🔽 필터 UI 추가 영역 -->
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
        <!-- 🔼 필터 UI 끝 -->
        <div class="mb-3">
          <span>현재 선택한 인원 :</span>
          <div class="d-flex flex-wrap gap-2 mt-2">
            <span
              v-for="member in selectedResumes"
              :key="member.id"
              class="btn btn-rounded btn-light d-flex align-items-center gap-2 btn-3d position-relative"
              style="padding-right: 24px"
            >
              <span>{{ member.name }}</span>
              <a
                href="#"
                @click.prevent="removeMember(member.userSq)"
                class="position-absolute end-0 me-2 text-grey text-decoration-none"
                style="top: 50%; transform: translateY(-50%)"
                title="삭제"
                >×</a
              >
            </span>
          </div>
        </div>

        <div class="row">
          <div class="col pt-2 mt-1">
            <hr class="my-4" />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <ul
              v-if="members.length > 0"
              class="simple-post-list m-0 position-relative"
              style="padding: 0"
            >
              <li
                v-for="member in members"
                :key="member.userSq"
                class="d-flex justify-content-between align-items-center"
                style="
                  border-bottom: 1px rgb(230, 230, 230) solid;
                  padding: 8px 10px;
                  font-size: 14px;
                "
              >
                <div class="post-info position-relative">
                  <div class="d-flex gap-2">
                    <a
                      @click="openResumeDetailModal(member.resumeSq)"
                      href="#"
                      class="text-5 m-0"
                      style="font-size: 14px"
                    >
                      {{ member.userNm }}
                    </a>
                    <span> / </span>
                    <a
                      @click="openResumeModal"
                      v-if="member.resumeTtl"
                      href="#"
                      class="text-4 m-0"
                    >
                      {{ member.resumeTtl }}
                    </a>
                    <a
                      v-else
                      class="text-4 m-0 text-grey"
                      style="font-size: 14px"
                    >
                      이력서를 선택하세요
                    </a>
                  </div>

                  <div
                    class="d-flex justify-content-between align-items-center mt-2"
                    style="font-size: 14px"
                  >
                    <div class="d-flex gap-2 flex-wrap">
                      <div
                        class="post-meta text-4"
                        style="font-size: 14px !important"
                      >
                        <span
                          class="text-dark text-uppercase font-weight-semibold"
                          >경력</span
                        >
                        | {{ member.careerYr }}년차
                      </div>
                      <span
                        class="text-dark text-uppercase font-weight-semibold"
                        style="margin-left: 10px"
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
                </div>

                <div class="d-flex gap-2 ms-auto">
                  <button
                    v-if="isSelected(member.userSq)"
                    @click="
                      toggleSelection(
                        member.userSq,
                        member.userNm,
                        member.resumeSq,
                      )
                    "
                    class="btn btn-primary btn-lg"
                    style="font-size: 14px; padding: 8px 12px"
                  >
                    선택됨
                  </button>
                  <button
                    v-else
                    @click="
                      toggleSelection(
                        member.userSq,
                        member.userNm,
                        member.resumeSq,
                      )
                    "
                    class="btn btn-primary btn-outline btn-lg"
                    style="font-size: 14px; padding: 8px 12px"
                  >
                    선택하기
                  </button>
                  <button
                    @click="openResumeSelectModal(member.userSq)"
                    class="btn btn-primary btn-outline btn-lg"
                    style="font-size: 14px; padding: 8px 12px"
                  >
                    이력서 변경
                  </button>
                </div>
              </li>
            </ul>
            <div
              v-else
              class="text-center text-muted py-5"
              style="font-size: 16px"
            >
              검색 결과가 없습니다.
            </div>
          </div>
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
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="changePage(page)"
                  >{{ page }}</a
                >
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
      <div class="modal-footer">
        <button
          @click="confirmApplication(selectedResumes, projectSq)"
          type="button"
          class="btn btn-primary"
          data-bs-dismiss="modal"
        >
          선택완료
        </button>
        <button
          @click="close"
          type="button"
          class="btn btn-light"
          data-bs-dismiss="modal"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useModalStore } from '../../stores/modalStore'
import { useAlertStore } from '../../stores/alertStore'
import ResumeDetailModal from '@/fo/components/mypage/common/ResumeDetailModal.vue'
import ResumeSelectModal from '@/fo/components/mypage/common/ResumeSelectModal.vue'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'
import skillIconMap from '@/assets/skillIconMap.js'

import { api } from '@/axios.js'
import { useRoute } from 'vue-router'

const modalStore = useModalStore()
const alertStore = useAlertStore()
const route = useRoute()

const projectSq = route.params.project_sq

const searchType = ref('all')
const searchText = ref('')
const currentPage = ref('1')
const totalPages = ref('')
const pageSize = ref(5)

const members = ref([])

// const resumes = ref([])
const selectedResumes = ref([])

const search = () => {
  currentPage.value = 1
  fetchAffiliationMemberList()
}

const removeMember = (userSq) => {
  selectedResumes.value = selectedResumes.value.filter(
    (member) => member.userSq !== userSq,
  )
}

// const selectResume = (resume) => {
//   // 1. 기존 대표 이력서 뱃지 제거
//   resumes.value = resumes.value.map((r) => ({
//     ...r,
//     resumeIsRepresentativeYn: 'N',
//   }))

//   // 2. 선택된 이력서에 대표 뱃지 부여
//   const selected = resumes.value.find((r) => r.resumeSq === resume.resumeSq)
//   if (selected) {
//     selected.resumeIsRepresentativeYn = 'Y'
//   }

//   // 3. selectedResume 업데이트 (배열이므로 비우고 다시 push)
//   selectedResumes.splice(0, selectedResumes.length, resume)
// }

const openResumeDetailModal = (resumeSq) => {
  modalStore.openModal(ResumeDetailModal, {
    title: '이력서 상세보기',
    size: 'modal-lg',
    resumeSq: resumeSq,
  })
}

const openResumeSelectModal = (memberSq) => {
  modalStore.openModal(ResumeSelectModal, {
    size: 'modal-lg',
    userSq: memberSq,
    role: 'COMPANY',
  })
}

const confirmApplication = async (selectedResumes, projectSq) => {
  modalStore.openModal(CommonConfirmModal, {
    title: '프로젝트 지원',
    message: '해당 프로젝트에 지원하시겠습니까?',
    onConfirm: async () => {
      try {
        const res = await api.$post(`/projects/applications/${projectSq}`, {
          resumeSq: selectedResumes.map((r) => r.resumeSq),
          projectApplicationTyp: 'COMPANY',
        })
        alertStore.show(res.message || '프로젝트 지원에 성공했습니다.')
        modalStore.closeModal()
        close()
        // router.push({ name: 'ProjectListPage' }) // 삭제 후 이동 (예시)
      } catch (error) {
        console.error('지원 실패:', error)
        alertStore.show('지원 중 오류가 발생했습니다.', 'danger')
      }
    },
  })
}

const toggleSelection = async (memberId, name, resumeSq) => {
  const index = selectedResumes.value.findIndex((r) => r.userSq === memberId)

  if (index === -1) {
    if (!resumeSq) {
      alertStore.show('대표 이력서를 먼저 선택해주세요.', 'danger')
      return
    }
    // 지원 여부 API 호출
    try {
      const res = await api.$get(`/projects/applications/${projectSq}/check`, {
        params: { userSq: memberId },
      })
      if (res.output) {
        alertStore.show('이미 지원한 이력 있는 사용자입니다.', 'danger')
      } else {
        selectedResumes.value.push({ userSq: memberId, name, resumeSq })
      }
    } catch (e) {
      alertStore.show('지원 여부 확인 중 오류가 발생했습니다.', 'danger')
    }
  } else {
    selectedResumes.value.splice(index, 1)
  }
}

const isSelected = (memberId) => {
  return selectedResumes.value.some((r) => r.userSq === memberId)
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
    members.value = output.members
    currentPage.value = output.page
    totalPages.value = output.totalPages
  } catch (e) {
    console.log(e)
  }
}

const getSkillIcon = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

onMounted(() => {
  document.body.style.setProperty('overflow', 'hidden', 'important')
  document.documentElement.style.setProperty('overflow', 'hidden', 'important')
  fetchAffiliationMemberList()
})

onBeforeUnmount(() => {
  document.body.style.removeProperty('overflow')
  document.documentElement.style.removeProperty('overflow')
})

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchAffiliationMemberList()
}
const close = () => {
  modalStore.closeModal()
}
</script>
<style></style>
