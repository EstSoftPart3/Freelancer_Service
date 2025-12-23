<template>
  <div class="modal-layer">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">프로젝트 이력 추가하기</h4>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <!-- 프로젝트 내용 -->
        <div class="section-block">
          <div class="section-title">프로젝트 내용</div>
          <div class="form-row">
            <div class="form-group">
              <label class="modal-label">프로젝트명</label>
              <input
                v-model="form.name"
                type="text"
                class="form-control"
                placeholder="프로젝트명 (예: 금융 시스템 구축)"
              />
            </div>
            <div class="form-group">
              <label class="modal-label">참여기간</label>
              <div class="d-flex gap-2">
                <div class="datepicker-wrapper flex-grow-1">
                  <Datepicker
                    :key="datepickerKey1"
                    v-model="form.startDate"
                    :locale="ko"
                    :format="inputFormat"
                    placeholder="시작일"
                    class="form-control"
                    teleport="body"
                    @update:modelValue="datepickerKey1++"
                  />
                  <i class="fas fa-calendar datepicker-icon"></i>
                </div>
                <span class="align-self-center">~</span>
                <div class="datepicker-wrapper flex-grow-1">
                  <Datepicker
                    :key="datepickerKey2"
                    v-model="form.endDate"
                    :locale="ko"
                    :format="inputFormat"
                    placeholder="종료일"
                    class="form-control"
                    teleport="body"
                    @update:modelValue="datepickerKey2++"
                  />
                  <i class="fas fa-calendar datepicker-icon"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="modal-label">고객사</label>
              <input
                v-model="form.client"
                type="text"
                class="form-control"
                placeholder="고객사 (예: OO은행)"
              />
            </div>
            <div class="form-group">
              <label class="modal-label">업무단</label>
              <select v-model="form.workUnit" class="form-control">
                <option disabled value="">업무단 선택</option>
                <option
                  v-for="item in projectTaskTypeList"
                  :key="item.commonCodeSq"
                  :value="item.commonCodeSq"
                >
                  {{ item.commonCodeNm }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="modal-label">역할</label>
              <select v-model="form.role" class="form-control">
                <option disabled value="">역할 선택</option>
                <option
                  v-for="item in projectRoleTypeList"
                  :key="item.commonCodeSq"
                  :value="item.commonCodeSq"
                >
                  {{ item.commonCodeNm }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 개발환경 -->
        <div class="section-block">
          <div class="section-title">개발환경</div>
          <div class="form-row">
            <div class="form-group">
              <label class="modal-label">기종</label>
              <input
                :value="deviceText"
                type="text"
                class="form-control"
                placeholder="기종 (예: PC)"
                readonly
                @click="openSkillModal"
              />
            </div>
            <div class="form-group">
              <label class="modal-label">OS</label>
              <input
                :value="osText"
                type="text"
                class="form-control"
                placeholder="OS (예: Linux)"
                readonly
                @click="openSkillModal"
              />
            </div>
            <div class="form-group">
              <label class="modal-label">DBMS</label>
              <input
                :value="dbmsText"
                type="text"
                class="form-control"
                placeholder="DBMS (예: MySQL)"
                readonly
                @click="openSkillModal"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="modal-label">언어</label>
              <input
                :value="languageText"
                type="text"
                class="form-control"
                placeholder="언어 (쉼표로 구분, 예: Java, Python)"
                readonly
                @click="openSkillModal"
              />
            </div>
            <div class="form-group">
              <label class="modal-label">TOOL</label>
              <input
                :value="toolText"
                type="text"
                class="form-control"
                placeholder="TOOL (쉼표로 구분, 예: Eclipse, VSCode)"
                readonly
                @click="openSkillModal"
              />
            </div>
            <div class="form-group">
              <label class="modal-label">FW</label>
              <input
                :value="frameworkText"
                type="text"
                class="form-control"
                placeholder="FW (쉼표로 구분, 예: Spring Boot, Vue.js)"
                readonly
                @click="openSkillModal"
              />
            </div>
          </div>
          <!-- <div class="form-row">
            <div class="form-group">
              <label class="modal-label">기타</label>
              <input
                v-model="form.etc"
                type="text"
                class="form-control"
                placeholder="기타 (쉼표로 구분, 예: git, Docker)"
              />
            </div>
          </div> -->
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="submit">저장하기</button>
        <button class="btn btn-light" @click="closeModal">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, onMounted, ref } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import { useProjectStore } from '@/fo/stores/ProjectHistoryStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import ProjectHistorySkillTagModal from './ProjectHistorySkillTagModal.vue'
import { api } from '@/axios'
import Datepicker from 'vue3-datepicker'
import { ko } from 'date-fns/locale'

const props = defineProps({
  onComplete: Function,
  projectId: Number,
})

const modalStore = useModalStore()
const projectStore = useProjectStore()
const alertStore = useAlertStore()

const inputFormat = ref('yyyy-MM-dd')
const datepickerKey1 = ref(0)
const datepickerKey2 = ref(0)

// form과 skills를 store에서 가져옴 (양방향 바인딩용 computed)
const form = computed({
  get: () => projectStore.getForm(props.projectId),
  set: (val) => projectStore.setForm(props.projectId, val),
})

const selectedSkills = computed(() => projectStore.getSkills(props.projectId))

const deviceText = computed(
  () =>
    (selectedSkills.value.device &&
      selectedSkills.value.device
        .map((skill) => skill.skillTagNm)
        .join(', ')) ||
    '',
)
const osText = computed(
  () =>
    (selectedSkills.value.os &&
      selectedSkills.value.os.map((skill) => skill.skillTagNm).join(', ')) ||
    '',
)
const dbmsText = computed(
  () =>
    (selectedSkills.value.dbms &&
      selectedSkills.value.dbms.map((skill) => skill.skillTagNm).join(', ')) ||
    '',
)
const languageText = computed(
  () =>
    (selectedSkills.value.language &&
      selectedSkills.value.language
        .map((skill) => skill.skillTagNm)
        .join(', ')) ||
    '',
)
const toolText = computed(
  () =>
    (selectedSkills.value.tool &&
      selectedSkills.value.tool.map((skill) => skill.skillTagNm).join(', ')) ||
    '',
)
const frameworkText = computed(
  () =>
    (selectedSkills.value.framework &&
      selectedSkills.value.framework
        .map((skill) => skill.skillTagNm)
        .join(', ')) ||
    '',
)

const projectRoleTypeList = ref([])
const projectTaskTypeList = ref([])

const fetchTypeCodes = async () => {
  const response = await api.$get('/mypage/resume/project-history/type-codes')
  projectRoleTypeList.value = response.output.projectRoleTypeList
  projectTaskTypeList.value = response.output.projectTaskTypeList
  // console.log('projectRoleTypeList', projectRoleTypeList)
  // console.log('projectTaskTypeList', projectTaskTypeList)
}

const openSkillModal = () => {
  modalStore.openModal(ProjectHistorySkillTagModal, {
    projectId: props.projectId,
  })
}

function formatDate(date) {
  if (!date) return ''

  // date가 문자열로 들어오든 객체로 들어오든 Date 객체로 생성
  const d = new Date(date)

  // 유효하지 않은 날짜인 경우 빈 값 반환
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  // 월은 0부터 시작하므로 +1, 두 자리 유지를 위해 padStart 사용
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

const submit = () => {
  if (!form.value.name) {
    alertStore.show('프로젝트명을 입력해주세요.', 'danger')
    return
  }
  if (!form.value.startDate) {
    alertStore.show('프로젝트 근무 기간을 선택하세요.', 'danger')
    return
  }
  if (!form.value.client) {
    alertStore.show('고객사를 입력하세요.', 'danger')
    return
  }
  if (!form.value.workUnit) {
    alertStore.show('업무단을 선택하세요.', 'danger')
    return
  }
  if (!form.value.role) {
    alertStore.show('프로젝트 담당 역할을 선택하세요.', 'danger')
    return
  }
  const totalSkillCount = Object.values(selectedSkills.value || {}).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0,
  )

  if (totalSkillCount === 0) {
    alertStore.show('개발환경을 선택하세요.', 'danger')
    return
  }

  const selectedWorkUnit = projectTaskTypeList.value.find(
    (item) => item.commonCodeSq === form.value.workUnit,
  )

  const selectedRole = projectRoleTypeList.value.find(
    (item) => item.commonCodeSq === form.value.role,
  )

  const project = {
    projectHistoryTask: form.value.name,
    projectHistoryStartDt: formatDate(form.value.startDate) || null,
    projectHistoryEndDt: formatDate(form.value.endDate) || null,
    projectHistoryClient: form.value.client,
    projectHistoryTypeCd: form.value.workUnit,
    projectHistoryTypeCdNm: selectedWorkUnit?.commonCodeNm || null, // 업무단 이름
    projectHistoryJobPositionTypeCd: form.value.role,
    projectHistoryJobPositionTypeCdNm: selectedRole?.commonCodeNm || null, // 역할 이름
    skillTags: selectedSkills.value,
  }

  props.onComplete(project)
  closeModal()
}

const closeModal = () => {
  modalStore.closeModal()
}
onMounted(() => {
  if (!projectStore.hasForm(props.projectId)) {
    projectStore.initForm(props.projectId)
  }
  fetchTypeCodes()
})
</script>

<style scoped>
.modal-layer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  position: relative;
  width: 750px;
  max-width: 95vw;
  background: #fff;
  padding: 28px 20px 16px 20px;
  overflow-x: visible;
  overflow-y: visible;
  box-sizing: border-box;
  border-radius: 8px;
}
.section-block {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 18px 16px 10px 16px;
  margin-bottom: 20px;
  background: #fafbfc;
}
.modal-header {
  height: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 4px;
  padding-top: 0;
}
.modal-title {
  color: #222;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 0;
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  display: block;
  line-height: 1;
  padding: 0 8px;
  color: #888;
  position: relative;
  top: -6px;
}
.modal-label {
  display: none;
}
.section-title {
  font-weight: bold;
  font-size: 1.05rem;
  margin-bottom: 8px;
  color: #333;
}
.modal-body .form-group {
  margin-bottom: 0;
}
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.form-row .form-group {
  flex: 1 1 0;
}
.form-control {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.datepicker-wrapper {
  position: relative;
  --vdp-hover-bg-color: #007bff;
  --vdp-selected-bg-color: #007bff;
  --vdp-hover-color: #ffffff;
  --vdp-selected-color: #ffffff;
}

.datepicker-wrapper :deep(.form-control) {
  padding-right: 3rem; /* 아이콘 공간 확보 */
  height: auto;
  padding-top: 8px;
  padding-bottom: 8px;
}

.datepicker-icon {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: #adb5bd;
  pointer-events: none;
}
</style>
