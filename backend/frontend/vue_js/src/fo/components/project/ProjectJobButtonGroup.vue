<template>
  <div class="d-flex gap-2 flex-wrap">
    <div
      v-for="job in selectedJobs"
      :key="job"
      class="btn btn-rounded btn-light d-flex align-items-center gap-2 mb-2 btn-3d position-relative"
      style="padding-right: 24px"
    >
      <span>{{ job }}</span>
      <a
        href="#"
        @click.prevent="deleteJob(job)"
        class="position-absolute end-0 me-2 text-grey text-decoration-none"
        style="top: 50%; transform: translateY(-50%)"
        title="삭제"
      >
        ×
      </a>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  selectedJobs: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['remove'])

const deleteJob = (job) => {
  emit('remove', job)
}
</script>
