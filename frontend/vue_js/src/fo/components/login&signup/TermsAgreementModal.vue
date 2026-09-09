<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button
        type="button"
        class="btn-close"
        @click="modalStore.closeModal()"
        aria-hidden="true"
      ></button>
    </div>
    <div class="modal-body" style="max-height: 500px; overflow-y: auto">
      <!-- 동적 바인딩을 위한 body -->
      <div v-html="body"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" @click="onAgree">동의</button>
      <button class="btn btn-light" @click="modalStore.closeModal()">
        닫기
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'

const modalStore = useModalStore()

const props = defineProps({
  title: String,
  body: String,
  onConfirm: Function,
})

function onAgree() {
  props.onConfirm()
}
</script>
