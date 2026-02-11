<template>
  <section
    class="page-header page-header-modern bg-color-grey page-header-sm sticky-page-header"
  >
    <div class="container">
      <div class="row">
        <div class="col-md-8 order-2 order-md-1 align-self-center p-static">
          <h1 class="text-dark fs-5">
            {{ title }}
            <strong>{{ strongText }}</strong>
          </h1>
        </div>
        <div class="col-md-4 order-1 order-md-2 align-self-center">
          <ul class="breadcrumb d-block text-md-end">
            <li v-for="(crumb, index) in breadcrumbs" :key="index">
              <template v-if="crumb.link">
                <a :href="crumb.link">{{ crumb.text }}</a>
              </template>
              <template v-else>
                <span class="active">{{ crumb.text }}</span>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  title: {
    type: String,
    default: 'Modern',
  },
  strongText: {
    type: String,
    default: 'Small',
  },
  breadcrumbs: {
    type: Array,
    default: () => [{ text: 'Home', link: '#' }, { text: 'Features' }],
  },
})
</script>

<style scoped>
.page-header {
  width: 100%;
}
/* [추가] 페이지 헤더 고정 스타일 */
.sticky-page-header {
  position: sticky; /* 스크롤 시 상단에 고정 */
  top: 100px; /* App.vue에서 설정한 main의 padding-top 값과 맞춰야 합니다 */
  z-index: 99; /* 컨텐츠보다는 높고, 모달보다는 낮게 설정 */
  border-bottom: 1px solid #ddd; /* 고정되었을 때 구분선 (선택 사항) */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); /* 입체감 (선택 사항) */
}

.page-header.page-header-sm {
  padding: 20px 0;
}
</style>
