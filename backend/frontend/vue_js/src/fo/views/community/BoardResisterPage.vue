<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="일반 게시판"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '커뮤니티' }]"
    />
  </section>
  <div class="container py-5 mt-3">
    <BoardPostResister title="일반 게시글 등록" :isQna="false" />
  </div>
</template>
<script setup>
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import BoardPostResister from '@/fo/components/community/BoardPostRegister.vue'
</script>
<style></style>
