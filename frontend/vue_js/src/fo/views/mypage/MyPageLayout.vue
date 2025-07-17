<template>
  <section>
    <!-- ✅ 현재 라우트에 따라 다르게 보여지는 헤더 -->
    <CommonPageHeader
      :title="headerInfo.title"
      :strongText="headerInfo.strongText"
      :breadcrumbs="headerInfo.breadcrumbs"
    />

    <div class="container pt-3 pb-2">
      <div class="row pt-2">
        <!-- Sidebar -->
        <div class="col-lg-3 order-2 order-lg-1 mt-4 mt-lg-0">
          <MyPageSideBar />
        </div>

        <!-- Main content -->
        <div class="col-lg-9 order-1 order-lg-2">
          <router-view />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MyPageSideBar from '@/fo/components/mypage/MyPageSideBar.vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'

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
    default:
      return {
        title: '마이페이지',
        strongText: '',
        breadcrumbs: [{ text: '마이페이지' }],
      }
  }
})
</script>
