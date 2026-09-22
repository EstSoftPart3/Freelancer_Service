# 마이그레이션 대응 지도 (Vue → Next.js)

> 검증 세션에서 코드/디렉토리 구조를 직접 읽어 작성. 추측이 아닌 실제 파일 기준.
> 작성 기준일: 2026-06-26

## 1. 코드베이스 루트

| 코드베이스 | 루트 경로 | 스택 | 라우팅 방식 |
|---|---|---|---|
| 원본 (Vue) | `frontend/vue_js/src/fo/` | Vue 2/3 + vue-router | `views/` + `router/index.js` |
| 마이그레이션 대상 (Next.js) | `frontend/nextjs/` | Next.js (App Router) + React/TS | `app/` 파일시스템 라우팅 |
| (참고) `frontend/react_js/` | — | Vite + React + TanStack Router | **마이그레이션 대상 아님.** "Shadcn Admin Dashboard" 서드파티 템플릿. UI/컴포넌트 참고용으로 추정 |

- Vue 앱 본체는 `src/fo/`(front office) 아래에 있음. `views/`가 페이지, `components/`가 부품.
- Next.js는 `app/`에 페이지(`page.tsx`), 실제 로직은 대부분 `components/.../*Client.tsx`로 분리(서버/클라이언트 컴포넌트 패턴).
- Vue 라우트는 `frontend/vue_js/src/fo/router/index.js` 기준.

## 2. 기능별 대응 지도

매칭 상태: ✅매칭됨 / ❓React(Next)에 대응 파일 안 보임 / ❓Vue에만 존재

### 메인 / 테스트

| 기능 그룹 | 세부 기능 | Vue 파일 경로 | React(Next) 파일 경로 | 매칭 상태 |
|---|---|---|---|---|
| 메인 | 메인 페이지 (`/`) | `src/fo/views/MainPage.vue` | `app/page.tsx` | ✅ |
| 테스트 | 테스트 페이지 (`/test`) | `src/fo/views/TestPage.vue` | — | ❓Vue에만 존재 (테스트용, 의도적 제외로 추정) |
| 테스트 | mypage 테스트 | `src/fo/views/mypage/common/testPage.vue` | — | ❓Vue에만 존재 (라우터 미등록) |

### 프로젝트

| 기능 그룹 | 세부 기능 | Vue 파일 경로 | React(Next) 파일 경로 | 매칭 상태 |
|---|---|---|---|---|
| 프로젝트 | 개인용 프로젝트 상세 (`/project/spec/user/:project_sq`) | `src/fo/views/project/UserProjectSpecPage.vue` | `app/projects/user/[project_sq]/page.tsx` | ✅ |
| 프로젝트 | 기업용 프로젝트 상세 (`/project/spec/company/:project_sq`) | `src/fo/views/project/CompanyProjectSpecPage.vue` | `app/projects/company/[project_sq]/page.tsx` | ✅ |
| 프로젝트 | 프로젝트 목록 (`/projectListPage`) | `src/fo/views/mypage/common/ProjectListPage.vue` | `app/projects/page.tsx` | ✅ (경로 `/projectListPage`→`/projects`로 변경) |

### 커뮤니티 (게시판/Q&A)

| 기능 그룹 | 세부 기능 | Vue 파일 경로 | React(Next) 파일 경로 | 매칭 상태 |
|---|---|---|---|---|
| 게시판 | 목록 (`/board`) | `src/fo/views/community/BoardListPage.vue` | `app/board/page.tsx` | ✅ |
| 게시판 | 등록 (`/board/register`) | `src/fo/views/community/BoardResisterPage.vue` | `app/board/register/page.tsx` | ✅ |
| 게시판 | 상세 (`/board/:board_sq`) | `src/fo/views/community/BoardDetailPage.vue` | `app/board/[board_sq]/page.tsx` | ✅ |
| Q&A | 목록 (`/qna`) | `src/fo/views/community/QnaListPage.vue` | `app/qna/page.tsx` | ✅ |
| Q&A | 등록 (`/qna/register`) | `src/fo/views/community/QnaResisterPage.vue` | `app/qna/register/page.tsx` | ✅ |
| Q&A | 상세 (`/qna/:board_sq`) | `src/fo/views/community/QnaDetailPage.vue` | `app/qna/[board_sq]/page.tsx` | ✅ |

### 공지사항

