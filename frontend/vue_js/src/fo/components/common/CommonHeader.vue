<template>
  <header
    id="header"
    ref="headerRef"
    class="header-effect-shrink header-spacing"
    data-plugin-options='{"stickyEnabled": true}'
  >
    <!-- <header
    id="header"
    class="header-effect-shrink"
    data-plugin-options="{'stickyEnabled': true, 'stickyEffect': 'shrink', 'stickyEnableOnBoxed': true, 'stickyEnableOnMobile': false, 'stickyChangeLogo': true, 'stickyStartAt': 30, 'stickyHeaderContainerHeight': 70}"
    style="height: 103.2px"
  > -->
    <!-- 로그인 상태 -->
    <div v-if="isLoggedIn" class="header-body border-0">
      <div class="header-container container">
        <div class="header-row justify-content-between">
          <div class="header-left d-flex align-items-center">
            <router-link
              to="/"
              class="text-primary fs-3 text-decoration-none home"
              @click="closeMenu"
            >
              Freelancer<br />
              Service
            </router-link>
          </div>
          <div class="d-flex align-items-center">
            <div
              class="header-nav header-nav-line header-nav-top-line header-nav-top-line-with-border order-2 order-lg-1"
            >
              <div
                class="header-nav-main header-nav-main-square header-nav-main-effect-2 header-nav-main-sub-effect-1"
              >
                <nav class="collapse">
                  <ul class="nav nav-pills" id="mainNav">
                    <li class="dropdown">
                      <router-link
                        class="dropdown-item dropdown-toggle"
                        :class="{
                          active: isAffiliationActive,
                          'current-page-active': true,
                        }"
                        to="/affiliation"
                      >
                        소속
                        <i class="fas fa-chevron-down"></i>
                      </router-link>
                    </li>
                    <li class="dropdown">
                      <router-link
                        class="dropdown-item dropdown-toggle"
                        :class="{
                          active: isProjectActive,
                          'current-page-active': true,
                        }"
                        to="/projectListPage"
                      >
                        프로젝트
                        <i class="fas fa-chevron-down"></i>
                      </router-link>
                    </li>
                    <li
                      class="dropdown"
                      :class="{ open: isCommunityDropdownOpen }"
                    >
                      <a
                        href="#"
                        class="dropdown-item dropdown-toggle"
                        :class="{
                          active: isCommunityActive,
                          'current-page-active': true,
                        }"
                        @click.prevent="toggleCommunityDropdown"
                        data-community-toggle
                      >
                        커뮤니티
                        <i class="fas fa-chevron-down"></i>
                      </a>
                      <ul class="dropdown-menu">
                        <li>
                          <router-link class="dropdown-item" to="/board"
                            >일반 게시판
                          </router-link>
                        </li>
                        <li>
                          <router-link class="dropdown-item" to="/qna"
                            >Q&A 게시판
                          </router-link>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
              <button
                class="btn header-btn-collapse-nav"
                data-bs-toggle="collapse"
                data-bs-target=".header-nav-main nav"
              >
                <i class="fas fa-bars"></i>
              </button>
            </div>
            <div
              class="header-nav-features header-nav-features-no-border header-nav-features-lg-show-border order-1 order-lg-2"
            >
              <div
                class="header-nav-feature d-inline-flex gap-2 align-items-center"
              >
                <!-- 유저 아이콘 + 이름 (드롭다운) -->
                <div class="dropdown" ref="notificationDropdownRef">
                  <a
                    href="#"
                    role="button"
                    class="btn btn-light d-flex justify-content-center align-items-center position-relative dropdown-toggle no-caret"
                    id="notificationDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style="width: 36px; height: 36px; border-radius: 50%"
                  >
                    <i class="bi bi-bell fs-5"></i>

                    <!-- 알림 배지 -->
                    <span
                      v-if="unreadCount > 0"
                      class="position-absolute border border-light rounded-circle"
                      style="
                        top: -1px;
                        right: -1px;
                        width: 10px;
                        height: 10px;
                        background-color: var(--bs-primary);
                        opacity: 0.85;
                      "
                    >
                    </span>
                  </a>

                  <div
                    class="dropdown-menu dropdown-menu-end p-2 shadow"
                    aria-labelledby="notificationDropdown"
                    style="
                      min-width: 250px;
                      max-height: 300px;
                      overflow-y: auto;
                    "
                  >
                    <h6
                      class="dropdown-header d-flex justify-content-between align-items-center"
                    >
                      <span>알림 ({{ unreadCount }})</span>
                    </h6>
                    <div class="dropdown-divider"></div>
                    <template v-if="notifications.length > 0">
                      <div
                        v-for="notification in notifications"
                        :key="notification.notificationSq"
                        class="dropdown-item small"
                        :class="{
                          'text-dark':
                            notification.notificationIsReadYn !== 'Y',
                          'text-muted':
                            notification.notificationIsReadYn === 'Y',
                          'bg-light': notification.notificationIsReadYn !== 'Y', // 읽지 않은 알림 배경색 강조 (선택 사항)
                        }"
                        style="white-space: normal; cursor: pointer"
                        @click="markAsRead(notification.notificationSq)"
                      >
                        <i
                          class="me-1"
                          :class="{
                            // 1. 프로젝트 관련 알림 (예: 등록, 마감, 승인)
                            'fas fa-briefcase text-primary':
                              notification.notificationType === 'PROJECT',
                            // 2. 스크랩/관심 목록 관련 알림
                            'fas fa-star text-warning':
                              notification.notificationType === 'SCRAP',
                            // 3. 댓글/메시지 관련 알림
                            'fas fa-comment-dots text-info':
                              notification.notificationType === 'COMMENT',
                            // 4. 일반 시스템/공지 알림 (기본)
                            'fas fa-bell text-secondary':
                              notification.notificationType === 'SYSTEM' ||
                              !notification.notificationType,
                          }"
                        ></i>
                        <span
                          :class="{
                            'fw-medium':
                              notification.notificationIsReadYn !== 'Y',
                          }"
                        >
                          {{ notification.notificationTtl }}
                        </span>
                        <br />
                        <small :class="ms - 3">{{
                          notification.createdAt || '방금 전'
                        }}</small>
                      </div>
                    </template>
                    <div
                      v-else
                      class="dropdown-item text-center small text-muted"
                    >
                      새로운 알림이 없습니다.
                    </div>
                    <!-- <div class="dropdown-item small text-muted">
                      📌 프로젝트 모집 마감 임박 <br /><small>2분 전</small>
                    </div>
                    <div class="dropdown-item small text-muted">
                      ✅ 프로젝트가 승인되었어요 <br /><small>10분 전</small>
                    </div>
                    <div class="dropdown-item small text-muted">
                      🔔 스크랩 기업 신규 공고 <br /><small>3시간 전</small>
                    </div>
                    <div class="dropdown-item small text-muted">
                      🗨️ {{ notification.notificationTtl }} <br /><small
                        >1시간 전</small
                      >
                    </div> -->
                    <div class="dropdown-divider"></div>
                    <a
                      class="dropdown-item text-center small text-primary"
                      href="/notifications"
                      >전체 보기</a
                    >
                  </div>
                  <!-- <div
                    class="dropdown-menu dropdown-menu-end p-2 shadow"
                    aria-labelledby="notificationDropdown"
                    style="min-width: 250px"
                  >
                    <div class="dropdown-item small text-muted">
                      🔧 준비 중입니다.
                    </div>
                  </div> -->
                </div>

                <!-- 유저 아이콘 + 이름 (버튼 정렬) -->
                <!-- 유저 아이콘 + 이름 (드롭다운) -->
                <div class="dropdown" ref="userDropdownRef">
                  <a
                    href="#"
                    role="button"
                    class="btn btn-light d-flex align-items-center gap-2 px-3 py-1 dropdown-toggle"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style="height: 36px; border-radius: 50px"
                  >
                    <i class="bi bi-person-circle fs-5"></i>
                    <span>{{ userStore.userNm }}</span>
                  </a>

                  <ul
                    class="dropdown-menu dropdown-menu-end mt-2"
                    aria-labelledby="userDropdown"
                    style="min-width: 150px"
                  >
                    <li>
                      <router-link class="dropdown-item" to="/mypage"
                        >마이페이지</router-link
                      >
                    </li>
                    <li>
                      <hr class="dropdown-divider" />
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="logout"
                        >로그아웃</a
                      >
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 비로그인 상태 -->
    <div v-else class="header-body border-0">
      <div class="header-container container">
        <div class="header-row justify-content-between">
          <div class="header-left d-flex align-items-center">
            <router-link
              to="/"
              class="text-primary fs-3 text-decoration-none home"
              @click="closeMenu"
            >
              Freelancer<br />
              Service
            </router-link>
          </div>

          <div class="d-flex align-items-center">
            <!-- 네비게이션 메뉴 -->
            <div
              class="header-nav header-nav-line header-nav-top-line header-nav-top-line-with-border order-2 order-lg-1"
            >
              <div
                class="header-nav-main header-nav-main-square header-nav-main-effect-2 header-nav-main-sub-effect-1"
              >
                <nav class="collapse">
                  <ul class="nav nav-pills" id="mainNav">
                    <li class="dropdown">
                      <router-link
                        class="dropdown-item dropdown-toggle"
                        :class="{
                          active: isAffiliationActive,
                          'current-page-active': true,
                        }"
                        to="/affiliation"
                      >
                        소속
                        <i class="fas fa-chevron-down"></i>
                      </router-link>
                    </li>
                    <li class="dropdown">
                      <router-link
                        class="dropdown-item dropdown-toggle"
                        :class="{
                          active: isProjectActive,
                          'current-page-active': true,
                        }"
                        to="/projectListPage"
                      >
                        프로젝트
                        <i class="fas fa-chevron-down"></i>
                      </router-link>
                    </li>
                    <li
                      class="dropdown"
                      :class="{ open: isCommunityDropdownOpen }"
                    >
                      <a
                        href="#"
                        class="dropdown-item dropdown-toggle"
                        :class="{
                          active: isCommunityActive,
                          'current-page-active': true,
                        }"
                        @click.prevent="toggleCommunityDropdown"
                        data-community-toggle
                      >
                        커뮤니티
                        <i class="fas fa-chevron-down"></i>
                      </a>
                      <ul class="dropdown-menu">
                        <li>
                          <router-link class="dropdown-item" to="/board"
                            >일반 게시판</router-link
                          >
                        </li>
                        <li>
                          <router-link class="dropdown-item" to="/qna"
                            >Q&A 게시판</router-link
                          >
                        </li>
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
              <button
                class="btn header-btn-collapse-nav"
                data-bs-toggle="collapse"
                data-bs-target=".header-nav-main nav"
              >
                <i class="fas fa-bars"></i>
              </button>
            </div>

            <!-- 로그인 링크 -->
            <div
              class="header-nav-features header-nav-features-no-border header-nav-features-lg-show-border order-1 order-lg-2"
            >
              <div class="header-nav-feature d-inline-flex">
                <router-link to="/login" class="text-muted text-decoration-none"
                  >로그인</router-link
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, ref, watch } from 'vue'
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useNotificationStore } from '@/fo/stores/notificationStore'
import router from '@/fo/router'
import { useRoute } from 'vue-router'
import { api } from '@/axios'

