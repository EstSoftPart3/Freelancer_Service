<template lang="">
  <div class="d-flex layout-wrapper mx-auto">
    <div
      class="tab-pane tab-pane-navigation active show content px-3 px-md-4"
      id="projectRegisterForm"
      role="tabpanel"
    >
      <h4 class="mb-3">프로젝트 등록</h4>
      <div class="card bg-color-grey mb-4">
        <div class="card-body">
          <form
            class="contact-form form-style-2"
            @submit.prevent="submitProject"
          >
            <!-- 프로젝트 제목 -->
            <div class="row">
              <div class="form-group col">
                <label class="form-label mb-1 text-2" style="font-weight: bold"
                  >프로젝트 제목
                  <i
                    v-if="valids.title"
                    class="bi bi-check-circle-fill ms-1 text-primary"
                  ></i
                ></label>
                <input
                  type="text"
                  class="form-control text-3 h-auto py-2"
                  name="title"
                  placeholder="예: 쇼핑몰 관리자 시스템 구축"
                  v-model="projectTitle"
                  required=""
                />
                <div v-if="errors.title" class="text-primary small mt-1">
                  {{ errors.title }}
                </div>
              </div>
            </div>

            <!-- 프로젝트 장소 -->
            <div class="row">
              <div class="form-group col-lg-7">
                <label class="form-label mb-1 text-2" style="font-weight: bold"
                  >근무지 주소
                  <i
                    v-if="valids.address"
                    class="bi bi-check-circle-fill ms-1 text-primary"
                  ></i
                ></label>
                <div class="input-group position-relative">
                  <input
                    type="text"
                    class="form-control text-2"
                    v-model="form.address"
                    readonly
                    placeholder="주소 검색을 이용해주세요"
                    @click="openPostcode"
                    style="padding-right: 30px"
                  />
                  <button
                    v-if="form.address"
                    class="btn p-0 border-0 bg-transparent position-absolute end-0 top-50 translate-middle-y me-2"
                    style="z-index: 10"
                    type="button"
                    @click="clearDetailedAddress"
                  >
                    <i
                      class="bi bi-x-lg text-muted"
                      style="font-size: 0.8rem"
                    ></i>
                  </button>
                </div>
              </div>
              <div class="form-group col-lg-5">
                <label class="form-label mb-1 text-2" style="font-weight: bold"
                  >상세 주소</label
                >
                <div class="input-group position-relative">
                  <input
                    type="text"
                    class="form-control text-2"
                    v-model="form.detailAddress"
                    placeholder="상세 주소를 입력하세요."
                    style="padding-right: 30px"
                  />
                  <button
                    v-if="form.detailAddress"
                    class="btn p-0 border-0 bg-transparent position-absolute end-0 top-50 translate-middle-y me-2"
                    style="z-index: 10"
                    type="button"
                    @click="form.detailAddress = ''"
                  >
                    <i
                      class="bi bi-x-lg text-muted"
                      style="font-size: 0.8rem"
                    ></i>
                  </button>
                </div>
              </div>

              <div class="form-group col-lg-12">
                <label class="form-label mb-1 text-2" style="font-weight: bold"
                  >지하철역 주소</label
                >
                <div class="input-group position-relative">
                  <input
                    type="text"
                    class="form-control text-2"
                    v-model="form.subwayAddressName"
                    readonly
                    placeholder="지하철역을 검색해주세요."
                    @click="openSubwaySearch"
                    style="padding-right: 30px"
                  />
                  <button
                    v-if="form.subwayAddressName"
                    class="btn p-0 border-0 bg-transparent position-absolute end-0 top-50 translate-middle-y me-2"
                    style="z-index: 10"
                    type="button"
                    @click="clearSubwayAddress"
                  >
                    <i
                      class="bi bi-x-lg text-muted"
                      style="font-size: 0.8rem"
                    ></i>
                  </button>
                </div>
                <div v-if="errors.address" class="text-primary small mt-1">
                  {{ errors.address }}
                </div>
              </div>
            </div>
            <!-- 개발자 등급 / 학력 -->
            <div class="row">
              <div class="form-group col-lg-6">
                <label class="form-label mb-1 text-2" style="font-weight: bold"
                  >개발자 등급(경력)
                  <i
                    v-if="valids.devGrade"
                    class="bi bi-check-circle-fill text-primary"
                  ></i
                ></label>
                <select
                  class="form-select form-control h-auto"
                  name="career"
                  v-model="selectedDevGrade"
                  required=""
                >
                  <option value="">선택</option>
                  <option
                    v-for="grade in devGrades"
                    :key="grade.id"
                    :value="grade"
                  >
                    {{ grade }}
                  </option>
                </select>
                <div v-if="errors.devGrade" class="text-primary small mt-1">
                  {{ errors.devGrade }}
                </div>
              </div>
              <div class="form-group col-lg-6">
                <label class="form-label mb-1 text-2" style="font-weight: bold"
                  >학력
                  <i
                    v-if="valids.education"
                    class="bi bi-check-circle-fill text-primary"
                  ></i
                ></label>
                <select
                  class="form-select form-control h-auto"
                  name="education"
                  v-model="selectedEducation"
                  required=""
                >
                  <option value="">선택</option>
                  <option
                    v-for="education in educationLevels"
                    :key="education.id"
                    :value="education"
                  >
                    {{ education }}
                  </option>
                </select>
                <div v-if="errors.education" class="text-primary small mt-1">
                  {{ errors.education }}
                </div>
              </div>
            </div>
            <!-- 프로젝트 기간 -->
            <div class="row">
              <div class="form-group col">
                <label class="form-label mb-1 text-2" style="font-weight: bold"
                  >프로젝트 기간
                  <i
                    v-if="valids.projectPeriod"
                    class="bi bi-check-circle-fill text-primary"
                  ></i
                ></label>
                <a
                  href="#"
                  @click.prevent="openProjectCalenderModal"
                  class="text-grey text-decoration-none small ms-2"
                  >+ 추가하기</a
                >
                <input
                  type="text"
                  class="form-control text-3 h-auto py-2 readonly"
                  name="period"
                  placeholder="예: 2025-04 ~ 2025-10"
                  v-model="projectPeriodDisplay"
                  required=""
                  readonly
                />
                <div
                  v-if="errors.projectPeriod"
                  class="text-primary small mt-1"
                >
                  {{ errors.projectPeriod }}
                </div>
              </div>
            </div>

            <!-- 모집 기간 -->
            <div class="row">
              <div class="form-group col">
                <label class="form-label mb-1 text-2" style="font-weight: bold"
                  >모집 기간
                  <i
                    v-if="valids.recruitPeriod"
                    class="bi bi-check-circle-fill text-primary"
                  ></i
                ></label>
                <a
                  href="#"
                  @click.prevent="openRecruitCalenderModal"
                  class="text-grey text-decoration-none small ms-2"
                  >+ 추가하기</a
                >
                <input
                  type="text"
                  class="form-control text-3 h-auto py-2 readonly"
                  name="period"
                  placeholder="예: 2025-04 ~ 2025-10"
                  v-model="recruitPeriodDisplay"
                  required=""
                  readonly
                />
                <div
                  v-if="errors.recruitPeriod"
                  class="text-primary small mt-1"
                >
                  {{ errors.recruitPeriod }}
                </div>
              </div>
            </div>
            <!-- 근무형태 / 모집직군 -->

            <div class="form-group mb-3">
              <label class="form-label mb-1 text-2" style="font-weight: bold"
                >단가
                <i
                  v-if="valids.salary"
                  class="bi bi-check-circle-fill text-primary"
                ></i
              ></label>
              <div class="d-flex align-items-center gap-2">
                <input
                  type="text"
                  class="form-control text-3 h-auto py-2"
                  v-model="projectSalary"
                  placeholder="예: 5000000"
                />
                <div class="form-check form-check-inline mb-0 text-nowrap">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="salaryNeg"
                    v-model="isSalaryNegotiable"
                    true-value="Y"
                    false-value="N"
                  />
                  <label
                    class="form-check-label text-2 font-weight-bold"
                    for="salaryNeg"
                    >단가 협의</label
                  >
                </div>
              </div>
              <div v-if="errors.salary" class="text-primary small mt-1">
                {{ errors.salary }}
              </div>
            </div>
            <div class="form-group mb-3">
              <label class="form-label mb-1 text-2" style="font-weight: bold">
                근무 형태
                <i
                  v-if="valids.workType"
                  class="bi bi-check-circle-fill text-primary"
                ></i>
                <a
                  href="#"
                  @click.prevent="openWorkTypeModal"
                  class="text-grey text-decoration-none small ms-2"
                  >+ 추가하기</a
                >
              </label>

              <div
                id="selectedSkillsPreview"
                class="mb-2 d-flex gap-2 flex-wrap"
              >
                <ProjectJobButtonGroup
                  v-if="selectedWorkTypes.length > 0"
                  @remove="removeWorkType"
                  :selectedJobs="selectedWorkTypes"
                />
              </div>
              <div v-if="errors.workType" class="text-primary small mt-1">
                {{ errors.workType }}
              </div>
            </div>
            <div class="form-group mb-3">
              <label class="form-label mb-1 text-2" style="font-weight: bold">
                모집 직군
                <i
                  v-if="valids.job"
                  class="bi bi-check-circle-fill text-primary"
                ></i>
                <a
                  href="#"
                  @click.prevent="openJobModal"
                  class="text-grey text-decoration-none small ms-2"
                  >+ 추가하기</a
                >
              </label>

              <div
                id="selectedSkillsPreview"
                class="mb-2 d-flex gap-2 flex-wrap"
              >
                <ProjectJobButtonGroup
                  v-if="selectedJobs.length > 0"
                  @remove="removeJob"
                  :selectedJobs="selectedJobs"
                />
              </div>
              <div v-if="errors.job" class="text-primary small mt-1">
                {{ errors.job }}
              </div>
            </div>

            <!-- 기술 -->
            <div class="form-group mb-3">
              <div class="d-flex align-items-center mb-1">
                <label class="form-label text-2 fw-bold mb-0"
                  >사용 기술
                  <i
                    v-if="valids.skills"
                    class="bi bi-check-circle-fill text-primary"
                  ></i
                ></label>
                <a
                  href="#"
                  @click.prevent="openSkillModal"
                  class="text-grey text-decoration-none small ms-2"
                  >+ 추가하기</a
                >
              </div>

              <!-- 선택된 기술 미리보기 -->
              <div
                id="selectedSkillsPreview"
                class="mb-2 d-flex gap-2 flex-wrap"
              >
                <ProjectSkillButtonGroup
                  v-if="selectedSkills.length > 0"
                  :selectedSkills="selectedSkills"
                  @remove="removeSkill"
                />
              </div>
              <div v-if="errors.skills" class="text-primary small mt-1">
                {{ errors.skills }}
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label mb-1 text-2" style="font-weight: bold"
                >우대 기술
                <i
                  v-if="valids.preferSkills"
                  class="bi bi-check-circle-fill text-primary"
                ></i>
                <a
                  href="#"
                  @click.prevent="openPreferSkillModal"
                  class="text-grey text-decoration-none small ms-2"
                  >+ 추가하기</a
                >
              </label>
              <div
                id="selectedSkillsPreview"
                class="mb-2 d-flex gap-2 flex-wrap"
              >
                <ProjectSkillButtonGroup
                  @remove="removePreferSkill"
                  v-if="selectedPreferSkills.length > 0"
                  :selectedSkills="selectedPreferSkills"
                />
              </div>
              <div v-if="errors.preferSkills" class="text-primary small mt-1">
                {{ errors.preferSkills }}
              </div>
            </div>

            <!-- 자격요건 -->
            <div class="row">
              <div class="form-group col">
                <label class="form-label mb-1 text-2" style="font-weight: bold"
                  >우대 사항
                  <i
                    v-if="valids.preference"
                    class="bi bi-check-circle-fill text-primary"
                  ></i>
                </label>

                <!-- 태그 리스트 -->
                <div class="mb-2">
                  <span
                    class="badge me-1"
                    :style="{
                      backgroundColor: '#0088CC',
                      color: 'white',
                      cursor: 'pointer',
                    }"
                    v-for="(item, index) in preferList"
                    :key="index"
                    @click="preferList.splice(index, 1)"
                    title="클릭하여 삭제"
                  >
                    {{ item }} &times;
                  </span>
                </div>

                <input
                  type="text"
                  class="form-control text-3 h-auto py-2"
                  v-model="preferContent"
                  placeholder="쉼표(,)로 구분하여 입력"
                  name="qualification"
                />
                <div v-if="errors.preference" class="text-primary small mt-1">
                  {{ errors.preference }}
                </div>
              </div>
            </div>

            <!-- 상세내용 -->
            <div class="row">
              <div class="form-group col">
                <label class="form-label mb-1 text-2" style="font-weight: bold"
                  >상세 내용
                  <i
                    v-if="valids.description"
                    class="bi bi-check-circle-fill text-primary"
                  ></i
                ></label>
                <textarea
                  maxlength="5000"
                  rows="6"
                  class="form-control text-3 h-auto py-2"
                  name="description"
                  v-model="description"
                  required=""
                ></textarea>
                <div v-if="errors.description" class="text-primary small mt-1">
                  {{ errors.description }}
                </div>
              </div>
            </div>

            <div class="form-group mb-3">
              <label
                class="form-label mb-1 text-2"
                style="font-weight: bold; position: relative"
              >
                인터뷰 가능 시간
                <i
                  v-if="valids.interview"
                  class="bi bi-check-circle-fill text-primary"
                ></i>
                <a
                  href="#"
                  @click.prevent="openInterviewTimeModal"
                  class="text-grey text-decoration-none small ms-2"
                  >+ 추가하기</a
                >
              </label>

              <div
                id="selectedSkillsPreview"
                class="mb-2 d-flex gap-2 flex-wrap"
              >
                <ProjectInverviewTimeButtonGroupVue
                  @remove="removeInterviewTime"
                  :interviewTimes="selectedInterviewTimes"
                />
              </div>
              <div v-if="errors.interview" class="text-primary small mt-1">
                {{ errors.interview }}
              </div>
            </div>

            <!-- 알림발신 -->
            <div class="form-group">
              <div class="form-check d-inline-flex align-items-center gap-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="notifyCheckbox"
                  v-model="notifyEnabled"
                />
                <label class="form-check-label mb-0" for="notifyCheckbox">
                  알림 발신 여부
                </label>
              </div>
            </div>

            <!-- 등록 / 취소 버튼 -->
            <div class="row">
              <div class="form-group col">
                <button type="submit" class="btn btn-primary">등록</button>
                <button type="reset" class="btn btn-light">취소</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CalendarModal from '@/fo/components/project/CalendarModal.vue'
