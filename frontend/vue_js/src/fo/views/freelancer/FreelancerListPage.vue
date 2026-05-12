<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="프리랜서 목록"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '프리랜서' }]"
    />
    <div class="container py-4">
      <!-- 검색창 및 필터 영역 -->
      <div
        class="row align-items-center justify-content-end py-3 border-bottom mb-4"
      >
        <div class="col-md-auto mt-3 mt-md-0">
          <form class="d-flex" @submit.prevent="changeFilter">
            <select v-model="searchType" class="form-select w-auto me-2">
              <option value="all">전체</option>
              <option value="name">이름</option>
              <option value="skill">기술스택</option>
            </select>
            <input
              v-model="keyword"
              class="form-control w-auto me-2"
              type="search"
              placeholder="검색어 입력"
              @keyup.enter="changeFilter"
            />
            <button class="btn btn-primary px-3 me-2" type="submit">
              검색
            </button>
            <button
              type="button"
              class="btn btn-primary px-3"
              @click="openRegisterModal"
            >
              등록
            </button>
          </form>
        </div>
      </div>

      <!-- 카드 목록 -->
      <div class="row">
        <div class="col">
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <p class="text-muted">프리랜서 목록을 불러오는 중입니다...</p>
          </div>

          <template v-else>
            <div class="row" v-if="pagedList.length > 0">
              <div
                v-for="freelancer in pagedList"
                :key="freelancer.id"
                class="col-md-6 col-lg-3 mb-4"
              >
                <article
                  class="freelancer-card rounded overflow-hidden shadow-sm bg-white h-100 d-flex flex-column"
                >
                  <!-- 프로필 이미지 -->
                  <div
                    class="d-flex justify-content-center align-items-center bg-light pt-4 pb-2 position-relative"
                  >
                    <div class="profile-img-wrap">
                      <img
                        :src="
                          freelancer.profileImg || '/img/logos/profile_logo.png'
                        "
                        @error="
                          $event.target.src = '/img/logos/profile_logo.png'
                        "
                        class="profile-img rounded-circle"
                        alt="프로필"
                      />
                    </div>

                    <!-- 하트 버튼 -->
                    <button
                      type="button"
                      class="btn-heart position-absolute top-0 end-0 me-3 mt-3 border-0 bg-transparent"
                      @click="toggleScrap(freelancer)"
                    >
                      <i
                        class="bi bi-heart-fill fs-5"
                        :class="
                          freelancer.isScrap
                            ? 'text-danger'
                            : 'text-secondary opacity-25'
                        "
                      ></i>
                    </button>
                  </div>

                  <!-- 카드 본문 -->
                  <div class="p-3 d-flex flex-column flex-grow-1">
                    <!-- 이름 -->
                    <h5 class="fw-bold mb-1" style="font-size: 1rem">
                      {{ freelancer.name }}
                    </h5>

                    <!-- 이메일 -->
                    <p class="text-muted mb-2" style="font-size: 0.8rem">
                      <i class="bi bi-envelope me-1"></i
                      >{{ freelancer.email || '-' }}
                    </p>

                    <!-- 기술스택 태그 (아이콘 포함) -->
                    <div class="d-flex flex-wrap gap-1 mb-2">
                      <a
                        v-for="skill in freelancer.skills"
                        :key="skill.skillTagNm"
                        href="#"
                        class="btn btn-rounded btn-3d btn-primary btn-sm d-flex align-items-center px-2 py-1"
                        style="font-size: 0.72rem"
                        @click.prevent
                      >
                        <img
                          :src="getSkillIcon(skill.skillTagNm)"
                          :alt="skill.skillTagNm"
                          class="skill-icon me-1"
                        />
                        {{ skill.skillTagNm }}
                      </a>
                    </div>

                    <!-- 한줄 소개 -->
                    <p
                      class="text-muted line-clamp-2 mb-3 flex-grow-1"
                      style="font-size: 0.85rem; line-height: 1.5"
                    >
                      {{ freelancer.intro || '등록된 소개 문구가 없습니다.' }}
                    </p>

                    <!-- 인터뷰 신청하기 버튼: 로그인 + PERSONAL이 아닌 경우만 표시 -->
                    <div class="d-grid mt-auto" v-if="canInterview">
                      <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        @click="openInterviewModal(freelancer)"
                      >
                        인터뷰 신청하기
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <!-- 결과 없음 -->
            <div v-else class="text-center py-5 border rounded bg-light">
              <i class="bi bi-person-x text-muted fs-1 mb-3 d-block"></i>
              <p class="mb-0 text-muted">검색 결과가 없습니다.</p>
            </div>

            <CommonPagination
              :currentPage="currentPage"
              :totalPages="totalPages"
              @update:currentPage="currentPage = $event"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- 프리랜서 등록 모달 -->
    <div
      v-if="showRegisterModal"
      class="modal-backdrop-custom"
      @click.self="closeRegisterModal"
    >
      <div class="modal-box rounded shadow bg-white p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold mb-0">프리랜서 등록하기</h5>
          <button
            type="button"
            class="border-0 bg-transparent fs-5 fw-bold"
            @click="closeRegisterModal"
          >
            X
          </button>
        </div>

        <div class="row g-3">
          <!-- 왼쪽: 이미지 업로드 -->
          <div class="col-5">
            <div
              class="register-img-box d-flex justify-content-center align-items-center bg-light rounded text-muted"
              style="height: 180px; cursor: pointer; border: 2px dashed #ccc"
              @click="triggerFileInput"
            >
              <img
                v-if="registerForm.previewImg"
                :src="registerForm.previewImg"
                class="w-100 h-100 rounded"
                style="object-fit: cover"
                alt="미리보기"
              />
              <span v-else style="font-size: 0.85rem">image</span>
            </div>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="d-none"
              @change="onFileChange"
            />
          </div>

          <!-- 오른쪽: 이름, 이메일 -->
          <div class="col-7">
            <div class="mb-3">
              <label class="form-label fw-semibold">이름</label>
              <input
                v-model="registerForm.name"
                type="text"
                class="form-control"
                disabled
              />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">이메일</label>
              <input
                v-model="registerForm.email"
                type="email"
                class="form-control"
                disabled
              />
            </div>
          </div>

          <!-- 기술 태그 (전체 너비) -->
          <div class="col-12">
            <div class="d-flex align-items-center mb-2">
              <label class="form-label fw-semibold mb-0 me-2">태그</label>
              <button
                type="button"
                class="btn btn-light btn-sm"
                @click="openSkillModal"
              >
                기술 태그 선택 하기
              </button>
            </div>

            <!-- 등록된 태그 뱃지 -->
            <div class="d-flex flex-wrap gap-2 mt-2">
              <a
                v-for="tag in registerForm.skillTags"
                :key="tag.skillTagNm"
                href="#"
                class="btn btn-rounded btn-3d btn-primary btn-sm d-flex align-items-center px-3 py-2"
                @click.prevent
              >
                <img
                  :src="getSkillIcon(tag.skillTagNm)"
                  :alt="tag.skillTagNm"
                  class="skill-icon me-1"
                />
                {{ tag.skillTagNm }}
                <i
                  class="fas fa-times ms-2"
                  @click.prevent="removeSTag(tag)"
                ></i>
              </a>
              <a
                v-for="tag in registerForm.normalTags"
                :key="tag"
                href="#"
                class="btn btn-rounded btn-3d btn-light btn-sm d-flex align-items-center px-3 py-2"
                @click.prevent
              >
                #{{ tag }}
                <i
                  class="fas fa-times ms-2"
                  @click.prevent="removeNTag(tag)"
                ></i>
              </a>
            </div>
          </div>

          <!-- 소개글 (전체 너비) -->
          <div class="col-12">
            <label class="form-label fw-semibold">소개글</label>
            <textarea
              v-model="registerForm.intro"
              class="form-control"
              rows="4"
              placeholder="소개글을 입력해주세요."
              @input="validateText('intro')"
              maxlength="100"
            ></textarea>
            <div class="d-flex justify-content-between mt-1">
              <small class="text-danger" v-if="introError">{{
                introError
              }}</small>
              <small class="text-muted ms-auto"
                >{{ registerForm.intro.length }}/100</small
              >
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            class="btn btn-primary px-4"
            @click="submitRegister"
          >
            등록하기
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary px-4"
            @click="closeRegisterModal"
          >
            닫기
          </button>
        </div>
      </div>
    </div>

    <!-- 인터뷰 신청 모달 -->
    <div
      v-if="showInterviewModal"
      class="modal-backdrop-custom"
      @click.self="closeInterviewModal"
    >
      <div class="modal-box rounded shadow bg-white p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold mb-0">인터뷰 신청하기</h5>
          <button
            type="button"
            class="border-0 bg-transparent fs-5 fw-bold"
            @click="closeInterviewModal"
          >
            X
          </button>
        </div>
        <p class="text-muted mb-3" style="font-size: 0.9rem">
          <strong>{{ selectedFreelancer?.name }}</strong> 님께 인터뷰를
          신청합니다.
        </p>
        <!-- 인터뷰 요청글 (전체 너비) -->
        <div class="col-12">
          <label class="form-label fw-semibold">메시지</label>
          <textarea
            v-model="interviewMessage"
            class="form-control"
            rows="4"
            placeholder="인터뷰 관련 메시지를 입력해주세요."
            @input="validateText('message')"
            maxlength="100"
          ></textarea>
          <div class="d-flex justify-content-between mt-1">
            <small class="text-danger" v-if="messageError">{{
              messageError
            }}</small>
            <small class="text-muted ms-auto"
              >{{ interviewMessage.length }}/100</small
            >
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button
            type="button"
            class="btn btn-primary px-4"
            @click="submitInterview"
          >
            신청하기
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary px-4"
            @click="closeInterviewModal"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import CommonPagination from '@/fo/components/common/CommonPagination.vue'
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useModalStore } from '@/fo/stores/modalStore'
import skillIconMap from '@/assets/skillIconMap.js'
import SkillTagModal from '@/fo/components/community/SkillTagModal.vue'
import { api } from '@/axios'

