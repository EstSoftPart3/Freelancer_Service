<template>
  <div>
    <p>구글 로그인 처리 중...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  const code = route.query.code
  console.log('구글에서 받은 인증 코드:', code)
})
</script>