import SkillSelectModal from '@/fo/components/project/SkillSelectModal.vue'
import WorkTypeModal from '@/fo/components/project/WorkTypeModal.vue'
import JobModal from '@/fo/components/project/JobModal.vue'
import InterviewTimeModal from '@/fo/components/project/InterviewTimeModal.vue'
import SubwaySearchModal from '@/fo/components/project/SubwaySearchModal.vue'
import ProjectJobButtonGroup from '@/fo/components/project/ProjectJobButtonGroup.vue'
import ProjectSkillButtonGroup from '@/fo/components/project/ProjectSkillButtonGroup.vue'
import ProjectInverviewTimeButtonGroupVue from '@/fo/components/project/ProjectInverviewTimeButtonGroup.vue'
import { useModalStore } from '../../../stores/modalStore.js'
import { useRoute, useRouter } from 'vue-router'

import { ref, computed, watch, onMounted, reactive } from 'vue'

import { api } from '@/axios.js'
import { useAlertStore } from '../../../stores/alertStore.js'

const route = useRoute()
const router = useRouter()
const projectSq = route.params.project_sq || null // 등록이면 NULL, 수정이면 숫자
// console.log(projectSq)

const cities = ref([])
const districts = ref([])
const devGrades = ref([])
const educationLevels = ref([])
const recruitJobs = ref([])
const workTypes = ref([])
const skills = ref([])
const isSalaryNegotiable = ref('N') // 단가 협의 상태