const userStore = useUserStore()
const alertStore = useAlertStore()
const modalStore = useModalStore()
const router = useRouter()

// 로그인 + PERSONAL이 아닌 경우만 인터뷰 신청 버튼 표시
const canInterview = computed(
  () => userStore.isLoggedIn && userStore.getUserType !== 'PERSONAL',
)

// 기술스택 아이콘
const getSkillIcon = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

const isLoading = ref(false)
const searchType = ref('all')
const keyword = ref('')
const currentPage = ref(1)
const size = 8
const introError = ref('')
const messageError = ref('')

// // 더미 데이터 (API 연동 시 onMounted에서 api.$get으로 교체)
// const freelancerList = ref([
//   {
//     id: 1,
//     name: '김민준',
//     email: 'minjun@example.com',
//     skills: [
//       { skillTagNm: 'Vue.js' },
//       { skillTagNm: 'Spring Boot' },
//       { skillTagNm: 'MySQL' },
//     ],
//     intro:
//       '5년차 풀스택 개발자입니다. 프론트부터 백엔드까지 폭넓게 경험했습니다.',
//     profileImg: null,
//     isScrap: false,
//   },
//   {
//     id: 2,
//     name: '이서연',
//     email: 'seoyeon@example.com',
//     skills: [
//       { skillTagNm: 'Figma' },
//       { skillTagNm: 'Photoshop' },
//       { skillTagNm: 'Illustrator' },
//     ],
//     intro: 'UI/UX 디자이너로 사용자 중심의 디자인을 지향합니다.',
//     profileImg: null,
//     isScrap: false,
//   },
//   {
//     id: 3,
//     name: '박도현',
//     email: 'dohyeon@example.com',
//     skills: [
//       { skillTagNm: 'Java' },
//       { skillTagNm: 'Spring' },
//       { skillTagNm: 'AWS' },
//       { skillTagNm: 'Docker' },
//     ],
//     intro: '안정적인 서버 아키텍처 설계를 전문으로 합니다.',
//     profileImg: null,
//     isScrap: false,
//   },
//   {
//     id: 4,
//     name: '최지우',
//     email: 'jiwoo@example.com',
//     skills: [
//       { skillTagNm: 'React' },
//       { skillTagNm: 'TypeScript' },
//       { skillTagNm: 'Tailwind' },
//     ],
//     intro: '깔끔한 UI 구현과 성능 최적화에 관심이 많습니다.',
//     profileImg: null,
//     isScrap: false,
//   },
//   {
//     id: 5,
//     name: '정현우',
//     email: 'hyunwoo@example.com',
//     skills: [
//       { skillTagNm: 'Python' },
//       { skillTagNm: 'Django' },
//       { skillTagNm: 'PostgreSQL' },
//     ],
//     intro: '데이터 기반 서비스 개발 경험이 풍부합니다.',
//     profileImg: null,
//     isScrap: false,
//   },
//   {
//     id: 6,
//     name: '한수아',
//     email: 'sua@example.com',
//     skills: [
//       { skillTagNm: 'SEO' },
//       { skillTagNm: 'Google Ads' },
//       { skillTagNm: 'Analytics' },
//     ],
//     intro: '디지털 마케팅으로 브랜드 성장을 함께합니다.',
//     profileImg: null,
//     isScrap: false,
//   },
//   {
//     id: 7,
//     name: '윤성호',
//     email: 'sungho@example.com',
//     skills: [{ skillTagNm: 'Kubernetes' }, { skillTagNm: 'Linux' }],
//     intro: '인프라 자동화와 안정적인 배포 파이프라인 구축 전문가입니다.',
//     profileImg: null,
//     isScrap: false,
//   },
//   {
//     id: 8,
//     name: '임지수',
//     email: 'jisu@example.com',
//     skills: [{ skillTagNm: 'Figma' }, { skillTagNm: 'Zeplin' }],
//     intro: '모션 그래픽과 프로덕트 디자인을 함께 다룹니다.',
//     profileImg: null,
//     isScrap: false,
//   },
//   {
//     id: 9,
//     name: '강태양',
//     email: 'taeyang@example.com',
//     skills: [{ skillTagNm: 'Vue.js' }, { skillTagNm: 'Nuxt' }],
//     intro: '접근성과 반응형 웹을 항상 고려하며 개발합니다.',
//     profileImg: null,
//     isScrap: false,
//   },
//   {
//     id: 10,
//     name: '오하늘',
//     email: 'haneul@example.com',
//     skills: [
//       { skillTagNm: 'Node.js' },
//       { skillTagNm: 'MongoDB' },
//       { skillTagNm: 'GraphQL' },
//     ],
//     intro: 'API 설계와 데이터 모델링을 즐깁니다.',
//     profileImg: null,
//     isScrap: false,
//   },
// ])
const freelancerList = ref([])

