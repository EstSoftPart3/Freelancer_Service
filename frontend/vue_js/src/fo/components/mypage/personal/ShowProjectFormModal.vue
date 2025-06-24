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
                <input
                  v-model="form.startDate"
                  type="date"
                  class="form-control"
                  placeholder="시작일"
                />
                <span class="align-self-center">~</span>
                <input
                  v-model="form.endDate"
                  type="date"
                  class="form-control"
                  placeholder="종료일 (선택 안 해도 됨)"
                />
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
                :value="
                  selectedSkills.device
                    ?.map((skill) => skill.skillTagNm)
                    .join(', ') || ''
                "
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
                :value="
                  selectedSkills.os
                    ?.map((skill) => skill.skillTagNm)
                    .join(', ') || ''
                "
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
                :value="
                  selectedSkills.dbms
                    ?.map((skill) => skill.skillTagNm)
                    .join(', ') || ''
                "
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
                :value="
                  selectedSkills.language
                    ?.map((skill) => skill.skillTagNm)
                    .join(', ') || ''
                "
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
                :value="
                  selectedSkills.tool
                    ?.map((skill) => skill.skillTagNm)
                    .join(', ') || ''
                "
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
                :value="
                  selectedSkills.framework
                    ?.map((skill) => skill.skillTagNm)
                    .join(', ') || ''
                "
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
import ProjectHistorySkillTagModal from './ProjectHistorySkillTagModal.vue'
import { api } from '@/axios'

const props = defineProps({
  onComplete: Function,
  projectId: Number,
})

const modalStore = useModalStore()
const projectStore = useProjectStore()

// form과 skills를 store에서 가져옴 (양방향 바인딩용 computed)
const form = computed({
  get: () => projectStore.getForm(props.projectId),
  set: (val) => projectStore.setForm(props.projectId, val),
})

const selectedSkills = computed(() => projectStore.getSkills(props.projectId))

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

const submit = () => {
  const selectedWorkUnit = projectTaskTypeList.value.find(
    (item) => item.commonCodeSq === form.value.workUnit,
  )

  const selectedRole = projectRoleTypeList.value.find(
    (item) => item.commonCodeSq === form.value.role,
  )

  const project = {
    projectHistoryTask: form.value.name,
    projectHistoryStartDt: form.value.startDate || null,
    projectHistoryEndDt: form.value.endDate || null,
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
  overflow-x: hidden;
  overflow-y: auto;
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
</style>