const alertStore = useAlertStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const route = useRoute()
const headerRef = ref(null)
const notificationDropdownRef = ref(null)
const userDropdownRef = ref(null)

const unreadCount = computed(() => notificationStore.unreadCount)

const notifications = computed(() => notificationStore.notifications)
const markAsRead = async (notificationSq) => {
  await notificationStore.markAsRead(notificationSq)
}

//SSE 연결 관리
watch(
  isLoggedIn,
  (newValue) => {
    if (newValue) {
      notificationStore.loadNotifications()
      notificationStore.connectSSE()
    } else {
      //로그아웃 시 SSE 연결 해제
      notificationStore.disconnectSSE()
    }
  },
  { immediate: true },
)

const closeMenu = () => {
  const navCollapse = document.querySelector('.header-nav-main nav.collapse')
  if (navCollapse && navCollapse.classList.contains('show')) {
    const collapseInstance = window.bootstrap.Collapse.getInstance(navCollapse)
    if (collapseInstance) {
      collapseInstance.hide()
    }
  }
}

const handleClickOutside = (event) => {
  if (headerRef.value && !headerRef.value.contains(event.target)) {
    closeMenu()
  }
}

// 현재 경로
const currentPath = computed(() => route.path)

// 각 메뉴의 활성 여부 판별
const isAffiliationActive = computed(() =>
  currentPath.value.startsWith('/affiliation'),
)
const isProjectActive = computed(() =>
  currentPath.value.startsWith('/projectListPage'),
)
const isCommunityActive = computed(() =>
  ['/board', '/qna'].some((path) => currentPath.value.startsWith(path)),
)