const projectTitle = ref('')
const projectSalary = ref('')
const selectedCity = ref(null)
const selectedDistrict = ref(null)
const selectedCityName = computed(() => {
  const raw =
    cities.value.find((city) => city.code === selectedCity.value)?.name || ''
  return raw.replace('전체', '') // '서울전체' → '서울'
})

const selectedDistrictName = computed(() => {
  const raw =
    districts.value.find((district) => district.code === selectedDistrict.value)
      ?.name || ''
  return raw.replace('전체', '') // 필요 시 동일하게 처리
})
const selectedDevGrade = ref('')
const selectedEducation = ref('')
const projectStartDt = ref('')
const projectEndDt = ref('')
const recruitStartDt = ref('')
const recruitEndDt = ref('')
const selectedInterviewTimes = ref([])
const selectedWorkTypes = ref([])
const selectedJobs = ref([])
const selectedSkills = ref([])
const selectedPreferSkills = ref([])
const preferContent = ref('')
const preferList = ref([])
const description = ref('')
const notifyEnabled = ref(false)

const modalStore = useModalStore()
const alertStore = useAlertStore()

// 모달 열려있는 동안 부모 페이지 스크롤 비활성화, 닫히면 다시 활성화
const isOpen = computed(() => modalStore.isOpen)

