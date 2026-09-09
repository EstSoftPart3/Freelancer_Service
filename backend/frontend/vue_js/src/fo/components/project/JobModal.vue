<template>
  <Teleport to="body">
    <div class="modal-backdrop">
      <div class="modal-wrapper">
        <h5 class="modal-title">모집 직군 선택</h5>

        <div class="grid-button-group">
          <button
            v-for="job in props.jobs"
            :key="job"
            :class="['job-button', { selected: isSelected(job) }]"
            @click="toggleJob(job)"
          >
            {{ job }}
          </button>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeModal">닫기</button>
          <button class="btn btn-confirm" @click="confirmSelection">
            선택 완료
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'
import { useModalStore } from '../../stores/modalStore.js'

const emit = defineEmits(['confirm'])
const props = defineProps({
  onConfirm: Function,
  jobs: {
    type: Array,
    default: () => [],
  },
})

const modalStore = useModalStore()

const selectedJobs = ref([])

const toggleJob = (job) => {
  const i = selectedJobs.value.indexOf(job)
  i === -1 ? selectedJobs.value.push(job) : selectedJobs.value.splice(i, 1)
}

const isSelected = (job) => selectedJobs.value.includes(job)

const confirmSelection = () => {
  emit('confirm', selectedJobs.value)
  modalStore.closeModal()
}

const closeModal = () => {
  modalStore.closeModal()
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-wrapper {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  width: 600px;
  max-height: 60vh; /* 최대 높이 설정 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
}

.grid-button-group {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  overflow-y: auto;
  max-height: 300px; /* 스크롤이 생길 수 있도록 높이 제한 */
  padding-right: 4px; /* 스크롤바 공간 확보 */
}

.grid-button-group::-webkit-scrollbar {
  width: 6px;
}
.grid-button-group::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
.grid-button-group::-webkit-scrollbar-track {
  background: transparent;
}
.job-button {
  padding: 12px 10px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  background: white;
  font-weight: 500;
  transition: 0.2s;
  cursor: pointer;
}

.job-button.selected {
  background-color: #0088cc;
  color: white;
  border-color: #0088cc;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: #f1f3f5;
  color: #333;
}

.btn-confirm {
  background: #0088cc;
  color: white;
}
</style>
