<template>
  <div class="d-flex gap-2 flex-wrap">
    <div
      v-for="interviewTime in sortedInterviewTimes"
      :key="interviewTime.date"
      class="btn btn-rounded btn-light d-flex align-items-center gap-2 mb-2 btn-3d position-relative"
      style="padding-right: 24px"
    >
      <!-- 날짜 포맷 -->
      <span>{{ formatDate(interviewTime.date) }}</span>

      <!-- 시간 개수 배지 (있을 경우만 표시) -->
      <span
        v-if="interviewTime.times && interviewTime.times.length"
        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
        style="font-size: 0.7rem"
      >
        +{{ interviewTime.times.length }}
      </span>

      <!-- 삭제 버튼 -->
      <a
        href="#"
        @click.prevent="deleteTime(interviewTime.date)"
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
import { defineEmits, defineProps, computed } from 'vue'

const props = defineProps({
  interviewTimes: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['remove'])

const deleteTime = (date) => {
  emit('remove', date)
}

const formatDate = (isoDate) => {
  const [y, m, d] = isoDate.split('-')
  return `${y.slice(2)}.${m}.${d}`
}

const sortedInterviewTimes = computed(() => {
  return [...props.interviewTimes].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  )
})
</script>
