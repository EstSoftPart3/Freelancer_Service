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
              v-for="(skills, category) in groupedSkills"
              :key="category"
              class="mb-3"
            >
              <h6 class="section-title">{{ category }}</h6>
              <div class="row row-cols-3 card-grid">
                <div class="col" v-for="skill in skills" :key="skill">
                  <button
                    type="button"
                    class="tech-card"
                    :class="{ selected: isSelected(skill) }"
                    @click="toggleSkill(skill)"
                  >
                    <img :src="generateIconUrl(skill)" :alt="skill" />
                    <span>{{ skill }}</span>
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
                @click="useModalStore().closeModal()"
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
import { ref, defineEmits, defineProps, computed, onMounted } from 'vue'
import { useModalStore } from '../../stores/modalStore.js'
import skillIconMap from '@/assets/skillIconMap.js'

const emit = defineEmits(['confirm', 'remove'])
const props = defineProps({
  onConfirm: Function,
  skills: {
    type: Array,
    default: () => [],
  },
  selectedSkills: {
    type: Array,
    default: () => [],
  },
})

const selected = ref([])
onMounted(() => {
  selected.value = [...props.selectedSkills]
})

const groupedSkills = computed(() => {
  const map = {}
  props.skills.forEach((group) => {
    map[group.parentSkillTagNm] = group.childSkillTagNms
  })
  return map
})

const toggleSkill = (skillName) => {
  const index = selected.value.findIndex((s) => s.name === skillName)
  if (index === -1) {
    selected.value.push({
      name: skillName,
      imageUrl: generateIconUrl(skillName),
    })
  } else {
    selected.value.splice(index, 1)
  }
}

const generateIconUrl = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

const isSelected = (skillName) =>
  selected.value.some((s) => s.name === skillName || s === skillName)

const confirmSelection = () => {
  emit('confirm', selected.value)
  const modalStore = useModalStore()
  modalStore.closeModal()
}
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
  max-height: 80vh;
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
  background-color: #0088cc !important;
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px #0d6efd33;
}
</style>