let prevScrollY = 0

const form = reactive({
  // 상세 주소 (다음 API)
  postcode: '',
  address: '',
  detailAddress: '',
  latitude: null,
  longitude: null,
  sigunguCode: null,

  // 지하철 주소 (카카오 API)
  subwayAddressName: '',
  subwayLat: null,
  subwayLon: null,
  subwaySigunguCode: null,
})

const loadKakao = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps?.services?.Geocoder) return resolve()

    // 이미 로딩 중이면 기다림
    if (!document.querySelector('script[src*="dapi.kakao.com"]')) {
      const script = document.createElement('script')
      script.src =
        'https://dapi.kakao.com/v2/maps/sdk.js?appkey=90610faa13d02b09f83a700d0885a872&libraries=services'
      script.async = false
      document.head.appendChild(script)

      script.onload = () => {
        const start = Date.now()
        const timer = setInterval(() => {
          if (window.kakao?.maps?.services?.Geocoder) {
            clearInterval(timer)
            resolve()
          } else if (Date.now() - start > 7000) {
            clearInterval(timer)
            reject('⏱ Geocoder 로딩 7초 초과 실패')
          }
        }, 100)
      }

      script.onerror = () => reject('❌ Kakao 지도 API 스크립트 로드 실패')
    }
  })
}

// 1. 다음 주소 API 실행 (상세 주소)
const openPostcode = () => {
  new window.daum.Postcode({
    oncomplete: (data) => {
      form.address =
        data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
      form.postcode = data.zonecode
      form.sigunguCode = data.sigunguCode // 다음 API 제공 5자리 코드

      // 좌표 변환
      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.addressSearch(form.address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          form.latitude = result[0].y
          form.longitude = result[0].x
        }
      })
    },
  }).open()
}

// 지하철역 검색 모달 표시 로직
const openSubwaySearch = () => {
  modalStore.openModal(SubwaySearchModal, {
    onSubwaySelected: (subway) => {
      // 1. 기본 정보 매핑
      form.subwayAddressName = subway.place_name
      form.subwayLat = subway.y
      form.subwayLon = subway.x

      // 2. 주소 정보를 바탕으로 시군구 코드 추출 (Geocoder)
      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.addressSearch(subway.address_name, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const bCode = result[0].address.b_code // 10자리 법정동 코드
          form.subwaySigunguCode = bCode.substring(0, 5) // 앞 5자리 시군구 코드
          // console.log('추출된 시군구 코드:', form.subwaySigunguCode)
        }
      })
    },
  })
}

const loadDefaultFormData = async () => {
  try {
    const response = await api.$get('/projects/forms')
    cities.value = response.output.cities.map((city) => ({
      code: city.areaSq,
      name: city.areaName,
    }))
    devGrades.value = response.output.devGrades
    educationLevels.value = response.output.educationLevels
    recruitJobs.value = response.output.recruitJobs
    workTypes.value = response.output.workTypes
    skills.value = response.output.skills
  } catch (e) {
    console.error('프로젝트 정보 불러오기 실패 (신규)', e)
  }
}