| 기능 그룹 | 세부 기능 | Vue 파일 경로 | React(Next) 파일 경로 | 매칭 상태 |
|---|---|---|---|---|
| 공지 | 목록 (`/notice`) | `src/fo/views/notice/NoticeListPage.vue` | `app/notice/page.tsx` | ✅ |
| 공지 | 상세 (`/notice/:board_sq`) | `src/fo/views/notice/NoticeDetailPage.vue` | `app/notice/[board_sq]/page.tsx` | ✅ |

### 로그인 / 회원가입 / 계정찾기

| 기능 그룹 | 세부 기능 | Vue 파일 경로 | React(Next) 파일 경로 | 매칭 상태 |
|---|---|---|---|---|
| 인증 | 로그인 (`/login`) | `src/fo/views/login&signup/LoginPage.vue` | `app/login/page.tsx` | ✅ |
| 인증 | 회원가입 (`/signUp`) | `src/fo/views/login&signup/SignUpPage.vue` | `app/sign-up/page.tsx` | ✅ |
| 인증 | 계정찾기 (`/findAccount`) | `src/fo/views/login&signup/FindAccountPage.vue` | `app/find-account/page.tsx` | ✅ |
| 인증 | 아이디찾기 결과 (`/findIdResult`) | `src/fo/views/login&signup/FindIdResultPage.vue` | `app/find-account/result/page.tsx` | ✅ |
| 인증 | 비밀번호 재설정 (`/resetPassword`) | `src/fo/views/login&signup/ResetPasswordPage.vue` | `app/reset-password/page.tsx` | ✅ |

### 소속(기업) — 공개 목록

| 기능 그룹 | 세부 기능 | Vue 파일 경로 | React(Next) 파일 경로 | 매칭 상태 |
|---|---|---|---|---|
| 소속 | 소속(기업) 목록 (`/affiliation`) | `src/fo/views/company/AffiliationListPage.vue` | **(없음)** | ❓React에 대응 파일 안 보임 |

> ⚠️ **누락 의심.** Next.js 헤더(`components/common/CommonHeader.tsx`)는 `/affiliation`("소속")로 링크하고 `app/robots.ts`도 `/affiliation`을 노출하지만, `app/affiliation/page.tsx`가 존재하지 않음 → 클릭 시 404. mypage 하위의 `affiliation-*`(편집/지원자/프로젝트)와는 별개의 **공개 소속 목록** 페이지임.

### 마이페이지 — 공통

| 기능 그룹 | 세부 기능 | Vue 파일 경로 | React(Next) 파일 경로 | 매칭 상태 |
|---|---|---|---|---|
| 마이/레이아웃 | 마이페이지 레이아웃 (`/mypage`) | `src/fo/views/mypage/MyPageLayout.vue` | `app/mypage/layout.tsx` | ✅ |
| 마이/공통 | 기본 화면 (`/mypage` = 정보수정) | `src/fo/views/mypage/common/InformationEditPage.vue` | `app/mypage/page.tsx` | ✅ |
| 마이/공통 | 정보 수정 (`/mypage/informationEdit`) | `src/fo/views/mypage/common/InformationEditPage.vue` | `app/mypage/information-edit/page.tsx` | ✅ |
| 마이/공통 | 회원 탈퇴 (`/mypage/withdraw`) | `src/fo/views/mypage/common/WithdrawPage.vue` | `app/mypage/withdraw/page.tsx` | ✅ |
| 마이/공통 | 일정 캘린더 (`/mypage/calendar`) | `src/fo/views/mypage/common/ScheduleCalendarPage.vue` | `app/mypage/calendar/page.tsx` | ✅ |
| 마이/공통 | 프로젝트 등록 (`/mypage/projectPostPage`) | `src/fo/views/mypage/common/ProjectPostPage.vue` | `app/mypage/project-post/page.tsx` | ✅ |
| 마이/공통 | 프로젝트 수정 (`/mypage/projectPostPage/:project_sq`) | `src/fo/views/mypage/common/ProjectPostPage.vue` | `app/mypage/project-post/[project_sq]/page.tsx` | ✅ |

### 마이페이지 — 개인(PERSONAL)

