import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useAlertStore } from '../stores/alertStore'

import MainPage from '../views/MainPage.vue'
import TestPage from '../views/TestPage.vue'
import UserProjectSpecPage from '../views/project/UserProjectSpecPage.vue'
import CompanyProjectSpecPage from '../views/project/CompanyProjectSpecPage.vue'
import ProjectPostPage from '../views/mypage/common/ProjectPostPage.vue'
import ProjectListPage from '../views/mypage/common/ProjectListPage.vue'

import BoardListPage from '../views/community/BoardListPage.vue'
import BoardDetailPage from '../views/community/BoardDetailPage.vue'
import QnaDetailPage from '../views/community/QnaDetailPage.vue'
import BoardResisterPage from '../views/community/BoardResisterPage.vue'
import QnaResisterPage from '../views/community/QnaResisterPage.vue'

import LoginPage from '../views/login&signup/LoginPage.vue'
import FindAccountPage from '../views/login&signup/FindAccountPage.vue'
import FindIdResultPage from '../views/login&signup/FindIdResultPage.vue'
import ResetPasswordPage from '../views/login&signup/ResetPasswordPage.vue'
import SignUpPage from '../views/login&signup/SignUpPage.vue'

import AffiliationListPage from '../views/company/AffiliationListPage.vue'
import QnaListPage from '../views/community/QnaListPage.vue'
import MyPageLayout from '../views/mypage/MyPageLayout.vue'
import InformationEditPage from '../views/mypage/common/InformationEditPage.vue'
import ResumeListPage from '../views/mypage/personal/ResumeListPage.vue'
import AffiliatedMembersPage from '../views/mypage/company/AffiliatedMembersPage.vue'
import AffiliationApplicantListPage from '../views/mypage/company/AffiliationApplicantListPage.vue'
import AffiliationProjectListPage from '../views/mypage/company/AffiliationProjectListPage.vue'

// import ResumeFormPage from '../views/mypage/personal/ResumeFormPage.vue'
import ResumeFormPage from '../views/mypage/personal/ResumeFormPage_P.vue'
import WithdrawPage from '../views/mypage/common/WithdrawPage.vue'
import AffiliatedJobApplicationsPage from '../views/mypage/personal/AffiliatedJobApplicationsPage.vue'
import AffiliatedScrapPage from '../views/mypage/personal/AffiliatedScrapPage.vue'
import AffiliatedInfoPage from '../views/mypage/personal/AffiliatedInfoPage.vue'
import AffiliationEditPage from '../views/mypage/company/AffiliationEditPage.vue'

import AppliedProjectsPage from '../views/mypage/personal/AppliedProjectsPage.vue'
import ProjectScrapPage from '../views/mypage/personal/ProjectScrapPage.vue'
import ScheduleCalendarPage from '../views/mypage/common/ScheduleCalendarPage.vue'
import NoticeListPage from '../views/notice/NoticeListPage.vue'
import NoticeDetailPage from '../views/notice/NoticeDetailPage.vue'
import ProjectInqueryPage from '../views/mypage/personal/ProjectInqueryPage.vue'