const loadEditFormData = async (projectSq) => {
  try {
    const { output } = await api.$get(`/projects/forms`, {
      params: { projectSq },
    })

    // 기초 데이터 로드
    cities.value = output.cities.map((city) => ({
      code: city.areaSq,
      name: city.areaName,
    }))
    devGrades.value = output.devGrades
    educationLevels.value = output.educationLevels
    recruitJobs.value = output.recruitJobs
    workTypes.value = output.workTypes
    skills.value = output.skills

    const exist = output.existProjectVo
    if (!exist) return

    // 1. 기본 정보 덮어쓰기
    projectTitle.value = exist.projectTtl
    projectSalary.value = exist.projectSalary
    isSalaryNegotiable.value = exist.salaryNegotiableYn || 'N' // 단가 협의 여부 추가

    // 2. [수정] 상세 주소 정보 덮어쓰기 (Null 체크 적용)
    if (exist.parentDistrict && exist.parentDistrict.areaSq) {
      selectedCity.value = exist.parentDistrict.areaSq
      await fetchDistricts(exist.parentDistrict.areaSq) // 구 목록 로드
      selectedDistrict.value = exist.subDistrict?.areaSq || ''
    }

    // 3. [추가] 상세 주소 문자열 및 좌표 폼에 세팅
    form.address = exist.detailedAddress || ''
    form.detailAddress = exist.detailedAddressDetail || ''

    // 4. [추가] 지하철 주소 정보 세팅
    form.subwayAddressName = exist.subwayAddress || ''

    // 5. [추가] 좌표 정보 (상세 or 지하철 우선순위에 따른 값)
    form.latitude = exist.latitude
    form.longitude = exist.longitude

    // 기타 정보 덮어쓰기 (기존 동일)
    selectedDevGrade.value = exist.devGrade
    selectedEducation.value = exist.educationLvl
    projectStartDt.value = exist.projectStartDt
    projectEndDt.value = exist.projectEndDt
    recruitStartDt.value = exist.recruitStartDt
    recruitEndDt.value = exist.recruitEndDt
    selectedWorkTypes.value = [...exist.contract]
    selectedJobs.value = [...exist.jobs]
    selectedSkills.value = [...exist.reqSkills]
    selectedPreferSkills.value = [...exist.preferSkills]

    preferList.value = exist.preferredEtc
      ? exist.preferredEtc
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    preferContent.value = ''
    description.value = exist.description

    selectedInterviewTimes.value = Object.entries(exist.interviewTimes).map(
      ([date, times]) => ({ date, times }),
    )

    isInitialLoad.value = false
  } catch (e) {
    console.error('프로젝트 상세 조회 실패 (수정)', e)
    alertStore.show(
      '프로젝트 정보를 불러오는 중 오류가 발생했습니다.',
      'danger',
    )
    router.push({ name: 'ProjectListPage' })
  }
}

onMounted(async () => {
  if (!projectSq) {
    await loadDefaultFormData() // 신규 등록용
  } else {
    await loadEditFormData(projectSq) // 수정용
  }
})

const fetchDistricts = async (areaCodeSq) => {
  if (!areaCodeSq) {
    districts.value = []
    selectedDistrict.value = ''
    return
  }

  try {
    const response = await api.$get(`/projects/${areaCodeSq}/districts`)
    districts.value = response.output.map((area) => ({
      code: area.areaSq,
      name: area.areaName,
    }))
  } catch (err) {
    console.error('구 정보 불러오기 실패', err)
  }
}

watch([selectedCity, selectedDistrict], async () => {
  const cityName = selectedCityName.value
  const districtName = selectedDistrictName.value
  if (!cityName || !districtName) return

  try {
    await loadKakao()
    const geocoder = new window.kakao.maps.services.Geocoder()
    const fullAddr = `${cityName} ${districtName}`
    geocoder.addressSearch(fullAddr, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        form.latitude = result[0].y
        form.longitude = result[0].x
        // console.log('📍 좌표 변환 완료:', result[0])
      } else {
        console.warn('❌ 좌표 변환 실패:', fullAddr)
      }
    })
  } catch (err) {
    console.error('❌ Geocoder 초기화 실패:', err)
  }
})
const isInitialLoad = ref(true)

watch(selectedCity, async (newCityCode) => {
  await fetchDistricts(newCityCode)

  if (isInitialLoad.value) return // 최초 초기화일 때는 초기화하지 않음

  // 기존 선택된 하위 지역이 목록에 없다면 초기화
  const exists = districts.value.some(
    (district) => district.code === selectedDistrict.value,
  )

  if (!exists) {
    selectedDistrict.value = ''
  }
})

// --- 유효성 검사 상태 변수 ---
const errors = reactive({
  title: '',
  address: '',
  devGrade: '',
  education: '',
  projectPeriod: '',
  recruitPeriod: '',
  salary: '',
  workType: '',
  job: '',
  skills: '',
  preferSkills: '',
  preference: '',
  description: '',
  interview: '',
})

const valids = reactive({
  title: false,
  address: false,
  devGrade: false,
  education: false,
  projectPeriod: false,
  recruitPeriod: false,
  salary: false,
  workType: false,
  job: false,
  skills: false,
  preferSkills: false,
  preference: false,
  description: false,
  interview: false,
})

// --- 개별 검증 함수들 ---

const validateTitle = () => {
  valids.title = projectTitle.value.trim().length >= 5
  errors.title = valids.title ? '' : '프로젝트 제목을 5자 이상 입력해주세요.'
}

// 주소 검증 (둘 중 하나라도 있으면 OK)
const validateAddressInfo = () => {
  valids.address = !!(form.address || form.subwayAddressName)
  errors.address = valids.address
    ? ''
    : '근무지 주소 또는 지하철역 중 하나는 필수입니다.'
}

