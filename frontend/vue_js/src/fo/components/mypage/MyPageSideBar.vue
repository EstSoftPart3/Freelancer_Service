<template>
  <div>
    <aside v-if="userStore.userType === 'COMPANY'" class="company sidebar">
      <h5 class="font-weight-semi-bold">마이 페이지</h5>
      <ul class="nav nav-list flex-column mb-5">
        <li class="nav-item">
          <span class="nav-link">소속 공고 관리</span>
          <ul>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/affiliationEdit" @click="handleNavigate">소속 정보 수정</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/affiliatedMembers" @click="handleNavigate">소속 인원 목록</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/affiliationApplicantList" @click="handleNavigate">지원자 현황</router-link>
            </li>
          </ul>
        </li>

        <li class="nav-item">
          <span class="nav-link">프로젝트 관리</span>
          <ul>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/affiliationProjectList" @click="handleNavigate">프로젝트 공고 목록</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/appliedProjects" @click="handleNavigate">지원 내역</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/projectScrap" @click="handleNavigate">스크랩 내역</router-link>
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
                :class="{ 'router-link-exact-active': isInformationActive }"
                @click="handleNavigate"
              >회원 정보 수정</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/withdraw" @click="handleNavigate">회원 탈퇴</router-link>
            </li>
          </ul>
        </li>

        <li class="nav-item">
          <span class="nav-link">알림</span>
          <ul class="notification-submenu">
            <li class="nav-item">
              <router-link
                class="nav-link notification-link"
                to="/mypage/notifications/setting"
                :class="{ 'router-link-exact-active': isNotificationSettingActive }"
                @click="handleNavigate"
              >알림 설정</router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link notification-link"
                to="/mypage/notifications"
                :class="{ 'router-link-exact-active': isNotificationActive }"
                @click="handleNavigate"
              >알림 내역</router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link notification-link"
                to="/mypage/notifications/trash"
                :class="{ 'router-link-exact-active': isNotificationTrashActive }"
                @click="handleNavigate"
              >휴지통</router-link>
            </li>
          </ul>
        </li>
      </ul>
    </aside>

    <aside v-else>
      <h5 class="font-weight-semi-bold">마이 페이지</h5>
      <ul class="nav nav-list flex-column mb-5">
        <li class="nav-item">
          <span class="nav-link">이력서 관리</span>
          <ul>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/resumeForm" @click="handleNavigate">이력서 등록</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/resumeList" @click="handleNavigate">이력서 목록</router-link>
            </li>
          </ul>
        </li>

        <li class="nav-item">
          <span class="nav-link">소속 관리</span>
          <ul>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/affiliatedJobApplications" @click="handleNavigate">지원 내역</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/affiliatedScrap" @click="handleNavigate">스크랩 내역</router-link>
            </li>
          </ul>
        </li>

        <li class="nav-item">
          <span class="nav-link">프로젝트 관리</span>
          <ul>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/appliedProjects" @click="handleNavigate">지원 내역</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/projectScrap" @click="handleNavigate">스크랩 내역</router-link>
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
                :class="{ 'router-link-exact-active': isInformationActive }"
                @click="handleNavigate"
              >회원 정보 수정</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/mypage/withdraw" @click="handleNavigate">회원 탈퇴</router-link>
            </li>
          </ul>
        </li>

        <li class="nav-item">
          <span class="nav-link">알림</span>
          <ul class="notification-submenu">
            <li class="nav-item">
              <router-link class="nav-link notification-link" to="/mypage/notifications/setting" @click="handleNavigate">알림 설정</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link notification-link" to="/mypage/notifications" @click="handleNavigate">알림 내역</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link notification-link" to="/mypage/notifications/trash" @click="handleNavigate">휴지통</router-link>
            </li>
          </ul>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useUserStore } from '@/fo/stores/userStore'
import { defineEmits, computed } from 'vue'

const emit = defineEmits(['navigate'])
const route = useRoute()
const userStore = useUserStore()

const handleNavigate = () => emit('navigate')

const isInformationActive = computed(() =>
  route.path === '/mypage' || route.path === '/mypage/informationEdit'
)

const isNotificationActive = computed(() =>
  route.path === '/mypage/notifications'
)

const isNotificationSettingActive = computed(() =>
  route.path.startsWith('/mypage/notifications/setting')
)

const isNotificationTrashActive = computed(() =>
  route.path.startsWith('/mypage/notifications/trash')
)
</script>

<style scoped>
.router-link-exact-active {
  font-weight: 700;
  color: #222;
}

span.nav-link {
  color: #000;
  font-weight: 700;
  margin-top: 12px;
}

.nav-list > .nav-item > ul {
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.notification-submenu > .nav-item + .nav-item {
  border-top: 1px solid #eee;
}

.notification-submenu > .nav-item {
  padding: 0;
}

.notification-link {
  display: flex;
  align-items: center;
}

.nav-link {
  cursor: pointer;
}
</style>