// Mobile dropdown state
const isCommunityDropdownOpen = ref(false)

const toggleCommunityDropdown = () => {
  isCommunityDropdownOpen.value = !isCommunityDropdownOpen.value
}

const logout = async () => {
  await api.$post(
    '/logout',
    {},
    {
      withCredentials: true,
    },
  ) // 서버 로그아웃 API 호출

  //SSE 연결 해제
  notificationStore.disconnectSSE()

  // 1. 아이디 저장값(개인/기업 아이디, 로그인 타입)만 따로 저장해둠
  const savedPersonalId = localStorage.getItem('savedPersonalId')
  const savedCompanyId = localStorage.getItem('savedCompanyId')
  const savedLoginType = localStorage.getItem('savedLoginType')

  // 2. 로컬스토리지 전체 초기화
  localStorage.clear()

  // 3. 아이디 저장값 복원
  if (savedPersonalId) localStorage.setItem('savedPersonalId', savedPersonalId)
  if (savedCompanyId) localStorage.setItem('savedCompanyId', savedCompanyId)
  if (savedLoginType) localStorage.setItem('savedLoginType', savedLoginType)

  // 4. Pinia 상태 초기화
  userStore.$reset()
  alertStore.show('로그아웃되었습니다.', 'success')
  // 5. 메인 페이지로 이동
  router.push('/')
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  if (notificationDropdownRef.value) {
    notificationDropdownRef.value.addEventListener(
      'show.bs.dropdown',
      closeMenu,
    )
  }
  if (userDropdownRef.value) {
    userDropdownRef.value.addEventListener('show.bs.dropdown', closeMenu)
  }
})