const validateDevGrade = () => {
  valids.devGrade = !!selectedDevGrade.value
  errors.devGrade = valids.devGrade ? '' : '개발자 등급을 선택해주세요.'
}

const validateEducation = () => {
  valids.education = !!selectedEducation.value
  errors.education = valids.education ? '' : '학력을 선택해주세요.'
}

const validateProjectPeriod = () => {
  valids.projectPeriod = !!(projectStartDt.value && projectEndDt.value)
  errors.projectPeriod = valids.projectPeriod
    ? ''
    : '프로젝트 기간을 설정해주세요.'
}

const validateRecruitPeriod = () => {
  valids.recruitPeriod = !!(recruitStartDt.value && recruitEndDt.value)
  errors.recruitPeriod = valids.recruitPeriod ? '' : '모집 기간을 설정해주세요.'
}

const validateSalary = () => {
  // 숫자가 아닌 문자 제거 (입력 시 숫지만 남기기 위함)
  const salaryValue = projectSalary.value?.toString().replace(/,/g, '') || ''
  const salaryNum = Number(salaryValue)

  // 1. 비어있거나 0 이하인 경우
  if (!salaryValue || isNaN(salaryNum) || salaryNum <= 0) {
    valids.salary = false
    errors.salary = '올바른 단가(숫자)를 입력해주세요.'
  }
  // 2. 너무 큰 금액이 들어올 경우를 대비한 가이드 (선택 사항)
  else if (salaryNum > 100000000) {
    valids.salary = false
    errors.salary = '단가는 1억 원 이하로 입력해주세요.'
  } else {
    valids.salary = true
    errors.salary = ''
  }
}
const validateWorkType = () => {
  valids.workType = selectedWorkTypes.value.length > 0
  errors.workType = valids.workType ? '' : '근무 형태를 최소 하나 선택해주세요.'
}

const validateJob = () => {
  valids.job = selectedJobs.value.length > 0
  errors.job = valids.job ? '' : '모집 직군을 최소 하나 선택해주세요.'
}

const validateSkills = () => {
  valids.skills = selectedSkills.value.length > 0
  errors.skills = valids.skills ? '' : '사용 기술을 최소 하나 선택해주세요.'
}

const validatePreferSkills = () => {
  valids.preferSkills = selectedPreferSkills.value.length > 0
  errors.preferSkills = valids.preferSkills
    ? ''
    : '우대 기술을 최소 하나 선택해주세요.'
}

const validatePreference = () => {
  // 1. 모든 항목을 하나의 배열로 합치기
  const allItems = [...preferList.value]

  // 직접 입력한 내용이 있으면 추가
  const contentText = preferContent.value.trim()
  if (contentText) {
    allItems.push(contentText)
  }

  // 2. 콤마로 연결했을 때의 최종 문자열 생성 시뮬레이션
  const finalString = allItems.join(', ')
  const totalLength = finalString.length

  // 3. 검증 로직: 비어있어도 OK, 하지만 255자를 넘으면 안 됨
  if (totalLength > 255) {
    valids.preference = false
    errors.preference = `우대 사항이 너무 깁니다. (최대 255자 / 현재: ${totalLength}자)`
  } else {
    // 비어있거나(0자) 255자 이내면 모두 통과
    valids.preference = true
    errors.preference = ''
  }
}

const validateDescription = () => {
  valids.description = description.value.trim().length > 0
  errors.description = valids.description ? '' : '상세 내용을 작성해주세요.'
}

const validateInterview = () => {
  valids.interview = selectedInterviewTimes.value.length > 0
  errors.interview = valids.interview ? '' : '인터뷰 가능 시간을 설정해주세요.'
}

// --- 감시자(Watch) 설정 (실시간 유효성 체크) ---
watch(projectTitle, validateTitle)
watch([() => form.address, () => form.subwayAddressName], validateAddressInfo)
watch(selectedDevGrade, validateDevGrade)
watch(selectedEducation, validateEducation)
watch([projectStartDt, projectEndDt], validateProjectPeriod)
// 모집 기간이 변경될 때: 1) 유효성 검사 실행 + 2) 인터뷰 시간 자동 필터링
watch([recruitStartDt, recruitEndDt], ([newStart, newEnd]) => {
  // 1. 기존 유효성 검사 함수 호출
  validateRecruitPeriod()

  // 2. 인터뷰 시간 자동 필터링 로직 (데이터 정합성 유지)
  if (newStart && newEnd && selectedInterviewTimes.value.length > 0) {
    const filteredTimes = selectedInterviewTimes.value.filter((item) => {
      // 새로운 모집 기간(시작일~종료일) 사이에 있는 날짜만 남김
      return item.date >= newStart && item.date <= newEnd
    })

    // 범위를 벗어난 날짜가 있어 필터링된 경우
    if (filteredTimes.length !== selectedInterviewTimes.value.length) {
      selectedInterviewTimes.value = filteredTimes
      alertStore.show(
        '모집 기간 변경으로 인해 범위를 벗어난 인터뷰 시간이 제외되었습니다.',
        'warning',
      )
    }
  }
})
watch(selectedWorkTypes, validateWorkType, { deep: true })
watch(selectedJobs, validateJob, { deep: true })
watch(selectedSkills, validateSkills, { deep: true })
watch(selectedPreferSkills, validatePreferSkills, { deep: true })
watch([preferList, preferContent], validatePreference, { deep: true })
watch(description, validateDescription)
watch(selectedInterviewTimes, validateInterview, { deep: true })
watch(projectSalary, validateSalary)

