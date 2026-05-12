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
                        <i class="fas fa-chevron-down"></i
                      ></router-link>
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
                        <i class="fas fa-chevron-down"></i
                      ></router-link>
                    </li>
                    <li class="dropdown">
                      <router-link
                        class="dropdown-item dropdown-toggle"
                        :class="{
                          active: isProjectActive,
                          'current-page-active': true,
                        }"
                        to="/freelancerListPage"
                      >
                        프리랜서
                        <i class="fas fa-chevron-down"></i
                      ></router-link>
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
                        <i class="fas fa-chevron-down"></i
                      ></a>
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
                    <li class="dropdown">
                      <router-link
                        class="dropdown-item dropdown-toggle"
                        :class="{
                          active: isNoticeActive,
                          'current-page-active': true,
                        }"
                        to="/notice"
                      >
                        공지사항
                      </router-link>
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
                    class="dropdown-menu dropdown-menu-end p-0 shadow border-0"
                    aria-labelledby="notificationDropdown"
                    style="
                      min-width: 300px;
                      max-height: 400px;
                      overflow-y: auto;
                    "
                  >
                    <div
                      class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light"
                    >
                      <h6 class="m-0 fw-bold">알림</h6>
                      <div class="d-flex align-items-center gap-2">
                        <span v-if="unreadCount > 0" class="badge bg-primary">{{
                          unreadCount
                        }}</span>
                        <button
                          @click.stop="markAllAsRead"
                          class="btn btn-sm btn-outline-primary"
                          style="font-size: 0.7rem"
                        >
                          모두 읽음
                        </button>
                        <button
                          @click.stop="deleteAllNoti"
                          class="btn btn-sm btn-outline-danger"
                          style="font-size: 0.7rem"
                        >
                          전체 삭제
                        </button>
                      </div>
                    </div>

                    <div v-if="notifications && notifications.length > 0">
                      <div
                        v-for="noti in notifications"
                        :key="noti.notificationSq"
                        class="dropdown-item p-3 border-bottom position-relative notification-item"
                        :class="{
                          unread: noti.notificationReadYn === 'N',
                          read: noti.notificationReadYn === 'Y',
                        }"
                        @click="markAsRead(noti)"
                      >
                        <router-link
                          :to="noti.notificationTargetUrl || '#'"
                          class="text-decoration-none d-block"
                        >
                          <div
                            class="d-flex justify-content-between align-items-start"
                          >
                            <p
                              class="mb-1 text-wrap noti-content"
                              :class="
                                noti.notificationReadYn === 'N'
                                  ? 'fw-bold text-dark'
                                  : 'text-muted'
                              "
                            >
                              {{ noti.notificationContentTxt }}
                            </p>
                            <button
                              @click.prevent.stop="
                                deleteNoti(noti.notificationSq)
                              "
                              class="btn-close"
                              style="font-size: 0.5rem"
                            ></button>
                          </div>
                          <small class="text-muted" style="font-size: 0.7rem">
                            {{
                              noti.notificationCreatedAtDtm
                                ? noti.notificationCreatedAtDtm.split('T')[0]
                                : ''
                            }}
                          </small>
                        </router-link>
                      </div>
                    </div>

                    <div v-else class="p-4 text-center text-muted">
                      <i class="bi bi-bell-slash fs-4 d-block mb-2"></i>
                      <small>새로운 알림이 없습니다.</small>
                    </div>

                    <!-- <div class="p-2 border-top text-center bg-light">
                      <router-link
                        to="/mypage/notifications"
                        class="small text-primary text-decoration-none fw-bold"
                        >전체보기</router-link
                      >
                    </div> -->
                  </div>
                </div>

                <!-- 유저 아이콘 + 이름 (버튼 정렬) -->
                <!-- 유저 아이콘 + 이름 (드롭다운) -->
                <div class="dropdown" ref="userDropdownRef">
                  <a
                    href="#"
                    role="button"
                    class="btn btn-light d-flex align-items-center gap-2 px-3 py-1 dropdown-toggle"
                    style="height: 36px; border-radius: 50px"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
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
                    <li class="dropdown">
                      <router-link
                        class="dropdown-item dropdown-toggle"
                        :class="{
                          active: isProjectActive,
                          'current-page-active': true,
                        }"
                        to="/freelancerListPage"
                      >
                        프리랜서
                        <i class="fas fa-chevron-down"></i
                      ></router-link>
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
                    <li class="dropdown">
                      <router-link
                        class="dropdown-item dropdown-toggle"
                        :class="{
                          active: isNoticeActive,
                          'current-page-active': true,
                        }"
                        to="/notice"
                      >
                        공지사항
                      </router-link>
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
import { api } from '@/axios'
import { useRoute, useRouter } from 'vue-router'

