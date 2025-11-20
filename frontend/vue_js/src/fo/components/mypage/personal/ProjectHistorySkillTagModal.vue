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
import { useProjectStore } from '@/fo/stores/ProjectHistoryStore'
import { ref, onMounted, watch, defineProps } from 'vue'
import skillIconMap from '@/assets/skillIconMap.js'

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true,
  },
})

const projectStore = useProjectStore()
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
        .map((parent) => ({
          ...parent,
          children: skillList.value.filter(
            (tag) => tag.parentSkillTagSq === parent.skillTagSq,
          ),
        }))
    }
  } catch {
    alertStore.show('기술 태그 리스트를 불러올 수 없습니다.', 'danger')
  }
}

const toggleSkill = (skill) => {
  const idx = selectedSkills.value.findIndex(
    (s) => s.skillTagSq === skill.skillTagSq,
  )
  if (idx === -1) {
    selectedSkills.value.push(skill)
  } else {
    selectedSkills.value.splice(idx, 1)
  }
}

const isSelected = (skill) =>
  selectedSkills.value.some((s) => s.skillTagSq === skill.skillTagSq)

const getSkillIcon = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

const syncSelectedSkillsWithStore = () => {
  const projectSkills = projectStore.getSkills(props.projectId)
  const allSkills = []
  for (const category in projectSkills) {
    if (Array.isArray(projectSkills[category])) {
      allSkills.push(...projectSkills[category])
    }
  }
  selectedSkills.value = allSkills.map((s) => ({ ...s }))
}

const handleConfirm = () => {
  const categoryMap = {
    기종: 'device',
    Os: 'os',
    운영체제: 'os',
    dbms: 'dbms',
    DB: 'dbms',
    언어: 'language',
    툴: 'tool',
    TOOL: 'tool',
    프레임워크: 'framework',
    FW: 'framework',
  }

  const grouped = {
    device: [],
    os: [],
    dbms: [],
    language: [],
    tool: [],
    framework: [],
  }

  selectedSkills.value.forEach((skill) => {
    const parent = groupedSkillTags.value.find(
      (g) => g.skillTagSq === skill.parentSkillTagSq,
    )
    if (!parent) return
    const parentNameKey = parent.skillTagNm.toLowerCase().replace(/[\s.]+/g, '')

    const category =
      categoryMap[parentNameKey] || categoryMap[parent.skillTagNm.toLowerCase()]

    if (category && category in grouped) {
      grouped[category].push(skill)
    }
  })

  projectStore.setSkills(props.projectId, grouped)
  closeModal()
}

const closeModal = () => modalStore.closeModal()

onMounted(async () => {
  await getSkills()
  syncSelectedSkillsWithStore()
})

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