// --- 최종 제출 시 전체 검증 ---
const fieldLabels = {
  title: '프로젝트 제목',
  address: '근무지 주소',
  devGrade: '개발자 등급',
  education: '학력',
  projectPeriod: '프로젝트 기간',
  recruitPeriod: '모집 기간',
  salary: '단가',
  workType: '근무 형태',
  job: '모집 직군',
  skills: '사용 기술',
  preferSkills: '우대 기술',
  preference: '우대 사항',
  description: '상세 내용',
  interview: '인터뷰 가능 시간',
}

const validateAll = () => {
  validateTitle()
  validateAddressInfo()
  validateDevGrade()
  validateEducation()
  validateProjectPeriod()
  validateRecruitPeriod()
  validateWorkType()
  validateJob()
  validateSkills()
  validatePreferSkills()
  validatePreference()
  validateDescription()
  validateInterview()
  validateSalary()

  return Object.values(valids).every((v) => v === true)
}
const submitProject = async () => {
  if (!validateAll()) {
    const failedFields = Object.entries(valids)
      .filter(([, v]) => v === false)
      .map(([key]) => fieldLabels[key] || key)
    alertStore.show(
      `다음 항목을 확인해주세요. \n${failedFields.join(', ')}`,
      'danger',
    )
    return
  }
  const requestBody = {
    projectId: projectSq ?? null,
    projectTitle: projectTitle.value,
    projectSalary: projectSalary.value,
    projectSalaryNegotiableYn: isSalaryNegotiable.value,
    projectImageUrl: '',

    // [고도화] 상세 주소 데이터
    detailedAddressName: form.address,
    detailedAddressDetail: form.detailAddress,
    detailedZonecode: form.postcode,
    detailedLat: form.latitude,
    detailedLon: form.longitude,
    detailedSigunguCode: form.sigunguCode,

    // [고도화] 지하철 주소 데이터
    subwayAddressName: form.subwayAddressName,
    subwayLat: form.subwayLat,
    subwayLon: form.subwayLon,
    subwaySigunguCode: form.subwaySigunguCode,

    devGrade: selectedDevGrade.value,
    educationLvl: selectedEducation.value,

    projectStartDt: projectStartDt.value,
    projectEndDt: projectEndDt.value,
    recruitStartDt: recruitStartDt.value,
    recruitEndDt: recruitEndDt.value,

    workType: [...selectedWorkTypes.value],

    recruitJob: [...selectedJobs.value],

    preferSkills: selectedPreferSkills.value
      .map((s) => (typeof s === 'string' ? s : s?.name))
      .filter((name) => !!name),
    usingSkills: selectedSkills.value
      .map((s) => (typeof s === 'string' ? s : s?.name))
      .filter((name) => !!name),

    preference: [...preferList.value, ...preferContent.value.split(',')]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(','),

    description: description.value,

    interviewTime: selectedInterviewTimes.value.flatMap((item) =>
      item.times.map((time) => `${item.date}T${time}`),
    ),

    isNotification: notifyEnabled.value ? 'Y' : 'N',
  }
  // console.log(requestBody)
  try {
    const token = getAccessTokenFromCookie()

    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
    if (projectSq) {
      await api.$patch('/projects', requestBody, config)
      alertStore.show('프로젝트 수정에 성공하였습니다.')
    } else {
      await api.$post('/projects', requestBody, config)
      alertStore.show('프로젝트 등록에 성공하였습니다.')
    }
    router.push({ name: 'ProjectListPage' })
  } catch (error) {
    alertStore.show('프로젝트 등록에 실패하였습니다.', 'danger')
    console.error('프로젝트 등록 실패: ', error)
  }
}

function getAccessTokenFromCookie() {
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

watch(preferContent, (newVal) => {
  if (newVal.endsWith(',')) {
    const tags = newVal
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && !preferList.value.includes(tag))

    preferList.value.push(...tags)
    preferContent.value = ''
  }
})

watch(isOpen, (newVal) => {
  if (newVal) {
    prevScrollY = window.scrollY
    document.body.style.setProperty('overflow', 'hidden', 'important')
    document.documentElement.style.setProperty(
      'overflow',
      'hidden',
      'important',
    )
  } else {
    document.body.style.removeProperty('overflow')
    document.documentElement.style.removeProperty('overflow')
    window.scrollTo(0, prevScrollY)
  }
})

const openSkillModal = () => {
  modalStore.openModal(SkillSelectModal, {
    onConfirm: onSkillsConfirmed,
    skills: skills.value,
    selectedSkills: selectedSkills.value,
  })
}
const openPreferSkillModal = () => {
  modalStore.openModal(SkillSelectModal, {
    onConfirm: onPreferSkillsConfirmed,
    skills: skills.value,
    selectedSkills: selectedPreferSkills.value,
  })
}

const openProjectCalenderModal = () => {
  modalStore.openModal(CalendarModal, {
    onConfirm: onProjectTimeConfirmed,
  })
}

const openRecruitCalenderModal = () => {
  modalStore.openModal(CalendarModal, {
    onConfirm: onRecruitTimeConfirmed,
  })
}

const openWorkTypeModal = () => {
  modalStore.openModal(WorkTypeModal, {
    onConfirm: onWorkTypeConfirmed,
    works: workTypes.value,
  })
}

