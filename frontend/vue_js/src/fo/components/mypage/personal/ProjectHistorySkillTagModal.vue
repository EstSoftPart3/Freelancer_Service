<template>
  <Teleport to="body">
    <div class="modal-backdrop">
      <div class="modal-content-wrapper">
        <div class="modal-header">
          <h5 class="modal-title" id="customModalLabel">기술 선택</h5>
        </div>
        <div class="modal-body">
          <form id="techForm">
            <div
              v-for="group in groupedSkillTags"
              :key="group.skillTagSq"
              class="mb-3"
            >
              <h6 class="section-title">{{ group.skillTagNm }}</h6>
              <div class="row row-cols-3 card-grid">
                <div
                  class="col"
                  v-for="skill in group.children"
                  :key="skill.skillTagNm"
                >
                  <button
                    type="button"
                    class="tech-card"
                    :class="{ selected: isSelected(skill) }"
                    @click="toggleSkill(skill)"
                  >
                    <img
                      :src="getSkillIcon(skill.skillTagNm)"
                      :alt="skill.skillTagNm"
                    />
                    <span>{{ skill.skillTagNm }}</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="mt-4 d-flex justify-content-end">
              <button
                @click="handleConfirm"
                type="button"
                class="btn btn-primary"
              >
                선택 완료
              </button>
              <button
                @click="closeModal"
                type="button"
                class="btn btn-secondary ms-2"
              >
                닫기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useModalStore } from '@/fo/stores/modalStore'
import { useSkillStore } from '@/fo/stores/ProjectHistorySkillStore'
import { ref, onMounted, watch } from 'vue'
import skillIconMap from '@/assets/skillIconMap.js'

const skillStore = useSkillStore()
const alertStore = useAlertStore()
const modalStore = useModalStore()

const selectedSkills = ref([])
const skillList = ref([])
const groupedSkillTags = ref([])

const getSkills = async () => {
  try {
    const res = await api.$get(`/mypage/resume/project-history/skill-tags`)
    if (res.status == 'OK') {
      skillList.value = [...res.output]

      groupedSkillTags.value = skillList.value
        .filter((tag) => tag.skillTagLvl === 1)
        .map((parent) => {
          const children = skillList.value.filter(
            (tag) => tag.parentSkillTagSq === parent.skillTagSq,
          )
          return {
            ...parent,
            children,
          }
        })
    }
  } catch (error) {
    alertStore.show('기술 태그 리스트를 불러올 수 없습니다.', 'danger')
  }
}

const toggleSkill = (skill) => {
  const index = selectedSkills.value.findIndex(
    (s) => s.skillTagSq === skill.skillTagSq,
  )

  if (index === -1) {
    selectedSkills.value.push(skill)
  } else {
    selectedSkills.value.splice(index, 1)
  }
}

const getSkillIcon = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

const isSelected = (skill) =>
  selectedSkills.value.some((s) => s.skillTagSq === skill.skillTagSq)

const syncSelectedSkillsWithStore = () => {
  const allSkills = []
  for (const category in skillStore.skills) {
    if (Array.isArray(skillStore.skills[category])) {
      allSkills.push(...skillStore.skills[category])
    }
  }

  // 깊은 복사하여 selectedSkills 초기화
  selectedSkills.value = allSkills.map((skill) => ({ ...skill }))
}

const handleConfirm = () => {
  const grouped = {
    device: [],
    os: [],
    dbms: [],
    language: [],
    tool: [],
    framework: [],
  }

  selectedSkills.value.forEach((skill) => {
    const parentGroup = groupedSkillTags.value.find(
      (group) => group.skillTagSq === skill.parentSkillTagSq,
    )
    if (!parentGroup) return

    const category = parentGroup.skillTagNm.toLowerCase()
    if (category in grouped) {
      grouped[category].push(skill)
    }
  })

  skillStore.setSkills(grouped)
  closeModal()
}

const closeModal = () => {
  modalStore.closeModal()
}

onMounted(async () => {
  await getSkills()
  if (modalStore.isOpen) {
    syncSelectedSkillsWithStore()
  }
})

// 모달이 열릴 때 skillStore -> selectedSkills 동기화
watch(
  () => modalStore.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await getSkills()
      syncSelectedSkillsWithStore()
    }
  },
)
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-content-wrapper {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.tech-card {
  width: 100%;
  height: 60px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  padding: 0.5rem;
}
.tech-card img {
  width: 20px;
  height: 20px;
}
.tech-card:hover {
  background-color: #d9d9d9;
  border-color: #0d6efd;
}
.tech-card.selected {
  background-color: #d9d9d9 !important;
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px #0d6efd33;
}
</style>
