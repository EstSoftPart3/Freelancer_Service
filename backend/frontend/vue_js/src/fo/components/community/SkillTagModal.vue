<template lang="">
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
                @click="confirmSelection"
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
import { ref, defineProps, onMounted } from 'vue'
import skillIconMap from '@/assets/skillIconMap.js'

const alertStore = useAlertStore()
const modalStore = useModalStore()

const props = defineProps({
  onConfirm: Function,
  skillTags: {
    type: Array,
    default: () => [],
  },
})

const selectedSkills = ref([])
const skillList = ref([])
const groupedSkillTags = ref([])

const syncSelectedSkills = () => {
  if (!skillList.value.length || !props.skillTags.length) return

  const selectedSqSet = new Set(props.skillTags.map((tag) => tag.skillTagSq))
  selectedSkills.value = skillList.value.filter((tag) =>
    selectedSqSet.has(tag.skillTagSq),
  )
}

const getSkills = async () => {
  try {
    const res = await api.$get(`/board/skill-tags`)
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

      syncSelectedSkills()
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
    selectedSkills.value.push(skill) // 선택되지 않았으면 추가
  } else {
    selectedSkills.value.splice(index, 1) // 이미 선택되어 있으면 제거
  }
}

const getSkillIcon = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

const isSelected = (skill) =>
  selectedSkills.value.some((s) => s.skillTagSq === skill.skillTagSq)

const confirmSelection = () => {
  const returnSkill = selectedSkills.value.map((skill) => ({
    skillTagSq: skill.skillTagSq,
    skillTagNm: skill.skillTagNm,
  }))
  props.onConfirm(returnSkill)
  modalStore.closeModal()
}

const closeModal = () => {
  modalStore.closeModal()
}

onMounted(() => {
  getSkills()
})
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
