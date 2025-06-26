<template>
  <header
    id="header"
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
        <div class="header-row">
          <div class="header-left d-flex align-items-center order-0 order-lg-0">
            <router-link
              to="/"
              class="text-primary fs-3 text-decoration-none home"
            >
              Freelancer<br />
              Service
            </router-link>
          </div>
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
                        active: isCommunityActive,
                        'current-page-active': true,
                      }"
                      to="/board"
                    >
                      커뮤니티
                      <i class="fas fa-chevron-down"></i
                    ></router-link>
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
              <div class="dropdown">
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

                <!-- <div
                  class="dropdown-menu dropdown-menu-end p-2 shadow"
                  aria-labelledby="notificationDropdown"
                  style="min-width: 250px; max-height: 300px; overflow-y: auto"
                >
                  <h6 class="dropdown-header">알림</h6>
                  <div class="dropdown-item small text-muted">
                    📌 새로운 댓글이 달렸어요 <br /><small>2분 전</small>
                  </div>
                  <div class="dropdown-item small text-muted">
                    ✅ 프로젝트가 승인되었어요 <br /><small>10분 전</small>
                  </div>
                  <div class="dropdown-item small text-muted">
                    🔔 시스템 점검 예정 <br /><small>1시간 전</small>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a
                    class="dropdown-item text-center small text-primary"
                    href="/notifications"
                    >전체 보기</a
                  >
                </div> -->
                <div
                  class="dropdown-menu dropdown-menu-end p-2 shadow"
                  aria-labelledby="notificationDropdown"
                  style="min-width: 250px"
                >
                  <div class="dropdown-item small text-muted">
                    🔧 준비 중입니다.
                  </div>
                </div>
              </div>

              <!-- 유저 아이콘 + 이름 (버튼 정렬) -->
              <!-- 유저 아이콘 + 이름 (드롭다운) -->
              <div class="dropdown">
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
    <!-- 비로그인 상태 -->
    <div v-else class="header-body border-0">
      <div class="header-container container">
        <div class="header-row">
          <div class="header-left d-flex align-items-center order-0 order-lg-0">
            <router-link
              to="/"
              class="text-primary fs-3 text-decoration-none home"
            >
              Freelancer<br />
              Service
            </router-link>
          </div>

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
                        active: isCommunityActive,
                        'current-page-active': true,
                      }"
                      to="/board"
                    >
                      커뮤니티
                      <i class="fas fa-chevron-down"></i>
                    </router-link>
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
  </header>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed } from 'vue'
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import router from '@/fo/router'
import { api } from '@/axios'
import { useRoute } from 'vue-router'

const alertStore = useAlertStore()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const route = useRoute()

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

const logout = async () => {
  await api.$post('/logout', {}) // 서버 로그아웃 API 호출

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
  userStore.$reset() // userStore가 Pinia store라면 $reset() 으로 초기화 가
  alertStore.show('로그아웃되었습니다.', 'success')
  // 5. 메인 페이지로 이동
  router.push('/')
}

const handleScroll = () => {
  const header = document.querySelector('.header-body')
  if (window.scrollY > 50) {
    header.classList.add('shrink')
  } else {
    header.classList.remove('shrink')
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // console.log('currentPath', currentPath.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
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
  transition:
    height 0.3s ease,
    box-shadow 0.3s ease; /* transition을 height와 box-shadow에만 적용 */
}

.header-body.shrink {
  height: 70px; /* 스크롤 시 헤더 크기 줄어듬 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 스크롤 시 그림자 효과 */
}

/* dropdown-toggle 클래스의 화살표 제거 */
#notificationDropdown::after {
  display: none !important;
}
</style>
