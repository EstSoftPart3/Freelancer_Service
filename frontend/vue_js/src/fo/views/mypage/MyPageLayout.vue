<template>
  <section>
    <!-- ✅ 현재 라우트에 따라 다르게 보여지는 헤더 -->
    <CommonPageHeader
      :title="headerInfo.title"
      :strongText="headerInfo.strongText"
      :breadcrumbs="headerInfo.breadcrumbs"
    />

    <div class="container pt-3 pb-2">
      <!-- Off-canvas menu button -->
      <button
        class="btn btn-primary d-lg-none mb-3"
        @click="isOffcanvasOpen = true"
      >
        마이페이지 메뉴
      </button>

      <div class="row pt-2">
        <!-- Sidebar for desktop -->
        <div class="col-lg-3 order-2 order-lg-1 mt-4 mt-lg-0 d-none d-lg-block">
          <MyPageSideBar />
        </div>

        <!-- Main content -->
        <div class="col-lg-9 order-1 order-lg-2">
          <router-view />
        </div>
      </div>
    </div>

    <!-- Off-canvas Sidebar for mobile -->
    <div
      class="offcanvas-sidebar"
      :class="{ open: isOffcanvasOpen }"
      @click.self="isOffcanvasOpen = false"
    >
      <div class="offcanvas-content">
        <button class="btn-close" @click="isOffcanvasOpen = false">X</button>
        <MyPageSideBar @navigate="isOffcanvasOpen = false" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import MyPageSideBar from '@/fo/components/mypage/MyPageSideBar.vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'

const isOffcanvasOpen = ref(false)
const route = useRoute()

const headerInfo = computed(() => {
  switch (route.name) {
    case 'MypageDefault':
    case 'InformationEdit':
      return {
        title: '회원',
        strongText: '정보 수정',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '회원정보수정' },
        ],
      }
    case 'Withdraw':
      return {
        title: '회원',
        strongText: '탈퇴',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '회원탈퇴' },
        ],
      }
    case 'AffiliatedJobApplications':
      return {
        title: '기업',
        strongText: '지원자 관리',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '지원자 관리' },
        ],
      }
    case 'AffiliatedScrap':
      return {
        title: '기업',
        strongText: '스크랩',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '기업 스크랩' },
        ],
      }
    case 'ResumeList':
      return {
        title: '이력서',
        strongText: '목록',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '이력서 목록' },
        ],
      }
    case 'ResumeFormNew':
      return {
        title: '이력서',
        strongText: '등록하기',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '이력서 등록' },
        ],
      }
    case 'ResumeFormEdit':
      return {
        title: '이력서',
        strongText: '수정하기',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '이력서 수정' },
        ],
      }
    case 'appliedProjects':
      return {
        title: '프로젝트',
        strongText: '지원 현황',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '지원 현황' },
        ],
      }
    case 'projectScrap':
      return {
        title: '프로젝트',
        strongText: '스크랩',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '프로젝트 스크랩' },
        ],
      }
    case 'AffiliationEdit':
      return {
        title: '기업',
        strongText: '소속 정보 수정',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '소속 정보 수정' },
        ],
      }
    case 'AffiliatedMembers':
      return {
        title: '기업',
        strongText: '소속 인원 목록',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '소속 인원 목록' },
        ],
      }
    case 'AffiliationApplicantList':
      return {
        title: '기업',
        strongText: '지원자 목록',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '지원자 목록' },
        ],
      }
    case 'AffiliationProjectList':
      return {
        title: '기업',
        strongText: '프로젝트 관리',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '프로젝트 관리' },
        ],
      }
    case 'ProjectPostPage':
      return {
        title: '프로젝트',
        strongText: '등록',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '프로젝트 등록' },
        ],
      }
    case 'ProjectPostPageWithId':
      return {
        title: '프로젝트',
        strongText: '수정',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '프로젝트 수정' },
        ],
      }
    case 'SocialEdit':
      return {
        title: '계정',
        strongText: '관리',
        breadcrumbs: [
          { text: '마이페이지', link: '/mypage' },
          { text: '계정 관리' },
        ],
      }
    default:
      return {
        title: '마이페이지',
        strongText: '',
        breadcrumbs: [{ text: '마이페이지' }],
      }
  }
})
</script>

<style scoped>
.offcanvas-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  display: none;
}

.offcanvas-sidebar.open {
  display: block;
}

.offcanvas-content {
  position: fixed;
  top: 0;
  left: -300px; /* Start off-screen */
  width: 300px;
  height: 100%;
  background-color: white;
  padding: 20px;
  transition: left 0.3s ease-in-out;
  z-index: 1041;
  overflow-y: auto;
}

.offcanvas-sidebar.open .offcanvas-content {
  left: 0; /* Slide in */
}

.btn-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
}
</style>
