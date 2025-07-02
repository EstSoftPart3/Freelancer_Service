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
          <!-- 이력서 제목 -->
          <div class="form-group mb-4">
            <label class="form-label mb-1 text-2" style="font-weight: bold"
              >이력서 제목</label
            >
            <input
              v-model="resumeForm.resumeTtl"
              type="text"
              class="form-control text-3 h-auto py-2"
              style="border: none"
              placeholder="예: 백엔드 개발자 이력서"
              required
            />
          </div>

          <!-- 사진 + 기본 정보 -->
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
                  v-if="profileImageUrl"
                  href="#"
                  class="photo-delete-btn"
                  @click.prevent="deleteProfileImage()"
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

                <!-- 사진 미리보기 -->
                <img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                  alt="사진 미리보기"
                  class="img-fluid rounded mb-2"
                />
                <div v-else>
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
                    @change="onProfileImageChange"
                    class="d-none"
                    accept="image/*"
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
                    v-model="resumeForm.resumeNm"
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
                    v-model="resumeForm.resumeBirthDt"
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
                    v-model="resumeForm.resumePhoneNum"
                    type="tel"
                    class="form-control text-3 h-auto py-2"
                    style="border: none"
                    placeholder="010-xxxx-xxxx"
                    required
                    @input="onPhoneInput"
                  />
                </div>

                <!-- 이메일 -->
                <div class="form-group col-md-12 mb-3">
                  <label
                    class="form-label mb-1 text-2"
                    style="font-weight: bold"
                    >이메일</label
                  >
                  <input
                    v-model="resumeForm.resumeEmail"
                    type="email"
                    class="form-control text-3 h-auto py-2"
                    placeholder="example@example.com"
                    style="border: none"
                    required
                  />
                </div>

                <!-- 주소 -->
                <div class="form-group col-md-12 mb-3">
                  <label
                    class="form-label mb-1 text-2"
                    style="font-weight: bold"
                    >주소</label
                  >
                  <input
                    v-model="resumeForm.address.address"
                    type="text"
                    class="form-control text-3 h-auto py-2"
                    style="border: none"
                    placeholder="주소를 입력하세요"
                    readonly
                    @click="openPostcode"
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
                    v-model="resumeForm.address.detailAddress"
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
                v-for="(education, index) in resumeForm.educationList"
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
                  {{ education.educationAdmissionDt }} ~
                  {{
                    education.educationGraduationDt
                      ? education.educationGraduationDt
                      : ''
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
                v-for="(career, idx) in resumeForm.careerList"
                :key="career.careerCompanyNm + career.careerStartDt"
                class="btn btn-rounded btn-3d btn-light mb-2 position-relative"
                style="padding-right: 24px"
              >
                {{ career.careerCompanyNm }}회사
                {{ career.careerDepartmentNm }}부서
                {{ career.careerPositionNm }}
                <span>
                  (
                  {{ career.careerStartDt }} ~
                  {{ career.careerEndDt ? career.careerEndDt : '' }}
                  )
                </span>

                <span
                  class="text-grey ms-2 position-absolute end-0 me-2"
                  style="top: 50%; transform: translateY(-50%)"
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
                v-for="(item, idx) in resumeForm.trainingHistoryList"
                :key="idx"
                class="btn btn-rounded btn-3d btn-light mb-2 position-relative"
                style="padding-right: 24px"
              >
                {{ item.trainingProgramNm }} /
                {{ item.trainingInstitutionNm }} ( {{ item.trainingStartDt }} ~
                {{ item.trainingEndDt ? item.trainingEndDt : '' }})
                <span
                  class="text-grey ms-2 position-absolute end-0 me-2"
                  style="top: 50%; transform: translateY(-50%)"
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
                @click.prevent="expandAllProjects"
              >
                <i class="fas fa-chevron-down me-2"></i>전체 펼치기
              </a>
              <a
                href="#"
                class="text-dark text-decoration-none small"
                @click.prevent="collapseAllProjects"
              >
                <i class="fas fa-chevron-up me-2"></i>전체 닫기
              </a>
            </div>
            <div
              v-for="(project, index) in resumeForm.projectHistoryList"
              :key="index"
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
                      project.isExpanded
                        ? 'fa-chevron-down'
                        : 'fa-chevron-right',
                      'me-2',
                    ]"
                  ></i>
                  <span>
                    {{ project.projectHistoryTask }} ({{
                      project.projectHistoryStartDt
                    }}
                    ~
                    <template v-if="project.projectHistoryEndDt">
                      {{ project.projectHistoryEndDt }}</template
                    >)
                  </span>
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
                      <strong>고객사:</strong>
                      {{ project.projectHistoryClient }}
                    </div>
                    <div class="col-sm-4">
                      <strong>업무단:</strong>
                      {{ project.projectHistoryTypeCdNm }}
                    </div>
                    <div class="col-sm-4">
                      <strong>역할:</strong>
                      {{ project.projectHistoryJobPositionTypeCdNm }}
                    </div>
                  </div>
                  <div class="row mb-2">
                    <!-- Device -->
                    <div class="col-sm-12">
                      <div
                        class="mb-2 d-flex align-items-center gap-2 flex-wrap"
                      >
                        <strong class="me-2">기종:</strong>
                        <div
                          v-for="skill in getSkillList(project, 'device')"
                          :key="skill.skillTagSq"
                          class="btn btn-rounded btn-light d-flex align-items-center gap-2 btn-3d position-relative mb-2 align-self-center"
                          style="padding-right: 24px"
                        >
                          <img
                            v-if="generateIconUrl(skill.skillTagNm)"
                            :src="generateIconUrl(skill.skillTagNm)"
                            :alt="skill.skillTagNm"
                            width="20"
                            height="20"
                          />
                          <span>{{ skill.skillTagNm }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- OS -->
                    <div class="col-sm-12">
                      <div
                        class="mb-2 d-flex align-items-center gap-2 flex-wrap"
                      >
                        <strong class="me-2">OS:</strong>
                        <div
                          v-for="skill in getSkillList(project, 'os')"
                          :key="skill.skillTagSq"
                          class="btn btn-rounded btn-light d-flex align-items-center gap-2 btn-3d position-relative mb-2 align-self-center"
                          style="padding-right: 24px"
                        >
                          <img
                            v-if="generateIconUrl(skill.skillTagNm)"
                            :src="generateIconUrl(skill.skillTagNm)"
                            :alt="skill.skillTagNm"
                            width="20"
                            height="20"
                          />
                          <span>{{ skill.skillTagNm }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- DBMS -->
                    <div class="col-sm-12">
                      <div
                        class="mb-2 d-flex align-items-center gap-2 flex-wrap"
                      >
                        <strong class="me-2">DBMS:</strong>
                        <div
                          v-for="skill in getSkillList(project, 'dbms')"
                          :key="skill.skillTagSq"
                          class="btn btn-rounded btn-light d-flex align-items-center gap-2 btn-3d position-relative mb-2 align-self-center"
                          style="padding-right: 24px"
                        >
                          <img
                            v-if="generateIconUrl(skill.skillTagNm)"
                            :src="generateIconUrl(skill.skillTagNm)"
                            :alt="skill.skillTagNm"
                            width="20"
                            height="20"
                          />
                          <span>{{ skill.skillTagNm }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Language -->
                    <div class="col-sm-12">
                      <div
                        class="mb-2 d-flex align-items-center gap-2 flex-wrap"
                      >
                        <strong class="me-2">언어:</strong>
                        <div
                          v-for="skill in getSkillList(project, 'language')"
                          :key="skill.skillTagSq"
                          class="btn btn-rounded btn-light d-flex align-items-center gap-2 btn-3d position-relative mb-2 align-self-center"
                          style="padding-right: 24px"
                        >
                          <img
                            v-if="generateIconUrl(skill.skillTagNm)"
                            :src="generateIconUrl(skill.skillTagNm)"
                            :alt="skill.skillTagNm"
                            width="20"
                            height="20"
                          />
                          <span>{{ skill.skillTagNm }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Tool -->
                    <div class="col-sm-12">
                      <div
                        class="mb-2 d-flex align-items-center gap-2 flex-wrap"
                      >
                        <strong class="me-2">TOOL:</strong>
                        <div
                          v-for="skill in getSkillList(project, 'tool')"
                          :key="skill.skillTagSq"
                          class="btn btn-rounded btn-light d-flex align-items-center gap-2 btn-3d position-relative mb-2 align-self-center"
                          style="padding-right: 24px"
                        >
                          <img
                            v-if="generateIconUrl(skill.skillTagNm)"
                            :src="generateIconUrl(skill.skillTagNm)"
                            :alt="skill.skillTagNm"
                            width="20"
                            height="20"
                          />
                          <span>{{ skill.skillTagNm }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Framework -->
                    <div class="col-sm-12">
                      <div
                        class="mb-2 d-flex align-items-center gap-2 flex-wrap"
                      >
                        <strong class="me-2">FW:</strong>
                        <div
                          v-for="skill in getSkillList(project, 'framework')"
                          :key="skill.skillTagSq"
                          class="btn btn-rounded btn-light d-flex align-items-center gap-2 btn-3d position-relative mb-2 align-self-center"
                          style="padding-right: 24px"
                        >
                          <img
                            v-if="generateIconUrl(skill.skillTagNm)"
                            :src="generateIconUrl(skill.skillTagNm)"
                            :alt="skill.skillTagNm"
                            width="20"
                            height="20"
                          />
                          <span>{{ skill.skillTagNm }}</span>
                        </div>
                      </div>
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
                v-for="(certificate, index) in resumeForm.certificationList"
                :key="index"
                class="btn btn-rounded btn-3d btn-light mb-2 position-relative"
              >
                {{ certificate.certificationNm }}
                <span
                  class="delete-icon text-grey ms-2"
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
                v-for="(skill, index) in resumeForm.skillTagList"
                :key="index"
                class="btn btn-rounded btn-light d-flex align-items-center gap-2 mb-2 btn-3d position-relative"
                style="padding-right: 24px"
              >
                <img
                  v-if="generateIconUrl(skill.skillTagNm)"
                  :src="generateIconUrl(skill.skillTagNm)"
                  :alt="skill.skillTagNm"
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

          <!-- 첨부파일 -->
          <!-- <div class="form-group mb-3">
            <label
              for="attachmentInput"
              class="form-label mb-1 text-2"
              style="font-weight: bold"
              >첨부파일</label
            >
            <input
              type="file"
              id="attachmentInput"
              @change="onAttachmentChange"
              multiple
              class="form-control"
            />
          </div> -->
          <div class="form-group mb-3">
            <label class="form-label mb-1 text-2" style="font-weight: bold">
              첨부파일
              <a
                href="#"
                class="text-grey text-decoration-none small ms-2"
                @click.prevent="fileInputRef?.click()"
              >
                + 추가하기
              </a>
            </label>

            <div class="mb-2 d-flex gap-2 flex-wrap">
              <div
                v-for="(file, index) in allAttachmentFiles"
                :key="file.fileOriginalNm + '-' + index"
                class="btn btn-rounded btn-light d-flex align-items-center gap-2 mb-2 btn-3d position-relative"
                style="padding-right: 24px; max-width: 100%"
              >
                <a
                  :href="file.url"
                  :download="file.fileOriginalNm"
                  class="text-truncate text-primary text-decoration-underline"
                  style="max-width: 200px"
                  :title="file.fileOriginalNm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ file.fileOriginalNm }}
                </a>
                <a
                  href="#"
                  class="position-absolute end-0 me-2 text-grey text-decoration-none"
                  style="top: 50%; transform: translateY(-50%)"
                  title="삭제"
                  @click.prevent="removeUnifiedAttachment(index)"
                >
                  ×
                </a>
              </div>
            </div>

            <!-- 숨겨진 파일 input -->
            <input
              type="file"
              ref="fileInputRef"
              class="d-none"
              multiple
              @change="onAttachmentChange"
              accept="*"
            />
          </div>

          <!-- 자기소개 -->
          <div class="form-group mb-3">
            <label class="form-label mb-1 text-2" style="font-weight: bold"
              >자기소개</label
            >
            <textarea
              v-model="resumeForm.resumeGreetingTxt"
              rows="5"
              class="form-control text-3 h-auto py-2"
              required
            ></textarea>
          </div>

          <!-- 동의 -->
          <div class="form-group mb-3">
            <div class="form-check">
              <input
                v-model="resumeForm.resumeIsNotificationYn"
                class="form-check-input"
                type="checkbox"
                id="agreeCheck"
                :true-value="'Y'"
                :false-value="'N'"
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
              @click="submitResume"
            >
              이력서 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import EducationSearchModal from '@/fo/components/mypage/personal/EducationSearchModal.vue'
import ResumeCompanyModal from '@/fo/components/mypage/personal/ResumeCompanyModal.vue'
import TrainingModal from '@/fo/components/mypage/personal/TrainingModal.vue'
import SkillTagModal from '@/fo/components/community/SkillTagModal.vue'
import ShowProjectFormModal from '@/fo/components/mypage/personal/ShowProjectFormModal.vue'
import LicenseModal from '@/fo/components/mypage/personal/LicenseModal.vue'

import { reactive, ref, computed, watch, onMounted } from 'vue'
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useModalStore } from '@/fo/stores/modalStore'
import { useProjectStore } from '@/fo/stores/ProjectHistoryStore'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'

const alertStore = useAlertStore()
const modalStore = useModalStore()
const projectStore = useProjectStore()
const router = useRouter()
const route = useRoute()

const resumeForm = reactive({
  resumeTtl: '',
  resumeNm: '',
  resumeBirthDt: '',
  resumePhoneNum: '',
  resumeEmail: '',
  resumeGreetingTxt: '',
  resumeIsNotificationYn: 'N',
  resumeIsRepresentativeYn: 'N',
  address: {
    zonecode: '',
    address: '',
    detailAddress: '',
    sigungu: '',
    latitude: null,
    longitude: null,
    areaCodeSq: null,
  },
  educationList: [],
  careerList: [],
  projectHistoryList: [],
  certificationList: [],
  trainingHistoryList: [],
  skillTagList: [],
})

const resumeId = route.params.resumeSq

const profileImages = ref([])
const attachments = ref([])

// 프로필 사진
const profileImageUrl = computed(
  () => {
    if (resumeForm.profileImage && resumeForm.profileImage.url) {
      return resumeForm.profileImage.url
    } else {
      return profileImages.value.length && profileImages.value[0]
        ? URL.createObjectURL(profileImages.value[0])
        : ''
    }
  },

  // {
  //   console.log('profileImages.value[0]', profileImages.value[0])
  //   return profileImages.value.length && profileImages.value[0]
  //     ? URL.createObjectURL(profileImages.value[0])
  //     : ''
  // },
)

function onProfileImageChange(event) {
  const maxSize = 10 * 1024 * 1024 // 10MB

  const file = event.target.files[0]
  if (file && file.size > maxSize) {
    alertStore.show(
      `"${file.name}" 파일은 10MB를 초과하여 첨부할 수 없습니다.`,
      'danger',
    )
    event.target.value = '' // input 초기화
    profileImages.value = []
    return
  }
  profileImages.value = file ? [file] : []
}

function deleteProfileImage() {
  resumeForm.profileImage = null
  profileImages.value = []
}

// 전화번호
function onPhoneInput(event) {
  const value = event.target.value
  const digits = value.replace(/\D/g, '') // 숫자 외 제거

  let formatted = ''
  if (digits.length <= 3) {
    formatted = digits
  } else if (digits.length <= 7) {
    formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
  } else {
    formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
  }

  resumeForm.resumePhoneNum = formatted // 수동으로 반영
}

// 주소
function openPostcode() {
  new window.daum.Postcode({
    oncomplete: function (data) {
      let addr = ''
      if (data.userSelectedType === 'R') {
        addr = data.roadAddress
      } else {
        addr = data.jibunAddress
      }

      resumeForm.address.zonecode = data.zonecode
      resumeForm.address.address = addr
      resumeForm.address.detailAddress = ''

      // 시군구 추출
      resumeForm.address.areaCodeSq = data.sigunguCode

      // 주소 → 좌표 변환
      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.addressSearch(addr, function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          resumeForm.address.latitude = result[0].y
          resumeForm.address.longitude = result[0].x
        } else {
          resumeForm.address.latitude = null
          resumeForm.address.longitude = null
        }
      })
    },
  }).open()
}

// 첨부파일
// function onAttachmentChange(event) {
//   const files = Array.from(event.target.files)
//   const maxSize = 10 * 1024 * 1024 // 10MB

//   const validFiles = []
//   let hasInvalid = false

//   for (const file of files) {
//     if (file.size > maxSize) {
//       alertStore.show(
//         `"${file.name}" 파일은 10MB를 초과하여 첨부할 수 없습니다.`,
//         'danger',
//       )
//       hasInvalid = true
//     } else {
//       validFiles.push(file)
//     }
//   }

//   attachments.value = validFiles

//   // 크기 초과 파일이 있으면 input을 초기화 (사용자가 다시 선택하도록)
//   if (hasInvalid) {
//     event.target.value = ''
//   }
// }
// 서버에서 불러온 기존 첨부파일 리스트 (등록 시엔 빈 배열로 초기화)
const existingAttachments = ref([])

function setExistingAttachments(data) {
  existingAttachments.value = data
}

const fileInputRef = ref(null)
const maxSize = 10 * 1024 * 1024 // 10MB

// 기존 파일 + 새 파일 통합 리스트 계산
const allAttachmentFiles = computed(() => {
  return [
    ...existingAttachments.value.map((f) => ({
      fileOriginalNm: f.fileOriginalNm,
      url: f.url,
      isExisting: true,
    })),
    ...attachments.value.map((f) => ({
      fileOriginalNm: f.name,
      url: URL.createObjectURL(f),
      isExisting: false,
    })),
  ]
})

// 첨부파일 삭제 (기존/신규 구분하여 제거)
function removeUnifiedAttachment(index) {
  const file = allAttachmentFiles.value[index]
  if (file.isExisting) {
    const i = existingAttachments.value.findIndex(
      (f) => f.fileOriginalNm === file.fileOriginalNm,
    )
    if (i !== -1) existingAttachments.value.splice(i, 1)
  } else {
    const i = attachments.value.findIndex((f) => f.name === file.fileOriginalNm)
    if (i !== -1) attachments.value.splice(i, 1)
  }
}

// 첨부파일 선택 시 유효성 검사 및 추가
function onAttachmentChange(event) {
  const files = Array.from(event.target.files)
  let hasInvalid = false
  const validFiles = []

  for (const file of files) {
    if (file.size > maxSize) {
      alert(`"${file.name}" 파일은 10MB를 초과하여 첨부할 수 없습니다.`)
      hasInvalid = true
    } else {
      validFiles.push(file)
    }
  }

  // 중복 파일명 방지
  const existingNames = attachments.value.map((f) => f.name)
  validFiles.forEach((file) => {
    if (!existingNames.includes(file.name)) {
      attachments.value.push(file)
    }
  })

  if (hasInvalid) {
    event.target.value = ''
  }
  console.log('resumeForm.attachments', resumeForm.attachments)
}

// 학력 입력 폼 표시 로직
const showEducationForm = () => {
  modalStore.openModal(EducationSearchModal, {
    onComplete: (edu) => {
      resumeForm.educationList.push(edu)
    },
  })
}

const removeEducation = (index) => {
  resumeForm.educationList.splice(index, 1)
}

// 경력 입력 폼 표시 로직
const showCareerForm = () => {
  modalStore.openModal(ResumeCompanyModal, {
    onComplete: (career) => {
      resumeForm.careerList.push(career)
    },
  })
}

const removeCareer = (index) => {
  resumeForm.careerList.splice(index, 1)
}

// 교육 입력 폼 표시 로직
const showTrainingForm = () => {
  modalStore.openModal(TrainingModal, {
    onComplete: (training) => {
      resumeForm.trainingHistoryList.push(training)
    },
  })
}

const removeTraining = (index) => {
  resumeForm.trainingHistoryList.splice(index, 1)
}

// 프로젝트 입력 폼 표시 로직
const showProjectForm = () => {
  const index = resumeForm.projectHistoryList.length
  projectStore.resetProject(index)
  modalStore.openModal(ShowProjectFormModal, {
    projectId: index,
    onComplete: (project) => {
      // skillTags 포함된 project가 넘어옴
      resumeForm.projectHistoryList.push(project)
    },
  })
}

const removeProject = (index) => {
  resumeForm.projectHistoryList.splice(index, 1)
  projectStore.resetProject(index)
}

// 프로젝트 토글
const toggleProject = (index) => {
  resumeForm.projectHistoryList[index].isExpanded =
    !resumeForm.projectHistoryList[index].isExpanded
}

// 전체 프로젝트 펼치기/접기
const expandAllProjects = () => {
  resumeForm.projectHistoryList.forEach(
    (project) => (project.isExpanded = true),
  )
}

const collapseAllProjects = () => {
  resumeForm.projectHistoryList.forEach(
    (project) => (project.isExpanded = false),
  )
}

// 프로젝트가 추가/변경될 때 전체 펼침
watch(
  () => resumeForm.projectHistoryList.length,
  () => {
    resumeForm.projectHistoryList.forEach((project) => {
      project.isExpanded = true
    })
  },
  { immediate: true },
)

// 자격증 입력 폼 표시 로직
const showCertificateForm = () => {
  modalStore.openModal(LicenseModal, {
    selectedLicense: resumeForm.certificationList,
    onLicenseSelected: (license) => {
      resumeForm.certificationList.push({
        certificationNm: license.name,
        certificationCd: license.id,
      })
    },
  })
}

const removeCertificate = (index) => {
  resumeForm.certificationList.splice(index, 1)
}

// 기술 입력 폼 표시 로직
const showSkillsForm = () => {
  modalStore.openModal(SkillTagModal, {
    skillTags: resumeForm.skillTagList,
    onConfirm: (skills) => {
      console.log(skills)
      resumeForm.skillTagList = skills
    },
  })
}

const removeSkill = (index) => {
  resumeForm.skillTagList.splice(index, 1)
}

const generateIconUrl = (name) => {
  const supportedIcons = {
    Java: 'java',
    Python: 'python',
    'Spring Boot': 'spring',
    Django: 'django',
    React: 'react',
    'Vue.js': 'vuejs',
    Docker: 'docker',
    Git: 'git',
    Windows: 'windows8',
    MacOS: 'apple',
    Linux: 'linux',
    MySQL: 'mysql',
    OracleDB: 'oracle',
    MongoDB: 'mongodb',
    MariaDB: 'mariadb',
    Redis: 'redis',
    PC: 'monitor', // 추가
    노트북: 'laptop', // 추가
  }

  const mapped = supportedIcons[name]
  if (!mapped) return null

  // devicon이 아닌 lucide 아이콘 처리
  if (name === 'PC' || name === '노트북') {
    return `https://cdn.jsdelivr.net/npm/lucide-static/icons/${mapped}.svg`
  }

  const fileName =
    name === 'Django' ? `${mapped}-plain.svg` : `${mapped}-original.svg`

  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${mapped}/${fileName}`
}

// 프로젝트 스킬 리스트 api 구조화

function flattenSkillTags(skillTags) {
  if (!skillTags) return []
  return Object.values(skillTags).flat()
}

function cleanProjectHistoryList(projectHistoryList) {
  // skillTags에서 skillTagList로 변환 후 skillTags 제거
  return projectHistoryList.map(({ skillTags, ...rest }) => ({
    ...rest,
    skillTagList: flattenSkillTags(skillTags),
  }))
}
function getSkillList(project, category) {
  return project.skillTags?.[category] || []
}

function convertSkillTagListToGrouped(skillTagList, parentTags) {
  // 1. 미리 모든 카테고리를 소문자 키로 초기화
  const grouped = {}
  parentTags.forEach((tag) => {
    grouped[tag.skillTagNm.toLowerCase()] = []
  })

  // 2. 각 skill을 부모 태그 기준으로 분류
  skillTagList.forEach((skill) => {
    const parent = parentTags.find(
      (p) => p.skillTagSq === skill.parentSkillTagSq,
    )
    if (!parent) return
    const key = parent.skillTagNm.toLowerCase()
    if (key in grouped) {
      grouped[key].push(skill)
    }
  })

  return grouped
}

onMounted(async () => {
  if (resumeId) {
    const data = await api.$get(`/mypage/resume/${resumeId}`)

    // 1. 이력서 기본값 세팅
    Object.assign(resumeForm, data.output)

    // 2. 상위 태그 불러오기
    const parentTags = await api.$get(
      '/mypage/resume/project-history/parent-skill',
    )

    // 3. 각 프로젝트의 skillTagList → skillTags로 가공
    resumeForm.projectHistoryList.forEach((project) => {
      project.skillTags = convertSkillTagListToGrouped(
        project.skillTagList,
        parentTags.output,
      )
    })

    setExistingAttachments(resumeForm.attachmentList)
    console.log('resumeForm', resumeForm)
  }
})

async function submitResume() {
  if (!resumeForm.resumeTtl?.trim()) {
    return alertStore.show('이력서 제목을 입력하세요.', 'danger')
  }

  if (!resumeForm.resumeNm?.trim()) {
    return alertStore.show('이름을 입력하세요.', 'danger')
  }

  if (!resumeForm.resumeBirthDt) {
    return alertStore.show('생년월일을 입력하세요.', 'danger')
  }

  if (!resumeForm.resumePhoneNum?.trim()) {
    return alertStore.show('전화번호를 입력하세요.', 'danger')
  } else if (!/^010-\d{4}-\d{4}$/.test(resumeForm.resumePhoneNum)) {
    return alertStore.show(
      '전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678',
      'danger',
    )
  }

  if (!resumeForm.resumeEmail?.trim()) {
    return alertStore.show('이메일을 입력하세요.', 'danger')
  } else if (
    !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(resumeForm.resumeEmail)
  ) {
    return alertStore.show('이메일 형식이 올바르지 않습니다.', 'danger')
  }

  if (!resumeForm.address.address?.trim()) {
    return alertStore.show('주소를 입력하세요.', 'danger')
  }

  if (!resumeForm.resumeGreetingTxt?.trim()) {
    return alertStore.show('자기소개를 입력하세요.', 'danger')
  }

  // 정리된 프로젝트 리스트
  const cleanedProjectHistoryList = cleanProjectHistoryList(
    resumeForm.projectHistoryList,
  )

  // API 요청용 JSON
  const apiJson = {
    ...resumeForm,
    projectHistoryList: cleanedProjectHistoryList,
  }

  const formData = new FormData()
  const jsonBlob = new Blob([JSON.stringify(apiJson)], {
    type: 'application/json',
  })
  formData.append('dto', jsonBlob)

  profileImages.value.forEach((file) => {
    formData.append('profileImages', file)
  })
  attachments.value.forEach((file) => {
    formData.append('attachments', file)
  })

  try {
    if (resumeId) {
      await api.$put(`/mypage/resume/${resumeId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      await api.$post('/mypage/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    console.log('폼데이터 내용:')
    for (let [key, value] of formData.entries()) {
      if (value instanceof Blob) {
        value.text().then((text) => {
          console.log(`${key} (Blob):`, text)
        })
      } else {
        console.log(`${key}:`, value)
      }
    }

    alertStore.show('이력서가 등록되었습니다.', 'success')
    router.push('/mypage/resumeList')
  } catch (error) {
    console.error(error)
    alertStore.show('등록 중 오류가 발생했습니다.', 'danger')
  }
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
