<template>
  <div>
    <!-- Company Sidebar -->
    <aside v-if="userStore.userType === 'COMPANY'" class="company sidebar">
      <h5 class="font-weight-semi-bold">마이 페이지</h5>
      <ul class="nav nav-list flex-column mb-5">
        <li class="nav-item">
          <span class="nav-link">일정 관리</span>
          <ul>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/calendar"
                @click="handleNavigate"
              >
                캘린더 보기
              </router-link>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <span class="nav-link">소속 공고 관리</span>
          <ul>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/affiliationEdit"
                @click="handleNavigate"
                >소속 정보 수정</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/affiliatedMembers"
                @click="handleNavigate"
                >소속 인원 목록</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/affiliationApplicantList"
                @click="handleNavigate"
                >지원자 현황</router-link
              >
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <span class="nav-link">프로젝트 관리</span>
          <ul>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/affiliationProjectList"
                @click="handleNavigate"
                >프로젝트 공고 목록</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/appliedProjects"
                @click="handleNavigate"
                >지원 내역</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/projectScrap"
                @click="handleNavigate"
                >스크랩 내역</router-link
              >
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <span class="nav-link">회원 정보 관리</span>
          <ul>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/informationEdit"
                :class="{
                  'router-link-exact-active':
                    $route.path === '/mypage' ||
                    $route.path === '/mypage/informationEdit',
                }"
                @click="handleNavigate"
              >
                회원 정보 수정
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/withdraw"
                @click="handleNavigate"
                >회원 탈퇴</router-link
              >
            </li>
          </ul>
        </li>
      </ul>
    </aside>

    <!-- Personal Sidebar -->
    <aside v-else>
      <h5 class="font-weight-semi-bold">마이 페이지</h5>
      <ul class="nav nav-list flex-column mb-5">
        <li class="nav-item">
          <span class="nav-link">일정 관리</span>
          <ul>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/calendar"
                @click="handleNavigate"
              >
                캘린더 보기
              </router-link>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <span class="nav-link">이력서 관리</span>
          <ul>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/resumeForm"
                @click="handleNavigate"
                >이력서 등록</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/resumeList"
                @click="handleNavigate"
                >이력서 목록</router-link
              >
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <span class="nav-link">소속 관리</span>
          <ul>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/affiliatedJobApplications"
                @click="handleNavigate"
                >지원 내역</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/affiliatedScrap"
                @click="handleNavigate"
                >스크랩 내역</router-link
              >
            </li>
            <li v-if="userStore.isAffiliated === 'Y'" class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/affiliatedWithdraw"
                @click="handleNavigate"
                >소속 탈퇴</router-link
              >
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <span class="nav-link">프로젝트 관리</span>
          <ul>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/appliedProjects"
                @click="handleNavigate"
                >지원 내역</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/projectScrap"
                @click="handleNavigate"
                >스크랩 내역</router-link
              >
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <span class="nav-link">회원 정보 관리</span>
          <ul>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/informationEdit"
                :class="{
                  'router-link-exact-active':
                    $route.path === '/mypage' ||
                    $route.path === '/mypage/informationEdit',
                }"
                @click="handleNavigate"
              >
                회원 정보 수정
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/mypage/withdraw"
                @click="handleNavigate"
                >회원 탈퇴</router-link
              >
            </li>
          </ul>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup>
import { useUserStore } from '@/fo/stores/userStore'
import { defineEmits } from 'vue'

const emit = defineEmits(['navigate'])
const userStore = useUserStore()

const handleNavigate = () => {
  emit('navigate')
}
</script>

<style scoped>
.router-link-exact-active {
  font-weight: bold;
}

span.nav-link {
  color: black;
  font-weight: bold;
}
</style>