onMounted(async () => {
  // 로그인 체크
  if (!userStore.isLoggedIn) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    router.push('/login')
    return
  }

  isLoading.value = true
  try {
    const response = await api.$get('/freelancer/all')
    console.log('응답 전체:', response)
    freelancerList.value = response.output.map((f) => ({
      id: f.freelancerSq,
      name: f.userNm,
      email: f.userEmail,
      userSq: f.userSq,
      skills: f.freelancerSkill
        ? f.freelancerSkill.split(',').map((s) => ({ skillTagNm: s.trim() }))
        : [],
      intro: f.freelancerGreetingTxt,
      profileImg: f.profileImgUrl ? `/api/files/${f.profileImgUrl}` : null,
      isScrap: false,
    }))
  } catch (error) {
    console.log('에러 내용:', error)
    alertStore.show('프리랜서 목록 조회 실패', 'danger')
  } finally {
    isLoading.value = false
  }
})

// 검색 필터링
const filteredList = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return freelancerList.value
  return freelancerList.value.filter((f) => {
    if (searchType.value === 'name') return f.name?.toLowerCase().includes(kw)
    if (searchType.value === 'skill')
      return f.skills?.some((s) => s.skillTagNm.toLowerCase().includes(kw))
    return (
      f.name?.toLowerCase().includes(kw) ||
      f.skills?.some((s) => s.skillTagNm.toLowerCase().includes(kw)) ||
      f.intro?.toLowerCase().includes(kw)
    )
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredList.value.length / size)),
)

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * size
  return filteredList.value.slice(start, start + size)
})

