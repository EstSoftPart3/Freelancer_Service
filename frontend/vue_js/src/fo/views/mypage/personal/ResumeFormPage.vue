<template>
  <div
    class="tab-pane tab-pane-navigation active show"
    id="resumeRegistration"
    role="tabpanel"
  >
    <h4 class="mb-3" style="font-size: 24px">이력서 등록</h4>
    <div class="card bg-color-grey mb-4" style="padding: 20px">
      <div class="card-body">
        <form @submit.prevent="submitResume" class="contact-form form-style-2">
          <!-- 이력서 제목 입력 -->
          <div class="form-group mb-4">
            <label class="form-label mb-1 text-2" style="font-weight: bold"
              >이력서 제목</label
            >
            <input
              v-model="resumeData.resumeTtl"
              type="text"
              class="form-control text-3 h-auto py-2"
              style="border: none"
              placeholder="예: 백엔드 개발자 이력서"
              required
            />
          </div>

          <!-- 위쪽: 사진 + 기본 정보 -->
          <div class="row align-items-start">
            <!-- 증명사진 -->
            <div class="col-lg-3 mb-4 d-flex justify-content-center">
              <div
                class="photo-box bg-white position-relative"
                style="
                  width: 100%;
                  max-width: 200px;
                  height: 200px;
                  border: 1px solid #ddd;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  top: 15px;
                "
              >
                <a
                  href="#"
                  class="photo-delete-btn"
                  @click.prevent="deletePhoto"
                  style="
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    display: block;
                    width: 24px;
                    height: 24px;
                    line-height: 24px;
                    text-align: center;
                    background-color: #eee;
                    color: #666;
                    border-radius: 50%;
                    font-weight: bold;
                    text-decoration: none;
                  "
                  >×</a
                >
                <img
                  v-if="photoPreview"
                  :src="photoPreview"
                  alt="사진 미리보기"
                  class="img-fluid rounded mb-2"
                  style="max-height: 100%; max-width: 100%; object-fit: cover"
                />
                <div class="v-else">
                  <label
                    for="photoInput"
                    class="photo-add-text"
                    style="
                      margin-top: 8px;
                      color: #666;
                      text-decoration: none;
                      font-size: 14px;
                      cursor: pointer;
                    "
                    >+ 사진 추가</label
                  >
                  <input
                    type="file"
                    id="photoInput"
                    @change="handlePhotoUpload"
                    accept="image/*"
                    class="d-none"
                  />
                </div>
              </div>
            </div>

            <!-- 기본 정보 -->
            <div class="col-lg-9">
              <div class="row">
                <!-- 이름 -->
                <div class="form-group col-md-6 mb-3">
                  <label
                    class="form-label mb-1 text-2"
                    style="font-weight: bold"
                    >이름</label
                  >
                  <input
                    v-model="resumeData.resumeNm"
                    type="text"
                    class="form-control text-3 h-auto py-2"
                    style="border: none"
                    required
                  />
                </div>
                <!-- 생년월일 -->
                <div class="form-group col-md-6 mb-3">
                  <label
                    class="form-label mb-1 text-2"
                    style="font-weight: bold"
                    >생년월일</label
                  >
                  <input
                    v-model="resumeData.resumeBirthDt"
                    type="date"
                    class="form-control text-3 h-auto py-2"
                    style="border: none"
                    required
                  />
                </div>

                <!-- 전화번호 -->
                <div class="form-group col-md-12 mb-3">
                  <label
                    class="form-label mb-1 text-2"
                    style="font-weight: bold"
                    >전화번호</label
                  >
                  <input
                    v-model="resumeData.resumePhoneNum"
                    type="tel"
                    class="form-control text-3 h-auto py-2"
                    style="border: none"
                    placeholder="010-xxxx-xxxx"
                    required
                    @input="formatPhoneNumber"
                  />
                </div>

                <!-- 이메일 -->
                <div class="form-group col-md-12 mb-3">
                  <label
                    class="form-label mb-1 text-2"
                    style="font-weight: bold"
                    >이메일</label
                  >
                  <div class="d-flex">
                    <input
                      v-model="resumeData.emailId"
                      type="text"
                      class="form-control text-3 h-auto py-2 me-2"
                      placeholder="아이디"
                      required
                      style="border: none"
                    />
                    <span class="align-self-center me-2">@</span>
                    <select
                      v-model="resumeData.emailDomain"
                      class="form-select text-3 h-auto py-2 me-2"
                      style="min-width: 150px"
                      required
                    >
                      <option value="">선택</option>
                      <option
                        v-for="domain in emailDomains"
                        :key="domain"
                        :value="domain"
                      >
                        {{ domain }}
                      </option>
                      <option value="custom">직접입력</option>
                    </select>
                    <input
                      v-if="resumeData.emailDomain === 'custom'"
                      v-model="resumeData.customDomain"
                      type="text"
                      class="form-control text-3 h-auto py-2"
                      placeholder="직접 입력"
                      style="border: none"
                    />
                  </div>
                </div>

                <!-- 주소 -->
                <div class="form-group col-md-12 mb-3">
                  <label
                    class="form-label mb-1 text-2"
                    style="font-weight: bold"
                    >주소</label
                  >
                  <input
                    v-model="resumeData.address"
                    type="text"
                    class="form-control text-3 h-auto py-2"
                    style="border: none"
                    placeholder="주소를 입력하세요"
                    readonly
                    @click="openAddressSearchModal"
                    required
                  />
                </div>

                <!-- 상세 주소 -->
                <div class="form-group col-md-12 mb-3">
                  <label
                    class="form-label mb-1 text-2"
                    style="font-weight: bold"
                    >상세 주소</label
                  >
                  <input
                    v-model="resumeData.detailAddress"
                    type="text"
                    class="form-control text-3 h-auto py-2"
                    style="border: none"
                    placeholder="상세주소를 입력하세요"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 학력 -->
          <div class="form-group mb-3">
            <label class="form-label mb-1 text-2" style="font-weight: bold">
              학력
              <a
                href="#"
                class="text-grey text-decoration-none small ms-2"
                @click.prevent="showEducationForm"
                >+ 추가하기</a
              >
            </label>
            <div class="mb-2 d-flex gap-2 flex-wrap">
              <div
                v-for="(education, index) in resumeData.education"
                :key="index"
                class="btn btn-rounded btn-3d btn-light mb-2 position-relative"
                style="padding-right: 24px"
              >
                {{ education.educationSchoolNm }}
                <span v-if="education.educationMajorNm"
                  >/ {{ education.educationMajorNm }}</span
                >
                <span>
                  (
                  {{
                    formatPeriod(
                      education.educationAdmissionDt,
                      education.educationGraduationDt,
                    )
                  }}
                  )
                </span>
                <span
                  class="text-grey ms-2 position-absolute end-0 me-2"
                  style="top: 50%; transform: translateY(-50%)"
                  title="삭제"
                  @click="removeEducation(index)"
                  >×</span
                >
              </div>
            </div>
          </div>

          <!-- 회사 이력 -->
          <div class="form-group mb-3">
            <label class="form-label mb-1 text-2" style="font-weight: bold">
              회사 이력
              <a
                href="#"
                class="text-grey text-decoration-none small ms-2"
                @click.prevent="showCareerForm"
                >+ 추가하기</a
              >
            </label>
            <div class="mb-2">
              <span
                v-for="career in resumeData.career"
                :key="career.company + career.startDate"
                class="company-tag"
              >
                {{ career.company }}회사 {{ career.department }}부서
                {{ career.position }}
                <span>
                  (
                  {{ careerPeriod(career.startDate, career.endDate) }}
                  )
                </span>

                <span
                  class="text-grey ms-2"
                  style="cursor: pointer"
                  title="삭제"
                  @click="removeCareer(idx)"
                  >×</span
                >
              </span>
            </div>
          </div>
          <!-- 교육 이력 -->
          <div class="form-group mb-3">
            <label class="form-label mb-1 text-2" style="font-weight: bold">
              교육 이력
              <a
                href="#"
                class="text-grey text-decoration-none small ms-2"
                @click.prevent="showTrainingForm"
                >+ 추가하기</a
              >
            </label>

            <div class="d-flex justify-content-end gap-3 mb-1">
              <!-- 필요 시 정렬, 필터 버튼 등 위치 -->
            </div>

            <div class="mb-2">
              <span
                v-for="(item, idx) in resumeData.trainingHistories"
                :key="idx"
                class="training-tag"
              >
                {{ item.program }} / {{ item.institution }} / {{ item.period }}
                <span
                  class="text-grey ms-2"
                  style="cursor: pointer"
                  title="삭제"
                  @click="removeTraining(idx)"
                  >×</span
                >
              </span>
            </div>
          </div>
          <!-- 프로젝트 이력 -->
          <div class="form-group mb-3">
            <label class="form-label mb-1 text-2" style="font-weight: bold">
              프로젝트 이력
              <a
                href="#"
                class="text-grey text-decoration-none small ms-2"
                @click.prevent="showProjectForm"
                >+ 추가하기</a
              >
            </label>
            <div class="d-flex justify-content-end gap-3 mb-3">
              <a
                href="#"
                class="text-dark text-decoration-none small"
                @click.prevent="toggleAllProjects"
              >
                <i
                  :class="[
                    'fas',
                    allProjectsExpanded ? 'fa-chevron-up' : 'fa-chevron-down',
                    'me-2',
                  ]"
                ></i>
                {{ allProjectsExpanded ? '전체 닫기' : '전체 펼치기' }}
              </a>
            </div>
            <div v-for="(project, index) in resumeData.projects" :key="index">
              <div
                class="btn btn-rounded btn-3d btn-light mb-2 w-100 d-flex align-items-center justify-content-between position-relative px-3 py-2"
                style="text-align: left"
              >
                <div
                  class="d-flex align-items-center flex-grow-1"
                  @click="toggleProject(index)"
                >
                  <i
                    :class="[
                      'fas',
                      project.isExpanded
                        ? 'fa-chevron-down'
                        : 'fa-chevron-right',
                      'me-2',
                    ]"
                  ></i>
                  <span>{{ project.name }} ({{ project.period }})</span>
                </div>
                <span
                  class="text-grey small ms-2 position-absolute end-0 me-3"
                  style="top: 50%; transform: translateY(-50%); cursor: pointer"
                  title="삭제"
                  @click="removeProject(index)"
                  >×</span
                >
              </div>
              <div v-show="project.isExpanded" class="collapse mb-3 show">
                <div class="bg-light rounded p-3 border">
                  <div class="row mb-2">
                    <div class="col-sm-4">
                      <strong>고객사:</strong> {{ project.client }}
                    </div>
                    <div class="col-sm-4">
                      <strong>업무단:</strong> {{ project.workUnit }}
                    </div>
                    <div class="col-sm-4">
                      <strong>역할:</strong> {{ project.role }}
                    </div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-sm-4">
                      <strong>기종:</strong> {{ project.device }}
                    </div>
                    <div class="col-sm-4">
                      <strong>OS:</strong> {{ project.os }}
                    </div>
                    <div class="col-sm-4">
                      <strong>DBMS:</strong> {{ project.dbms }}
                    </div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-sm-12">
                      <strong style="margin-right: 8px">언어:</strong>
                      <button
                        v-for="lang in project.languages"
                        :key="lang"
                        class="btn btn-rounded btn-3d btn-light btn-sm me-2"
                      >
                        <img
                          v-if="lang.icon"
                          :src="lang.icon"
                          :alt="lang.name"
                          width="16"
                          height="16"
                        />
                        {{ lang.name }}
                      </button>
                    </div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-sm-12">
                      <strong style="margin-right: 8px">TOOL:</strong>
                      <button
                        v-for="tool in project.tools"
                        :key="tool"
                        class="btn btn-rounded btn-3d btn-light btn-sm me-2"
                      >
                        {{ tool }}
                      </button>
                    </div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-sm-12">
                      <strong style="margin-right: 8px">FW:</strong>
                      <button
                        v-for="fw in project.frameworks"
                        :key="fw"
                        class="btn btn-rounded btn-3d btn-light btn-sm me-2"
                      >
                        <img
                          v-if="fw.icon"
                          :src="fw.icon"
                          :alt="fw.name"
                          width="16"
                          height="16"
                        />
                        {{ fw.name }}
                      </button>
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-sm-12">
                      <strong style="margin-right: 8px">기타:</strong>
                      <button
                        v-for="etc in project.etc"
                        :key="etc"
                        class="btn btn-rounded btn-3d btn-light btn-sm me-2"
                      >
                        <img
                          v-if="etc.icon"
                          :src="etc.icon"
                          :alt="etc.name"
                          width="16"
                          height="16"
                        />
                        {{ etc.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 자격증 -->
          <div class="form-group mb-3">
            <label class="form-label mb-1 text-2" style="font-weight: bold">
              자격증
              <a
                href="#"
                class="text-grey text-decoration-none small ms-2"
                @click.prevent="showCertificateForm"
                >+ 추가하기</a
              >
            </label>
            <div class="mb-2 d-flex gap-2 flex-wrap">
              <div
                v-for="(certificate, index) in resumeData.certificates"
                :key="index"
                class="btn btn-rounded btn-3d btn-light mb-2 position-relative"
                style="padding-right: 24px"
              >
                {{ certificate.certificateName }}
                <span
                  @click.stop="removeCertificate(index)"
                  class="delete-icon"
                  title="삭제"
                  @click="removeCertificate(index)"
                  >×</span
                >
              </div>
            </div>
          </div>

          <!-- 보유 기술 -->
          <div class="form-group mb-3">
            <label class="form-label mb-1 text-2" style="font-weight: bold">
              보유 기술
              <a
                href="#"
                class="text-grey text-decoration-none small ms-2"
                @click.prevent="showSkillsForm"
                >+ 추가하기</a
              >
            </label>
            <div class="mb-2 d-flex gap-2 flex-wrap">
              <div
                v-for="(skill, index) in resumeData.skills"
                :key="index"
                class="btn btn-rounded btn-light d-flex align-items-center gap-2 mb-2 btn-3d position-relative"
                style="padding-right: 24px"
              >
                <img
                  v-if="skill.icon"
                  :src="skill.icon"
                  :alt="skill.name"
                  width="20"
                  height="20"
                />
                <span>{{ skill.skillTagNm }}</span>
                <a
                  href="#"
                  class="position-absolute end-0 me-2 text-grey text-decoration-none"
                  style="top: 50%; transform: translateY(-50%)"
                  title="삭제"
                  @click.prevent="removeSkill(index)"
                  >×</a
                >
              </div>
            </div>
          </div>

          <!-- 이력서 첨부 -->
          <div class="form-group mb-3">
            <label class="form-label mb-1 text-2" style="font-weight: bold"
              >첨부파일</label
            >
            <input
              type="file"
              @change="handleFileUpload"
              class="form-control text-3 h-auto py-2"
              accept=".pdf"
            />
          </div>

          <!-- 자기소개 -->
          <div class="form-group mb-3">
            <label class="form-label mb-1 text-2" style="font-weight: bold"
              >자기소개</label
            >
            <textarea
              v-model="resumeData.resumeGreetingTxt"
              rows="5"
              class="form-control text-3 h-auto py-2"
              required
            ></textarea>
          </div>

          <!-- 동의 -->
          <div class="form-group mb-3">
            <div class="form-check">
              <input
                v-model="resumeData.resumeIsNotificationYn"
                class="form-check-input"
                type="checkbox"
                id="agreeCheck"
              />
              <label class="form-check-label" for="agreeCheck"
                >알림 발신 여부</label
              >
            </div>
          </div>

          <!-- 제출 버튼 -->
          <div class="form-group mt-4">
            <button
              type="button"
              class="btn btn-primary px-4 py-2"
              @click="openDetailModal"
            >
              {{ resumeSq ? '이력서 수정' : '이력서 등록' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import ResumeModal from '@/fo/components/mypage/personal/ResumeModal.vue'
import EducationSearchModal from '@/fo/components/mypage/personal/EducationSearchModal.vue'
import ResumeCompanyModal from '@/fo/components/mypage/personal/ResumeCompanyModal.vue'
import TrainingModal from '@/fo/components/mypage/personal/TrainingModal.vue'
import ShowProjectFormModal from '@/fo/components/mypage/personal/ShowProjectFormModal.vue'
import LicenseModal from '@/fo/components/mypage/personal/LicenseModal.vue'
import AddressSearchModal from '@/fo/components/mypage/personal/AddressSearchModal.vue'

// import axios from 'axios'
import { useRoute } from 'vue-router'
import SkillTagModal from '@/fo/components/community/SkillTagModal.vue'
import { api } from '@/axios'
import router from '@/fo/router'
import { useAlertStore } from '@/fo/stores/alertStore'

const alertStore = useAlertStore()
const modalStore = useModalStore()
const route = useRoute()
const resumeSq = route.params.resumeSq
const skillList = ref([])
// console.log('resumeSq:', resumeSq) // 값이 잘 들어오는지 확인

// 이력서 데이터
const resumeData = reactive({
  addressSq: '',
  resumeTtl: '',
  resumeNm: '',
  resumeBirthDt: '',
  resumePhoneNum: '',
  resumeEmail: '',
  emailId: '',
  emailDomain: '',
  customDomain: '',
  address: '',
  detailAddress: '',
  zonecode: '',
  sido: '',
  sigungu: '',
  latitude: '',
  longitude: '',
  education: [],
  career: [],
  trainingHistories: [],
  projects: [],
  certificates: [],
  skills: [],
  resumeGreetingTxt: '',
  resumeIsNotificationYn: false,
  attachments: [],
})

//주소 모달창
const openAddressSearchModal = () => {
  modalStore.openModal(AddressSearchModal, {
    onComplete: (data) => {
      Object.assign(resumeData, data)
    },
  })
}

const openDetailModal = () => {
  modalStore.openModal(ResumeModal, {
    resumeSq: resumeSq,
    onConfirm: submitResume,

    // 필요하면 다른 props도 여기서 전달 가능
  })
}

// 이메일 도메인 목록
const emailDomains = ['naver.com', 'gmail.com', 'daum.net', 'hanmail.net']

// 사진 미리보기
const photoPreview = ref(null)

// 사진 업로드 처리
const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 사진 삭제
const deletePhoto = () => {
  photoPreview.value = ''
}

// 파일 업로드 처리
const handleFileUpload = (event) => {
  // const file =
  event.target.files[0]
  // 파일 처리 로직 구현
  // console.log(file)
}

const formatPhoneNumber = (event) => {
  //1. 숫자만, 숫자 제한
  let value = event.target.value.replace(/[^0-9]/g, '')
  value = value.slice(0, 11)

  //2.하이픈 자동 삽입
  if (value.length >= 4 && value.length < 8) {
    value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2')
  } else if (value.length >= 8) {
    value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3')
  }
  // 3. v-model 값 갱신
  resumeData.resumePhoneNum = value
}

// 폼 표시 관련 메서드

// 학력 입력 폼 표시 로직
const showEducationForm = () => {
  modalStore.openModal(EducationSearchModal, {
    onComplete: (edu) => {
      resumeData.education.push(edu)
    },
  })
}

// 경력 입력 폼 표시 로직
const showCareerForm = () => {
  modalStore.openModal(ResumeCompanyModal, {
    onComplete: (career) => {
      resumeData.career.push(career)
    },
  })
}
//경력 날짜 표시 YYYY-MM
function toYyyyMmDd(dateStr) {
  if (!dateStr) return null
  if (/^\d{4}-\d{2}$/.test(dateStr)) return dateStr + '-01'
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  return null
}
// 교육 입력 폼 표시 로직
const showTrainingForm = () => {
  modalStore.openModal(TrainingModal, {
    onComplete: (training) => {
      resumeData.trainingHistories.push(training)
    },
  })
}
// 프로젝트 입력 폼 표시 로직
const showProjectForm = () => {
  modalStore.openModal(ShowProjectFormModal, {
    onComplete: (project) => {
      resumeData.projects.push(project)
    },
  })
}

// 자격증 입력 폼 표시 로직
const showCertificateForm = () => {
  modalStore.openModal(LicenseModal, {
    onLicenseSelected: (license) => {
      resumeData.certificates.push({
        certificateName: license.name,
        certificateCode: license.id,
        certificateLevel: license.level,
        certificateIssuer: license.org,
        certificateDate: '', // 사용자 직접 입력 예정
      })
    },
  })
}
// 기술 입력 폼 표시 로직
const showSkillsForm = () => {
  modalStore.openModal(SkillTagModal, {
    skillTags: resumeData.skills,
    onConfirm: (skills) => {
      // console.log(skills)
      resumeData.skills = skills
    },
  })
}

// 데이터 삭제 메서드
const removeEducation = (index) => {
  resumeData.education.splice(index, 1)
}

const removeCareer = (index) => {
  resumeData.career.splice(index, 1)
}

const removeTraining = (index) => {
  resumeData.trainingHistories.splice(index, 1)
}

const removeProject = (index) => {
  resumeData.projects.splice(index, 1)
}

const removeCertificate = (index) => {
  resumeData.certificates.splice(index, 1)
}

const removeSkill = (index) => {
  resumeData.skills.splice(index, 1)
}

// 프로젝트 토글
const toggleProject = (index) => {
  resumeData.projects[index].isExpanded = !resumeData.projects[index].isExpanded
}

// 전체 프로젝트 펼치기/접기
const allProjectsExpanded = computed(
  () =>
    resumeData.projects.length > 0 &&
    resumeData.projects.every((project) => project.isExpanded),
)

const toggleAllProjects = () => {
  const nextExpanded = !allProjectsExpanded.value
  resumeData.projects.forEach((project) => (project.isExpanded = nextExpanded))
}

// 프로젝트가 추가/변경될 때 전체 펼침
watch(
  () => resumeData.projects.length,
  () => {
    resumeData.projects.forEach((project) => {
      project.isExpanded = true
    })
  },
  { immediate: true },
)

//폼 제출
// 1. resumeSq가 있을 경우 → 수정 모드 → 데이터 불러오기
onMounted(async () => {
  // 기술 목록 가져오기
  try {
    const res = await api.$get('/mypage/resume/skills')
    skillList.value = res.data.data || res.data.output || res.data
  } catch (e) {
    console.error('[ 기술 목록 조회 실패 ]', e)
  }
  //이력서 상세정보 불러오기(수정모드)
  if (resumeSq) {
    try {
      const res = await api.$get(`/mypage/resume/detail/${resumeSq}`)
      // console.log('api 응답:', res)

      const data = res.output
      // console.log('data:', data)

      // 1. 각 필드를 직접 할당 (반응형 보장)
      if (data) {
        resumeData.addressSq = data.addressSq ?? ''
        resumeData.resumeTtl = data.resumeTtl ?? ''
        resumeData.resumeNm = data.resumeNm ?? ''
        resumeData.resumeBirthDt = data.resumeBirthDt ?? ''
        resumeData.resumePhoneNum = data.resumePhoneNum ?? ''
        resumeData.resumeEmail = data.resumeEmail ?? ''
        resumeData.address = data.address ?? ''
        resumeData.detailAddress = data.detailAddress ?? ''
        resumeData.zonecode = data.zonecode ?? ''
        resumeData.sigungu = data.sigungu ?? ''
        resumeData.latitude = data.latitude ?? ''
        resumeData.longitude = data.longitude ?? ''
        resumeData.resumeGreetingTxt = data.resumeGreetingTxt ?? ''
        resumeData.resumeIsNotificationYn = data.resumeIsNotificationYn === 'Y'
        resumeData.resumeIsRepresentativeYn =
          data.resumeIsRepresentativeYn === 'Y'
        resumeData.education = data.education || []
        resumeData.career = (data.career || []).map((e) => ({
          company: e.careerCompanyNm,
          department: e.careerDepartmentNm,
          position: e.careerPositionNm,
          startDate: e.careerStartDt ? e.careerStartDt.substring(0, 7) : '',
          endDate: e.careerEndDt ? e.careerEndDt.substring(0, 7) : '',
          period: e.period,
        }))
        resumeData.trainingHistories = data.trainingHistories || []
        resumeData.projects = data.projects || []
        resumeData.certificates = data.certificates || []
        resumeData.skills = data.skills || []
        resumeData.attachments = data.attachments || []
        // 이메일 분리
        if (data.resumeEmail) {
          const [id, domain] = data.resumeEmail.split('@')
          resumeData.emailId = id
          if (emailDomains.includes(domain)) {
            resumeData.emailDomain = domain
            resumeData.customDomain = ''
          } else {
            resumeData.emailDomain = 'custom'
            resumeData.customDomain = domain
          }
        }
      }
      // console.log('폼에 할당된 resumeData:', resumeData)
    } catch (e) {
      // console.log('이력서 상세 불러오기 실패:', e)
    }
  }
})

// 2. 등록 또는 수정 제출 처리
const submitResume = async () => {
  // 1. 좌표 확인
  if (!resumeData.latitude || !resumeData.longitude) {
    alertStore.show(
      '주소 좌표 정보가 없습니다. 주소를 다시 선택해주세요.',
      'danger',
    )
    return
  }

  // 2. 이메일 조합
  const email = `${resumeData.emailId}@${
    resumeData.emailDomain === 'custom'
      ? resumeData.customDomain
      : resumeData.emailDomain
  }`

  // 3. 전송용 객체 생성
  const payload = {
    addressSq: resumeData.addressSq,
    resumeTtl: resumeData.resumeTtl,
    resumeNm: resumeData.resumeNm,
    resumeBirthDt: resumeData.resumeBirthDt,
    resumePhoneNum: resumeData.resumePhoneNum,
    resumeEmail: email,
    address: resumeData.address,
    detailAddress: resumeData.detailAddress,
    zonecode: resumeData.zonecode,
    sido: resumeData.sido,
    sigungu: resumeData.sigungu,
    latitude: resumeData.latitude,
    longitude: resumeData.longitude,
    resumeGreetingTxt: resumeData.resumeGreetingTxt,
    resumeIsNotificationYn: resumeData.resumeIsNotificationYn ? 'Y' : 'N',
    resumePhotoUrl: resumeData.resumePhotoUrl || '',
    education: resumeData.education.map((e) => ({
      educationSchoolNm: e.educationSchoolNm,
      educationMajorNm: e.educationMajorNm,
      educationAdmissionDt: e.educationAdmissionDt,
      educationGraduationDt: e.educationGraduationDt,
      educationStatusCd: e.educationStatusCd,
    })),
    career: resumeData.career.map((e) => ({
      careerCompanyNm: e.company,
      careerDepartmentNm: e.department,
      careerPositionNm: e.position,
      careerStartDt: toYyyyMmDd(e.startDate),
      careerEndDt: toYyyyMmDd(e.endDate),
    })),
    projects: resumeData.projects,
    certificates: resumeData.certificates,
    skills: resumeData.skills,
    attachments: resumeData.attachments,
    resumeIsRepresentativeYn: resumeData.resumeIsRepresentativeYn ? 'Y' : 'N',
  }

  // console.log('[최종 전송 데이터]', payload)

  try {
    if (resumeSq) {
      await api.$put(`/mypage/resume/update/${resumeSq}`, payload, {
        withCredentials: true,
      })
      alertStore.show('이력서가 성공적으로 수정되었습니다.', 'success')
      router.push(`/mypage/resumelist`) // 리스트 페이지로 이동
    } else {
      await api.$post('/mypage/resume/new', payload, { withCredentials: true })
      alertStore.show('이력서가 성공적으로 등록되었습니다.', 'success')
      router.push('/mypage/resumelist') // 리스트 페이지로 이동
    }
  } catch (e) {
    console.error('[ 이력서 등록/수정 실패 ]', e)
    alertStore.show('이력서 등록/수정 중 오류가 발생했습니다.', 'danger')
  }
}
//학력 날짜 변환
function formatPeriod(admission, graduation) {
  if (!admission) return ''
  const start = admission.replace('-', '.')
  if (!graduation) return `${start} ~ `
  return `${start} ~ ${graduation.replace('-', '.')}`
}
//회사이력 날짜 변환
function careerPeriod(start, end) {
  if (!start) return ''
  const startStr = start.replace('-', '.')
  if (!end) return `${startStr} ~ `
  return `${startStr} ~ ${end.replace('-', '.')}`
}
</script>

<style scoped>
.simple-post-list {
  list-style: none;
  padding: 0;
}

.transition-transform {
  transition: transform 0.3s ease;
}

.company-tag {
  display: inline-block;
  background: #ffffff;
  color: #333;
  border-radius: 12px;
  padding: 4px 12px;
  margin: 4px 5px 4px 0;
  font-size: 0.97em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.training-tag {
  display: inline-block;
  background: #ffffff;
  color: #333;
  border-radius: 12px;
  padding: 4px 12px;
  margin: 4px 5px 4px 0;
  font-size: 0.97em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}
</style>
