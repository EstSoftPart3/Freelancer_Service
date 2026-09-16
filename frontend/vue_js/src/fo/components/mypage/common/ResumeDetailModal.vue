<template>
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">{{ resumeInfo.resumeTtl || '이력서 상세' }}</h4>
      <button
        type="button"
        class="btn-close"
        @click="closeModal"
        aria-label="Close"
      >
        ×
      </button>
    </div>
    <div class="modal-body">
      <div
        class="tab-pane tab-pane-navigation active show"
        id="resumeDetail"
        role="tabpanel"
      >
        <div class="card bg-color-grey mb-4 p-4">
          <div class="row align-items-start">
            <!-- 이력서 제목 -->
            <div class="mb-4">
              <h5 class="mb-1 text-primary" style="font-weight: bold">
                이력서 제목
              </h5>
              <p class="mb-0 text-dark">{{ resumeInfo.resumeTtl }}</p>
            </div>

            <!-- 사진 -->
            <div class="col-lg-3 mb-4 d-flex justify-content-center">
              <div
                class="photo-box bg-white"
                style="
                  width: 100%;
                  max-width: 200px;
                  height: 200px;
                  border: 1px solid #ddd;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
                <img
                  :src="resumeInfo.resumePhotoUrl || null"
                  alt="사진"
                  class="img-fluid rounded"
                  style="max-height: 100%; object-fit: cover"
                />
              </div>
            </div>

            <!-- 기본 정보 -->
            <div class="col-lg-9">
              <p>
                <strong class="text-primary">이름 :</strong>
                <span class="text-dark"> {{ resumeInfo.resumeNm }}</span>
              </p>
              <p>
                <strong class="text-primary">생년월일 :</strong>
                <span class="text-dark"> {{ resumeInfo.resumeBirthDt }}</span>
              </p>
              <p>
                <strong class="text-primary">전화번호 :</strong>
                <span class="text-dark"> {{ resumeInfo.resumePhoneNum }}</span>
              </p>
              <p>
                <strong class="text-primary">이메일 :</strong>
                <span class="text-dark"> {{ resumeInfo.resumeEmail }}</span>
              </p>
              <p>
                <strong class="text-primary">주소 :</strong>
                <span class="text-dark">
                  {{ resumeInfo.address?.addressFull || resumeInfo.address }}</span
                >
              </p>
            </div>
          </div>

          <hr />

          <!-- 학력 -->
          <h5 class="text-primary">학력</h5>
          <ul class="list-unstyled">
            <li
              v-for="(education, index) in resumeInfo.educationList"
              :key="index"
            >
              {{ education.educationSchoolNm }}
              {{ education.educationMajorNm }}
              {{ education.educationStatusNm }} ({{
                education.educationAdmissionDt
              }}
              ~ {{ education.educationGraduationDt }})
            </li>
          </ul>

          <!-- 경력 -->
          <h5 class="text-primary">회사 이력</h5>
          <ul class="list-unstyled">
            <li v-for="(career, index) in resumeInfo.careerList" :key="index">
              {{ career.careerCompanyNm }} {{ career.careerDepartmentNm }} -
              {{ career.careerPositionNm }} ({{ career.careerStartDt }} ~
              {{ career.careerEndDt }})
            </li>
          </ul>

          <!-- 교육 이력 -->
          <h5 class="text-primary">교육 이력</h5>
          <ul class="list-unstyled">
            <li
              v-for="(training, index) in resumeInfo.trainingList"
              :key="index"
            >
              {{ training.trainingInstitutionNm }} -
              {{ training.trainingProgramNm }} ({{ training.trainingStartDt }} ~
              {{ training.trainingEndDt }})
            </li>
          </ul>

          <!-- 프로젝트 이력 -->
          <h5
            class="text-primary d-flex justify-content-between align-items-center mb-3"
          >
            프로젝트 이력
            <div class="d-flex gap-3">
              <a
                href="#"
                @click.prevent="expandAllProjects"
                class="text-grey text-decoration-none small"
              >
                <i class="fas fa-chevron-down me-2"></i>전체 펼치기
              </a>
              <a
                href="#"
                @click.prevent="collapseAllProjects"
                class="text-grey text-decoration-none small"
              >
                <i class="fas fa-chevron-up me-2"></i>전체 닫기
              </a>
            </div>
          </h5>

          <ul class="list-unstyled">
            <li
              v-for="(project, index) in resumeInfo.projectList"
              :key="index"
              class="d-flex flex-wrap align-items-center gap-2"
            >
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
                      'fa-chevron-right',
                      'me-2',
                      'transition-transform',
                      { 'rotate-90': project.isExpanded },
                    ]"
                  ></i>
                  <span
                    >{{ project.projectHistoryClient }}
                    {{ project.projectHistoryTask }} ({{
                      project.projectHistoryStartDt
                    }}
                    ~ {{ project.projectHistoryEndDt }})</span
                  >
                </div>
              </div>

              <div v-show="project.isExpanded" class="collapse show mb-3 w-100">
                <div class="bg-light rounded p-3 border">
                  <div class="row mb-2">
                    <div class="col-sm-4">
                      <strong>고객사:</strong>
                      {{ project.projectHistoryClient }}
                    </div>
                    <div class="col-sm-4">
                      <strong>업무단:</strong>
                      {{ project.projectHistoryJobPositionTypeNm }}
                    </div>
                    <div class="col-sm-4">
                      <strong>역할:</strong> {{ project.projectHistoryTypeNm }}
                    </div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-sm-4">
                      <strong style="margin-right: 8px">기종:</strong>
                      <button
                        v-for="device in getTagsByCategory(project, 'Device')"
                        :key="device"
                        class="btn btn-rounded btn-3d btn-light btn-sm me-2"
                      >
                        <img
                          v-if="generateIconUrl(device)"
                          :src="generateIconUrl(device)"
                          width="16"
                          height="16"
                        />
                        {{ device }}
                      </button>
                    </div>
                    <div class="col-sm-8">
                      <strong style="margin-right: 8px">OS:</strong>
                      <button
                        v-for="os in getTagsByCategory(project, 'OS')"
                        :key="os"
                        class="btn btn-rounded btn-3d btn-light btn-sm me-2"
                      >
                        <img
                          v-if="generateIconUrl(os)"
                          :src="generateIconUrl(os)"
                          width="16"
                          height="16"
                        />
                        {{ os }}
                      </button>
                    </div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-sm-12">
                      <strong style="margin-right: 8px">DBMS:</strong>
                      <button
                        v-for="dbms in getTagsByCategory(project, 'DBMS')"
                        :key="dbms"
                        class="btn btn-rounded btn-3d btn-light btn-sm me-2"
                      >
                        <img
                          v-if="generateIconUrl(dbms)"
                          :src="generateIconUrl(dbms)"
                          width="16"
                          height="16"
                        />
                        {{ dbms }}
                      </button>
                    </div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-sm-12">
                      <strong style="margin-right: 8px">언어:</strong>
                      <button
                        v-for="lang in getTagsByCategory(project, 'Language')"
                        :key="lang"
                        class="btn btn-rounded btn-3d btn-light btn-sm me-2"
                      >
                        <img
                          v-if="generateIconUrl(lang)"
                          :src="generateIconUrl(lang)"
                          width="16"
                          height="16"
                        />
                        {{ lang }}
                      </button>
                    </div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-sm-12">
                      <strong style="margin-right: 8px">TOOL:</strong>
                      <button
                        v-for="tool in getTagsByCategory(project, 'Tool')"
                        :key="tool"
                        class="btn btn-rounded btn-3d btn-light btn-sm me-2"
                      >
                        <img
                          v-if="generateIconUrl(tool)"
                          :src="generateIconUrl(tool)"
                          width="16"
                          height="16"
                        />
                        {{ tool }}
                      </button>
                    </div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-sm-12">
                      <strong style="margin-right: 8px">FW:</strong>
                      <button
                        v-for="framework in getTagsByCategory(
                          project,
                          'FrameWork',
                        )"
                        :key="framework"
                        class="btn btn-rounded btn-3d btn-light btn-sm me-2"
                      >
                        <img
                          v-if="generateIconUrl(framework)"
                          :src="generateIconUrl(framework)"
                          width="16"
                          height="16"
                        />
                        {{ framework }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <!-- 자격증 -->
          <h5 class="text-primary">자격증</h5>
          <ul class="list-unstyled">
            <li
              v-for="(certificate, index) in resumeInfo.certificationList"
              :key="index"
            >
              {{ certificate.certificationNm }}
            </li>
          </ul>

          <!-- 기술 -->
          <h5 class="text-primary">보유 기술</h5>
          <div class="d-flex gap-2 flex-wrap mb-3">
            <div
              v-for="(skill, index) in resumeInfo.skillTagList"
              :key="index"
              class="btn d-flex align-items-center gap-2 border-0"
            >
              <img
                v-if="generateIconUrl(skill)"
                :src="generateIconUrl(skill)"
                width="20"
              />
              {{ skill }}
            </div>
          </div>

          <!-- 자기소개 -->
          <h5 class="text-primary">자기소개</h5>
          <p class="border p-3 bg-white rounded text-dark">
            {{ resumeInfo.resumeGreetingTxt }}
          </p>

          <!-- 첨부파일 -->
          <h5 class="text-primary">첨부 파일</h5>
          <p v-for="(file, index) in resumeInfo.attachmentList" :key="index">
            <a :href="file.attachmentFileUrl" target="_blank">{{
              file.attachmentOriginFileNm
            }}</a>
          </p>
        </div>
      </div>
    </div>

    <!-- 하단 슬롯 제공 (기본값으로 닫기 버튼 설정) -->
    <div class="modal-footer">
      <slot name="footer" :closeModal="closeModal">
        <button class="btn btn-outline-secondary" @click="closeModal">
          닫기
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, defineProps, defineEmits } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import { api } from '@/axios'
import skillIconMap from '@/assets/skillIconMap.js'

