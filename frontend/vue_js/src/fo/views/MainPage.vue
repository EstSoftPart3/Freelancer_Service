<template>
  <div class="main-page">
    <MainBanner @banner-action="handleBannerAction"/>
    <PopularProjects @go-to-list="goToProjectList"/>
    <FaqSection />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useAlertStore } from '../stores/alertStore';
import FaqSection from '../components/main/FaqSection.vue';
import MainBanner from '../components/main/MainBanner.vue';
import PopularProjects from '../components/main/PopularProjects.vue';


const router = useRouter();
const userStore = useUserStore();
const alertStore = useAlertStore();

// 배너 액션 핸들러
const handleBannerAction = (action) => {
  const actions = {
    'scroll-to-map': scrollToMap,
  }
  if (actions[action]) {
    actions[action]()
  }
}

const scrollToMap = () => {
  const isLoggedIn = userStore.isLoggedIn || !!localStorage.getItem('userSq')
  if (!isLoggedIn) {
    alertStore.show('로그인이 필요한 서비스입니다.', 'danger');
    router.push('login');
    return;
  }
  router.push({ path: '/project', query: { tab: 'map'}});
};

const goToProjectList = () => {
  router.push({ path: '/project', query: { tab: 'list' } });
};
</script>

<style scoped>
.main-page {
  background-color: #f8f9fa;
}
</style>