const changeFilter = () => {
  currentPage.value = 1
}

const toggleScrap = (freelancer) => {
  if (!userStore.isLoggedIn) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  freelancer.isScrap = !freelancer.isScrap
}

watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// ── 등록 모달 ──
const showRegisterModal = ref(false)
const fileInputRef = ref(null)
const registerForm = ref({
  name: '',
  email: '',
  intro: '',
  previewImg: null,
  file: null,
  skillTags: [],
  normalTags: [],
})

const openRegisterModal = async () => {
  showRegisterModal.value = true
  registerForm.value.name = userStore.userNm

  // userEmail 없으면 API로 다시 가져오기
  if (!userStore.userEmail) {
    try {
      const res = await api.$post('/me')
      registerForm.value.email = res.output.userEmail?.trim() || ''
    } catch (e) {
      console.log('유저 정보 조회 실패', e)
    }
  } else {
    registerForm.value.email = userStore.userEmail?.trim() || ''
  }
}

const closeRegisterModal = () => {
  showRegisterModal.value = false
  registerForm.value = {
    name: '',
    email: '',
    intro: '',
    previewImg: null,
    file: null,
    skillTags: [],
    normalTags: [],
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  registerForm.value.file = file
  registerForm.value.previewImg = URL.createObjectURL(file)
}

// 기술 태그 모달
const openSkillModal = () => {
  modalStore.openModal(SkillTagModal, {
    skillTags: [...registerForm.value.skillTags],
    onConfirm: (skills) => {
      registerForm.value.skillTags = skills
    },
  })
}

const removeSTag = (tag) => {
  registerForm.value.skillTags = registerForm.value.skillTags.filter(
    (t) => t !== tag,
  )
}

const removeNTag = (tag) => {
  registerForm.value.normalTags = registerForm.value.normalTags.filter(
    (t) => t !== tag,
  )
}

// 공통 유효성 검사 함수
const validateText = (target) => {
  const regex = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s.!,]*$/

  if (target === 'intro') {
    if (!regex.test(registerForm.value.intro)) {
      registerForm.value.intro = registerForm.value.intro.replace(
        /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s.!,]/g,
        '',
      )
      introError.value =
        '한글, 영어, 숫자, 마침표(.), 느낌표(!), 쉼표(,)만 입력 가능합니다.'
    } else {
      introError.value = ''
    }
    if (registerForm.value.intro.length > 100) {
      registerForm.value.intro = registerForm.value.intro.slice(0, 100)
    }
  } else if (target === 'message') {
    if (!regex.test(interviewMessage.value)) {
      interviewMessage.value = interviewMessage.value.replace(
        /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s.!,?]/g,
        '',
      )
      messageError.value =
        '한글, 영어, 숫자, 마침표(.), 느낌표(!), 쉼표(,)만 입력 가능합니다.'
    } else {
      messageError.value = ''
    }
    if (interviewMessage.value.length > 100) {
      interviewMessage.value = interviewMessage.value.slice(0, 100)
    }
  }
}