const routes = [
  {
    path: '/',
    component: MainPage,
    name: 'Main',
  },

  {
    path: '/test',
    component: TestPage,
    name: 'TestConfirm',
  },

  {
    path: '/project/spec/user/:project_sq',
    component: UserProjectSpecPage,
    name: 'UserProjectSpec',
  },

  {
    path: '/project/spec/company/:project_sq',
    component: CompanyProjectSpecPage,
    name: 'CompanyProjectSpec',
  },

  {
    path: '/board',
    component: BoardListPage,
    name: 'BoardListPage',
  },

  {
    path: '/board/register',
    component: BoardResisterPage,
    name: 'BoardResisterPage',
  },

  {
    path: '/board/:board_sq',
    component: BoardDetailPage,
    name: 'BoardDetailPage',
    props: true,
  },

  {
    path: '/qna',
    component: QnaListPage,
    name: 'QnaListPage',
  },

  {
    path: '/qna/register',
    component: QnaResisterPage,
    name: 'QnaResisterPage',
  },

  {
    path: '/qna/:board_sq',
    component: QnaDetailPage,
    name: 'QnaDetailPage',
    props: true,
  },

  {
    path: '/notice',
    name: 'NoticeListPage',
    component: NoticeListPage,
  },

  {
    path: '/notice/:board_sq',
    component: NoticeDetailPage,
    name: 'NoticeDetailPage',
    props: true,
  },

  {
    path: '/login',
    component: LoginPage,
    name: 'Login',
  },

  {
    path: '/findAccount',
    component: FindAccountPage,
    name: 'FindAccount',
  },

  {
    path: '/findIdResult',
    component: FindIdResultPage,
    name: 'FindIdResult',
  },

  {
    path: '/resetPassword',
    component: ResetPasswordPage,
    name: 'ResetPassword',
  },

  {
    path: '/affiliation',
    component: AffiliationListPage,
    name: 'AffiliationListPage',
  },

  {
    path: '/signUp',
    component: SignUpPage,
    name: 'SignUp',
  },

  {
    path: '/projectListPage',
    name: 'ProjectListPage',
    component: ProjectListPage,
  },

  {
    path: '/mypage',
    component: MyPageLayout,
    children: [
      // 기본 화면 설정
      {
        path: '', // 여기! 기본 자식 경로
        name: 'MypageDefault',
        component: InformationEditPage,
      },
      //common
      {
        path: 'informationEdit',
        name: 'InformationEdit',
        component: InformationEditPage,
      },
      {
        path: 'withdraw',
        name: 'Withdraw',
        component: WithdrawPage,
      },
      {
        path: 'calendar',
        name: 'ScheduleCalendar',
        component: ScheduleCalendarPage,
      },
      //personal
      {
        path: 'affiliatedJobApplications',
        name: 'AffiliatedJobApplications',
        component: AffiliatedJobApplicationsPage,
      },
      {
        path: 'affiliatedScrap',
        name: 'AffiliatedScrap',
        component: AffiliatedScrapPage,
      },
      {
        path: 'affiliatedInfo',
        name: 'AffiliatedInfo',
        component: AffiliatedInfoPage,
      },
      {
        path: 'affiliatedWithdraw',
        redirect: { name: 'AffiliatedInfo' },
      },
      {
        path: 'resumeList',
        name: 'ResumeList',
        component: ResumeListPage,
      },
      {
        path: 'resumeform', //등록하기
        name: 'ResumeFormNew',
        component: ResumeFormPage,
      },
      {
        path: 'resumeform/:resumeSq', //수정하기
        name: 'ResumeFormEdit',
        component: ResumeFormPage,
      },
      {
        path: 'appliedProjects',
        name: 'appliedProjects',
        component: AppliedProjectsPage,
      },
      {
        path: 'projectScrap',
        name: 'projectScrap',
        component: ProjectScrapPage,
      },
      {
        path: 'projectInquerys',
        name: 'projectInquerys',
        component: ProjectInqueryPage,
      },
      //company
      {
        path: 'affiliationEdit',
        name: 'AffiliationEdit',
        component: AffiliationEditPage,
      },
      {
        path: 'affiliatedMembers',
        name: 'AffiliatedMembers',
        component: AffiliatedMembersPage,
      },
      {
        path: 'affiliationApplicantList',
        name: 'AffiliationApplicantList',
        component: AffiliationApplicantListPage,
      },
      {
        path: 'affiliationProjectList',
        name: 'AffiliationProjectList',
        component: AffiliationProjectListPage,
      },
      {
        path: 'projectPostPage/:project_sq',
        name: 'ProjectPostPageWithId',
        component: ProjectPostPage,
      },

      {
        path: 'projectPostPage',
        name: 'ProjectPostPage',
        component: ProjectPostPage,
      },
    ],
  },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
  // [추가] 페이지 이동 시 스크롤 제어 로직
  scrollBehavior(to, from, savedPosition) {
    // 1. 브라우저 뒤로가기/앞으로가기 시 이전 스크롤 위치 복원
    if (savedPosition) {
      return savedPosition
    } else {
      // 2. 새로운 페이지 이동 시 무조건 최상단(y=0)으로 이동
      return { top: 0 }
    }
  },
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const alertStore = useAlertStore()

  const publicPages = [
    'Login',
    'SignUp',
    'FindAccount',
    'FindIdResult',
    'ResetPassword',
  ]
  const authRequiredPages = [
    'MyPageDefault',
    'InformationEdit',
    'Withdraw',
    'QnaResisterPage',
    'BoardResisterPage',
    'ScheduleCalendar',
    'AffiliatedInfo',
    /* ... 로그인 필요 페이지들 */
  ]

  const userRolePages = ['UserProjectSpec']

  const companyRolePages = [
    'CompanyProjectSpec',
    'AffiliationProjectList',
    'AffiliatedMembers',
    'ProjectPostPage',
    'ProjectPostPageWithId',
  ]

  // 로그인 중인데 로그인/회원가입 페이지 접근 시 메인으로 리다이렉트
  if (userStore.isLoggedIn && publicPages.includes(to.name)) {
    return next({ name: 'Main' })
  }

  // 로그인 안 된 상태에서 로그인 필요 페이지 접근 시 로그인 페이지로 리다이렉트
  if (!userStore.isLoggedIn && authRequiredPages.includes(to.name)) {
    alertStore.show('로그인이 필요한 서비스입니다.', 'danger')
    return next({ name: 'Login' })
  }

  // PERSONAL 페이지에 COMPANY나 비로그인 유저가 접근하면 메인으로 리다이렉트
  if (
    (userStore.getUserType === 'PERSONAL' || userStore.getUserType === '') &&
    companyRolePages.includes(to.name)
  ) {
    alertStore.show('기업 회원만 접근 가능합니다.', 'danger')
    return next({ name: 'Main' })
  }

  // COMPANY 페이지에 PERSONAL이나 비로그인 유저가 접근하면 메인으로 리다이렉트
  if (
    (userStore.getUserType === 'COMPANY' || userStore.getUserType === '') &&
    userRolePages.includes(to.name)
  ) {
    alertStore.show('개인 회원만 접근 가능합니다.', 'danger')
    return next({ name: 'Main' })
  }

  // 비로그인 유저가 권한 필요한 페이지 접근 시
  if (
    !userStore.isLoggedIn &&
    (userRolePages.includes(to.name) || companyRolePages.includes(to.name))
  ) {
    alertStore.show('로그인이 필요한 서비스입니다.', 'danger')
    return next({ name: 'Login' })
  }

  next()
})

export default router
