<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="QnA 게시판"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '커뮤니티' }]"
    />
    <div class="container py-5 mt-3">
      <BoardPostResister title="QnA 게시글 등록" :isQna="true" />
    </div>
  </section>
</template>
<script setup>
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import BoardPostResister from '@/fo/components/community/BoardPostRegister.vue'
</script>
<style></style>