const submitRegister = async () => {
  if (!registerForm.value.name.trim()) {
    alertStore.show('이름을 입력해주세요.', 'danger')
    return
  }

  try {
    const formData = new FormData()

    // 스킬 합치기
    const allSkills = [
      ...registerForm.value.skillTags.map((t) => t.skillTagNm),
      ...registerForm.value.normalTags,
    ].join(', ')

    if (introError.value) {
      alertStore.show('소개글을 확인해주세요.', 'danger')
      return
    }

    // dto를 JSON Blob으로 묶어서 전송
    const dto = {
      userSq: userStore.userSq,
      freelancerSkill: allSkills,
      freelancerGreetingTxt: registerForm.value.intro,
    }
    formData.append(
      'request',
      new Blob([JSON.stringify(dto)], { type: 'application/json' }),
    )

    // 이미지 있으면 추가
    if (registerForm.value.file) {
      formData.append('profileImage', registerForm.value.file)
    }

    await api.$post('/freelancer', formData)

    alertStore.show('등록이 완료되었습니다.', 'success')
    closeRegisterModal()

    // 목록 새로고침
    const response = await api.$get('/freelancer/all')
    freelancerList.value = response.output.map((f) => ({
      id: f.freelancerSq,
      name: f.userNm,
      email: f.userEmail,
      userSq: f.userSq,
      skills: f.freelancerSkill
        ? f.freelancerSkill.split(',').map((s) => ({ skillTagNm: s.trim() }))
        : [],
      intro: f.freelancerGreetingTxt,
      profileImg: f.profileImgUrl ? `/api/files/${f.profileImgUrl}` : null, // 수정
      isScrap: false,
    }))
  } catch (error) {
    console.log('등록 에러:', error)
    // 백엔드 에러 메시지 사용
    const message = error.response?.data?.message || '등록에 실패했습니다.'
    alertStore.show(message, 'danger')
  }
}

// ── 인터뷰 신청 모달 ──
const showInterviewModal = ref(false)
const selectedFreelancer = ref(null)
const interviewMessage = ref('')

const openInterviewModal = (freelancer) => {
  selectedFreelancer.value = freelancer
  interviewMessage.value = ''
  showInterviewModal.value = true
}

const closeInterviewModal = () => {
  showInterviewModal.value = false
  selectedFreelancer.value = null
  interviewMessage.value = ''
  messageError.value = ''
}

const submitInterview = async () => {
  if (!interviewMessage.value.trim()) {
    alertStore.show('오류 메시지를 입력해주세요.', 'danger')
    return
  }

  if (messageError.value) {
    alertStore.show('오류 메시지를 확인해주세요.', 'danger')
    return
  }

  try {
    await api.$post('/interview', {
      userSq: selectedFreelancer.value.userSq,
      companySq: userStore.affiliatedCompanySq,
      interviewRequestTxt: interviewMessage.value,
    })
    alertStore.show('인터뷰 신청이 완료되었습니다.', 'success')
    closeInterviewModal()
  } catch (error) {
    console.log('인터뷰 신청 에러:', error)
    const message =
      error.response?.data?.message || '인터뷰 신청에 실패했습니다.'
    alertStore.show(message, 'danger')
  }
}
</script>

<style scoped>
.freelancer-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.freelancer-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12) !important;
}

.profile-img {
  width: 110px;
  height: 110px;
  object-fit: cover;
}

.skill-icon {
  width: 14px;
  height: 14px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1050;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-box {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.btn-heart {
  line-height: 1;
  cursor: pointer;
}
</style>
