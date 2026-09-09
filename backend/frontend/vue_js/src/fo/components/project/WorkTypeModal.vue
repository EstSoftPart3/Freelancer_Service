<template>
  <div class="modal-backdrop">
    <div class="modal-wrapper">
      <div class="modal-title">근무 형태 선택</div>

      <div class="option-group">
        <button
          v-for="type in props.works"
          :key="type"
          type="button"
          class="option-button"
          :class="{ selected: isSelected(type) }"
          @click="toggleType(type)"
        >
          {{ type }}
        </button>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-cancel" @click="closeModal">
          닫기
        </button>
        <button type="button" class="btn btn-confirm" @click="confirmSelection">
          선택 완료
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'
import { useModalStore } from '../../stores/modalStore.js'

const emit = defineEmits(['confirm'])

const modalStore = useModalStore()
const selectedTypes = ref([])

const props = defineProps({
  onConfirm: Function,
  works: {
    type: Array,
    default: () => [],
  },
})

const toggleType = (type) => {
  const index = selectedTypes.value.indexOf(type)
  if (index === -1) {
    selectedTypes.value.push(type)
  } else {
    selectedTypes.value.splice(index, 1)
  }
}

const isSelected = (type) => selectedTypes.value.includes(type)

const confirmSelection = () => {
  // console.log(selectedTypes.value)
  emit('confirm', selectedTypes.value)
  modalStore.closeModal()
}

const closeModal = () => {
  modalStore.closeModal()
}
</script>

<style scoped>
.modal-backdrop {
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

.modal-wrapper {
  background: white;
  border-radius: 12px;
  padding: 32px;
  width: 480px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.option-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.option-button {
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.option-button:hover {
  background: #f1f3f5;
}

.option-button.selected {
  background: #0088cc;
  color: white;
  border-color: #0088cc;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel {
  background: #f1f3f5;
  color: #333;
  border: none;
}

.btn-confirm {
  background: #0088cc;
  color: white;
  border: none;
}
</style>