const openJobModal = () => {
  // console.log(selectedJobs.value)
  modalStore.openModal(JobModal, {
    onConfirm: onJobConfirmed,
    jobs: recruitJobs.value,
  })
}

const openInterviewTimeModal = () => {
  // 1. 모집 기간 설정 여부 체크
  if (!recruitStartDt.value || !recruitEndDt.value) {
    alertStore.show('모집 기간을 먼저 설정해주세요.', 'danger')
    return
  }

  modalStore.openModal(InterviewTimeModal, {
    onConfirm: onInterviewTimeConfirmed,
    interviewTimes: selectedInterviewTimes.value,
    // 2. 모집 기간을 제한 조건으로 전달
    minDate: recruitStartDt.value,
    maxDate: recruitEndDt.value,
  })
}

const onSkillsConfirmed = (skills) => {
  selectedSkills.value = skills
  // console.log(selectedSkills.value)
}

const onPreferSkillsConfirmed = (skills) => {
  selectedPreferSkills.value = skills
}

const onProjectTimeConfirmed = ({ start, end }) => {
  projectStartDt.value = start
  projectEndDt.value = end
}

const onRecruitTimeConfirmed = ({ start, end }) => {
  recruitStartDt.value = start
  recruitEndDt.value = end
}

const onInterviewTimeConfirmed = (times) => {
  selectedInterviewTimes.value = times
  // console.log(selectedInterviewTimes.value)
}

const onWorkTypeConfirmed = (workTypes) => {
  // console.log(workTypes)
  selectedWorkTypes.value = workTypes
}

const onJobConfirmed = (jobs) => {
  // console.log(jobs)
  selectedJobs.value = jobs
}

const removeWorkType = (name) => {
  // console.log('삭제 대상:', name)

  selectedWorkTypes.value = selectedWorkTypes.value.filter(
    (work) => work !== name,
  )

  // console.log('삭제 후:', selectedWorkTypes.value)
}

const removeJob = (name) => {
  // console.log('삭제 대상:', name)

  selectedJobs.value = selectedJobs.value.filter((job) => job !== name)

  // console.log('삭제 후:', selectedJobs.value)
}

const removeSkill = (name) => {
  selectedSkills.value = selectedSkills.value.filter((skill) => {
    const skillName = typeof skill === 'string' ? skill : skill.name
    return skillName !== name
  })
}

const removePreferSkill = (name) => {
  selectedPreferSkills.value = selectedPreferSkills.value.filter(
    (preferSkill) => {
      const skillName =
        typeof preferSkill === 'string' ? preferSkill : preferSkill.name
      return skillName !== name
    },
  )
}

const removeInterviewTime = (date) => {
  selectedInterviewTimes.value = selectedInterviewTimes.value.filter(
    (interviewTimes) => interviewTimes.date !== date,
  )
}

const projectPeriodDisplay = computed({
  get: () =>
    projectStartDt.value && projectEndDt.value
      ? `${projectStartDt.value} ~ ${projectEndDt.value}`
      : '',
  set: (val) => {
    const parts = val.split('~').map((v) => v.trim())
    if (parts.length === 2) {
      projectStartDt.value = parts[0]
      projectEndDt.value = parts[1]
    }
  },
})

const recruitPeriodDisplay = computed({
  get: () =>
    recruitStartDt.value && recruitEndDt.value
      ? `${recruitStartDt.value} ~ ${recruitEndDt.value}`
      : '',
  set: (val) => {
    const parts = val.split('~').map((v) => v.trim())
    if (parts.length === 2) {
      recruitStartDt.value = parts[0]
      recruitEndDt.value = parts[1]
    }
  },
})

// 1. 근무지 주소 전체 초기화
const clearDetailedAddress = () => {
  form.address = ''
  form.detailAddress = ''
  form.postcode = ''
  form.latitude = null
  form.longitude = null
  form.sigunguCode = ''

  // 만약 시/구 셀렉트 박스도 초기화하고 싶다면 아래 주석 해제
  // selectedCity.value = '';
  // selectedDistrict.value = '';
}

// 2. 지하철 주소 전체 초기화
const clearSubwayAddress = () => {
  form.subwayAddressName = ''
  form.subwayLat = null
  form.subwayLon = null
  form.subwaySigunguCode = ''
}
</script>
<style scoped>
.layout-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
}

.content {
  flex-grow: 1;
  max-width: calc(100% - 220px);
}

.readonly:hover {
  cursor: default;
}

/* PC에서는 가로 배치, 모바일에서는 세로 배치 */
@media (min-width: 992px) {
  .layout-wrapper {
    display: flex;
  }
  .sidebar {
    width: 220px;
    flex-shrink: 0;
  }
  .content {
    flex-grow: 1;
    /* 사이드바 너비를 뺀 나머지 공간 확보 */
    max-width: calc(100% - 220px);
  }
}

/* 모바일 전용 대응 */
@media (max-width: 991px) {
  .content {
    width: 100%;
    max-width: 100%;
    padding-left: 15px !important;
    padding-right: 15px !important;
  }

  /* 단가 입력 부분 모바일에서 세로 정렬 */
  .d-flex.align-items-center.gap-2 {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .d-flex.align-items-center.gap-2 > input {
    width: 100%;
  }
}
</style>