const alertStore = useAlertStore()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const route = useRoute()
const router = useRouter()
const headerRef = ref(null)
const notificationDropdownRef = ref(null)
const userDropdownRef = ref(null)
const notifications = ref([])
const unreadCount = ref(0)

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
const isNoticeActive = computed(() => currentPath.value.startsWith('/notice'))

// Mobile dropdown state
const isCommunityDropdownOpen = ref(false)

const toggleCommunityDropdown = () => {
  isCommunityDropdownOpen.value = !isCommunityDropdownOpen.value
}

const logout = async () => {
  // 유지할 값만 추출
  const backup = {
    pId: localStorage.getItem('savedPersonalId'),
    cId: localStorage.getItem('savedCompanyId'),
    type: localStorage.getItem('savedLoginType'),
  }

  // 서버 로그아웃은 실패해도 로컬은 무조건 정리
  try {
    await api.$post('/logout', {})
  } catch (error) {
    console.log('서버 로그아웃 실패 (무시):', error)
  }

  localStorage.clear()

  // 복원
  if (backup.pId) localStorage.setItem('savedPersonalId', backup.pId)
  if (backup.cId) localStorage.setItem('savedCompanyId', backup.cId)
  if (backup.type) localStorage.setItem('savedLoginType', backup.type)

  window.location.href = '/?logout=true'
}

// 알림 목록 가져오기
const fetchNotifications = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await api.$get(`/notifications`)
    notifications.value = res
  } catch (error) {
    console.error('알림 목록 조회 실패:', error)
  }
}

// 안 읽은 알림 수 가져오기
const fetchUnreadCount = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await api.$get(`/notifications/unread-count`)
    unreadCount.value = res
  } catch (error) {
    console.error('알림 개수 조회 실패:', error)
  }
}

// 알림 읽음 처리
const markAsRead = async (notification) => {
  if (notification.notificationReadYn === 'Y') return
  try {
    await api.$patch(`/notifications/${notification.notificationSq}`)
    // 서버 응답을 기다리지 않고 즉시 UI 반영 (Optimistic UI)
    notification.notificationReadYn = 'Y'
    await fetchUnreadCount() // 배지 카운트 갱신
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error)
  }
}

// 알림 삭제
const deleteNoti = async (sq) => {
  try {
    await api.$delete(`/notifications/${sq}`)
    notifications.value = notifications.value.filter(
      (n) => n.notificationSq !== sq,
    )
    await fetchUnreadCount()
  } catch (error) {
    console.error('알림 삭제 실패:', error)
  }
}

// 모두 읽음 처리
const markAllAsRead = async () => {
  try {
    await api.$patch(`/notifications`)
    notifications.value.forEach((n) => (n.notificationReadYn = 'Y'))
    unreadCount.value = 0
  } catch (error) {
    console.error('알림 모두 읽음 처리 실패:', error)
  }
}

// 전체 삭제
const deleteAllNoti = async () => {
  try {
    await api.$delete(`/notifications`)
    notifications.value = []
    unreadCount.value = 0
  } catch (error) {
    console.error('알림 전체 삭제 실패:', error)
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    fetchNotifications()
    fetchUnreadCount()
  }
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

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('logout') === 'true') {
    alertStore.show('로그아웃되었습니다.', 'success')
    // URL에서 파라미터 제거 (선택 사항: 깔끔한 주소창을 위해)
    router.replace('/')
  }
})

// 로그인 시 데이터 다시 불러오기
watch(isLoggedIn, (newVal) => {
  if (newVal) {
    fetchNotifications()
    fetchUnreadCount()
  } else {
    notifications.value = []
    unreadCount.value = 0
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

/* 읽지 않은 알림: 연한 파란색 배경 + 왼쪽 강조선 */
.notification-item.unread {
  background-color: #f0f7ff !important;
  border-left: 3px solid var(--bs-primary);
  transition: background-color 0.3s ease;
}

/* 읽은 알림: 흰색 배경 + 흐릿한 텍스트 */
.notification-item.read {
  background-color: #ffffff !important;
  opacity: 0.8;
}

.notification-item:hover {
  background-color: #f8f9fa !important;
}

.noti-content {
  font-size: 0.8rem !important; /* 기존보다 확연히 크게 설정 */
  line-height: 1.5; /* 줄 간격을 넓혀서 가독성 향상 */
  margin-bottom: 4px;
  word-break: break-all; /* 긴 단어 줄바꿈 */
}

/* 안 읽은 알림의 텍스트는 좀 더 진하게 */
.unread .noti-content {
  color: #212529 !important;
}

/* 읽은 알림의 텍스트는 연하게 */
.read .noti-content {
  color: #6c757d !important;
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