const props = defineProps({
  resumeSq: {
    type: [Number, String, Object], // 객체로 넘어오는 케이스까지 포용하도록 확장
    default: null,
  },
  projectSq: {
    type: Number,
    default: 0,
  },
  applicationSq: {
    type: Number,
    default: 0,
  },
  isFromApplicationList: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
const modalStore = useModalStore()

const resumeInfo = ref({
  resumeTtl: '',
  resumePhotoUrl: '',
  resumeNm: '',
  resumeBirthDt: '',
  resumePhoneNum: '',
  resumeEmail: '',
  address: '',
  photo: '',
  educationList: [],
  careerList: [],
  trainingList: [],
  projectList: [],
  certificationList: [],
  skillTagList: [],
  resumeGreetingTxt: '',
  attachmentList: [],
})

function getTagsByCategory(project, category) {
  if (!project?.groupedSkillTags) return []
  const found = project.groupedSkillTags.find((item) => item[category])
  return found ? found[category] : []
}

const toggleProject = (index) => {
  resumeInfo.value.projectList[index].isExpanded =
    !resumeInfo.value.projectList[index].isExpanded
}

const expandAllProjects = () => {
  resumeInfo.value.projectList.forEach((project) => {
    project.isExpanded = true
  })
}

const collapseAllProjects = () => {
  resumeInfo.value.projectList.forEach((project) => {
    project.isExpanded = false
  })
}

const closeModal = () => {
  emit('close')
  modalStore.closeModal()
}

// 이력서 상세조회
watchEffect(async () => {
  console.log('[ResumeDetailModal] 원본 resumeSq Prop:', props.resumeSq)

  // 1. props.resumeSq가 객체인지, 숫자/문자열인지 파싱하여 순수 PK 값 추출
  let realResumeSq = null

  if (typeof props.resumeSq === 'object' && props.resumeSq !== null) {
    realResumeSq =
      props.resumeSq.resumeSq ||
      props.resumeSq.resume_sq ||
      props.resumeSq.freelancerSq ||
      props.resumeSq.freelancer_sq ||
      props.resumeSq.userSq ||
      props.resumeSq.user_sq ||
      props.resumeSq.id
  } else {
    realResumeSq = props.resumeSq
  }

  if (!realResumeSq) {
    console.warn('[ResumeDetailModal] resumeSq 값이 없어 API 요청을 보낼 수 없습니다.')
    return
  }

  console.log('[ResumeDetailModal] 최종 파싱된 resumeSq:', realResumeSq)

  // 2. 파싱된 PK 기반으로 API 요청 진행
  try {
    const res = props.isFromApplicationList
      ? await api.$post('/mypage/resume-detail-view', {
          resumeSq: realResumeSq,
          projectSq: props.projectSq,
          applicationSq: props.applicationSq,
        })
      : await api.$get(`/mypage/resume-detail/${realResumeSq}`)

    const data = res?.output || res?.data || res

    if (data) {
      if (data.projectList) {
        data.projectList = data.projectList.map((project) => ({
          ...project,
          isExpanded: true,
        }))
      }
      Object.assign(resumeInfo.value, data)
    }
  } catch (err) {
    console.error('이력서 조회 실패:', err)
  }
})

const generateIconUrl = (name) => {
  if (!name) return null
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}
</script>