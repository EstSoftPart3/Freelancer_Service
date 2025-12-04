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
                <!-- 알림 드롭다운 -->
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
                        class="dropdown-item small position-relative"
                        :class="{
                          'text-dark':
                            notification.notificationIsReadYn !== 'Y',
                          'text-muted':
                            notification.notificationIsReadYn === 'Y',
                          'bg-light': notification.notificationIsReadYn !== 'Y',
                        }"
                        style="white-space: normal; cursor: pointer"
                        @click="handleNotificationClick(notification)"
                      >
                        <!-- 읽지 않은 알림 파란색 점 표시 -->
                        <span
                          v-if="notification.notificationIsReadYn === 'N'"
                          class="position-absolute rounded-circle"
                          style="
                            top: 10px;
                            left: 8px;
                            width: 8px;
                            height: 8px;
                            background-color: var(--bs-primary);
                          "
                        ></span>
                        <!-- 타입별 이모지 -->
                        <span
                          :style="
                            notification.notificationIsReadYn === 'N'
                              ? 'margin-left: 16px;'
                              : ''
                          "
                        >
                          {{
                            getNotificationEmoji(
                              notification.notificationTypeCd,
                            )
                          }}
                        </span>

                        <!-- 알림 제목 -->
                        <span
                          :class="{
                            'fw-medium':
                              notification.notificationIsReadYn !== 'Y',
                          }"
                        >
                          {{ notification.notificationTtl }}
                        </span>
                        <br />

                        <!-- 시간 표시 -->
                        <small class="ms-3">{{
                          formatNotificationTime(
                            notification.notificationCreatedAtDtm,
                          )
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

                <!-- 유저 드롭다운 -->
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

// 알림 타입별 이모지 반환
const getNotificationEmoji = (typeCd) => {
  const emojiMap = {
    2201: '💬', // QnA 답변
    2202: '🗨️', // 댓글
    2203: '📝', // 게시글
    2204: '📌', // 프로젝트 마감
    2205: '🔔', // 스크랩
    2206: '✅', // 승인
    2207: '📋', // 지원 결과
  }
  return emojiMap[typeCd] || '🔔' // 기본값
}

// 알림 시간 포맷
const formatNotificationTime = (dateTime) => {
  if (!dateTime) return '방금 전'

  const date = new Date(dateTime)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}.${day}`
}

// 알림 클릭 처리
const handleNotificationClick = async (notification) => {
  console.log('알림 클릭:', notification)

  // 읽음 처리
  await notificationStore.markAsRead(notification.notificationSq)

  // 드롭다운 닫기
  const dropdownElement =
    notificationDropdownRef.value?.querySelector('.dropdown-menu')
  if (dropdownElement) {
    window.bootstrap.Dropdown.getInstance(
      notificationDropdownRef.value.querySelector(
        '[data-bs-toggle="dropdown"]',
      ),
    )?.hide()
  }

  // 페이지 이동
  navigateToTarget(notification)
}

// 페이지 이동 로직
const navigateToTarget = (notification) => {
  const typeCd = notification.notificationTargetTypeCd
  const targetSq = notification.notificationTargetSq
  const parentSq = notification.notificationTargetParentSq
  const parentTypeCd = notification.notificationTargetParentTypeCd
  const title = notification.notificationTtl || ''

  console.log('navigateToTarget:', {
    typeCd,
    targetSq,
    parentSq,
    parentTypeCd,
    title,
  })

  switch (typeCd) {
    case 2201: // QnA 답변
      if (parentSq) {
        router.push({
          path: `/qna/${parentSq}`,
          hash: `#answer-${targetSq}`,
        })
      }
      break

    case 2202: //일반게시판 댓글
      router.push({
        path: `/board/${parentSq}`,
        hash: `#comment-${targetSq}`,
      })
      break
    case 2205: // 스크랩
      router.push(`/project/spec/user/${targetSq}`)
      break
    case 2207: // 지원 결과
      if (title.includes('지원')) {
        // 지원 관련
        if (targetSq) {
          router.push(`/applications/${targetSq}`)
        }
      } else if (title.includes('스크랩')) {
        // 스크랩 관련
        if (targetSq) {
          router.push(`/projects/${targetSq}`)
        }
      } else {
        console.warn('알 수 없는 알림 타입:', typeCd, '제목:', title)
      }
      break
    case 2209:
      router.push({
        path: `/qna/${parentSq}`,
        hash: `#comment-${targetSq}`,
      })
      break
    default:
      console.log('알 수 없는 타입 : ', targetSq)
  }
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
  height: 100px;
  transition: box-shadow 0.3s ease;
}

.header-body.shrink {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

#notificationDropdown::after {
  display: none !important;
}

@media (max-width: 991px) {
  .header-nav-main nav .dropdown .dropdown-menu {
    display: none;
    border: none;
    box-shadow: none;
    background: transparent;
    padding-left: 15px;
  }

  .header-nav-main nav .dropdown.open > .dropdown-menu {
    display: block;
  }

  .header-nav-main nav .dropdown .dropdown-toggle::after {
    content: '\f078';
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