watch(currentPath, () => {
  closeMenu()
  isCommunityDropdownOpen.value = false
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  if (notificationDropdownRef.value) {
    notificationDropdownRef.value.removeEventListener(
      'show.bs.dropdown',
      closeMenu,
    )
  }
  if (userDropdownRef.value) {
    userDropdownRef.value.removeEventListener('show.bs.dropdown', closeMenu)
  }
  // 컴포넌트 언마운트 시 SSE 연결 해제
  notificationStore.disconnectSSE()
})
</script>

<style scoped>
.home {
  font-weight: bold;
  display: block;
  text-align: center;
}

.header-body {
  position: fixed !important;
  top: 0;
  z-index: 999;
  width: 100%;
  background: white;
  height: 100px; /* 초기 높이 설정 */
  transition: box-shadow 0.3s ease; /* transition을 box-shadow에만 적용 */
}

.header-body.shrink {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 스크롤 시 그림자 효과 */
}

/* dropdown-toggle 클래스의 화살표 제거 */
#notificationDropdown::after {
  display: none !important;
}

/* Mobile Menu Dropdown Styles */
@media (max-width: 991px) {
  .header-nav-main nav .dropdown .dropdown-menu {
    display: none;
    /* position: static; */ /* Caused layout issues */
    border: none;
    box-shadow: none;
    background: transparent;
    padding-left: 15px;
  }

  .header-nav-main nav .dropdown.open > .dropdown-menu {
    display: block;
  }

  .header-nav-main nav .dropdown .dropdown-toggle::after {
    content: '\f078'; /* FontAwesome down arrow */
    font-family: 'Font Awesome 5 Free';
    font-weight: 900;
    transition: transform 0.2s ease;
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
  }

  .header-nav-main nav .dropdown.open > .dropdown-toggle::after {
    transform: translateY(-50%) rotate(180deg);
  }
}
</style>
