<template>
  <div class="d-flex justify-content-end mt-5 pt-3">
    <ul class="pagination mb-0">
      <li
        class="page-item"
        :class="{ disabled: currentPage === 1 }"
        @click.prevent="changePage(currentPage - 1)"
      >
        <a class="page-link" href="#"><i class="fas fa-angle-left"></i></a>
      </li>

      <li
        v-for="page in visiblePages"
        :key="page"
        class="page-item"
        :class="{ active: page === currentPage }"
        @click.prevent="changePage(page)"
      >
        <a class="page-link" href="#">{{ page }}</a>
      </li>

      <li
        class="page-item"
        :class="{ disabled: currentPage === totalPages }"
        @click.prevent="changePage(currentPage + 1)"
      >
        <a class="page-link" href="#"><i class="fas fa-angle-right"></i></a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})

const emit = defineEmits(['update:currentPage'])

const changePage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}

const visiblePages = computed(() => {
  const maxPages = 5
  const pages = []

  let start = Math.max(1, props.currentPage - Math.floor(maxPages / 2))
  let end = start + maxPages - 1

  if (end > props.totalPages) {
    end = props.totalPages
    start = Math.max(1, end - maxPages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})
</script>