| 기능 그룹 | 세부 기능 | Vue 파일 경로 | React(Next) 파일 경로 | 매칭 상태 |
|---|---|---|---|---|
| 마이/개인 | 이력서 목록 (`/mypage/resumeList`) | `src/fo/views/mypage/personal/ResumeListPage.vue` | `app/mypage/resume/page.tsx` | ✅ |
| 마이/개인 | 이력서 등록 (`/mypage/resumeform`) | `src/fo/views/mypage/personal/ResumeFormPage_P.vue` | `app/mypage/resume/new/page.tsx` | ✅ |
| 마이/개인 | 이력서 수정 (`/mypage/resumeform/:resumeSq`) | `src/fo/views/mypage/personal/ResumeFormPage_P.vue` | `app/mypage/resume/[resumeSq]/page.tsx` | ✅ |
| 마이/개인 | (구버전 이력서 폼, 라우터 주석처리) | `src/fo/views/mypage/personal/ResumeFormPage.vue` | — | ❓Vue에만 존재 (미사용, `_P` 버전으로 대체됨) |
| 마이/개인 | 지원한 프로젝트 (`/mypage/appliedProjects`) | `src/fo/views/mypage/personal/AppliedProjectsPage.vue` | `app/mypage/applied-projects/page.tsx` | ✅ |
| 마이/개인 | 프로젝트 스크랩 (`/mypage/projectScrap`) | `src/fo/views/mypage/personal/ProjectScrapPage.vue` | `app/mypage/project-scrap/page.tsx` | ✅ |
| 마이/개인 | 소속 지원 현황 (`/mypage/affiliatedJobApplications`) | `src/fo/views/mypage/personal/AffiliatedJobApplicationsPage.vue` | `app/mypage/affiliated-job-applications/page.tsx` | ✅ |
| 마이/개인 | 소속 스크랩 (`/mypage/affiliatedScrap`) | `src/fo/views/mypage/personal/AffiliatedScrapPage.vue` | `app/mypage/affiliated-scrap/page.tsx` | ✅ |
| 마이/개인 | 소속 정보 (`/mypage/affiliatedInfo`) | `src/fo/views/mypage/personal/AffiliatedInfoPage.vue` | `app/mypage/affiliated-info/page.tsx` | ✅ |

### 마이페이지 — 기업(COMPANY)

| 기능 그룹 | 세부 기능 | Vue 파일 경로 | React(Next) 파일 경로 | 매칭 상태 |
|---|---|---|---|---|
| 마이/기업 | 소속 정보 편집 (`/mypage/affiliationEdit`) | `src/fo/views/mypage/company/AffiliationEditPage.vue` | `app/mypage/affiliation-edit/page.tsx` | ✅ |
| 마이/기업 | 소속 구성원 (`/mypage/affiliatedMembers`) | `src/fo/views/mypage/company/AffiliatedMembersPage.vue` | `app/mypage/affiliated-members/page.tsx` | ✅ |
| 마이/기업 | 소속 지원자 목록 (`/mypage/affiliationApplicantList`) | `src/fo/views/mypage/company/AffiliationApplicantListPage.vue` | `app/mypage/affiliation-applicants/page.tsx` | ✅ |
| 마이/기업 | 소속 프로젝트 목록 (`/mypage/affiliationProjectList`) | `src/fo/views/mypage/company/AffiliationProjectListPage.vue` | `app/mypage/affiliation-projects/page.tsx` | ✅ |

## 3. 요약

- **총 Vue 라우트 페이지 대비 매칭:** 대부분 ✅. 경로 네이밍이 camelCase→kebab-case로 정리됨(`/findAccount`→`/find-account`, `/projectListPage`→`/projects` 등).
- **누락 의심 (1건):** `/affiliation` 소속(기업) 공개 목록 — `AffiliationListPage.vue`에 대응하는 `app/affiliation/page.tsx` 없음. 헤더/robots에 링크는 살아있어 **404 발생 가능**. → 우선 검증 필요.
- **Vue에만 존재(의도적/미사용 추정):** `TestPage.vue`, `mypage/common/testPage.vue`(테스트), `ResumeFormPage.vue`(구버전, `_P`로 대체).
- **참고:** `frontend/react_js/`는 별도 Shadcn 어드민 템플릿이며 본 마이그레이션 범위 밖.

## 4. 다음 검증 단계(권장)

1. `/affiliation` 누락 확정 — 의도적 제외인지, 단순 누락인지 확인.
2. ✅로 표시된 페이지들의 **내용 단위** 검증(폼 필드, API 호출, 권한 가드 등) — 본 지도는 파일/라우트 수준까지만 확인함.
3. Vue `router/index.js`의 `beforeEach` 권한 가드(publicPages/authRequired/userRole/companyRole)가 Next.js(middleware 또는 레이아웃 가드)로 이전됐는지 별도 확인.
