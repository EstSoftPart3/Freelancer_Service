# 마이페이지 범위 지도 (Vue → Next.js)

> 검증 세션 — 깊은 동작 대조 전 **구조/범위만** 펼침. 추측 없이 실제 파일/라우터를 직접 읽어 작성.
> 작성 기준일: 2026-06-26 · 대상: `frontend/vue_js/src/fo/.../mypage`, `frontend/nextjs/app/mypage`
> 백엔드 인증 경계는 백로그(`docs/backlog-backend-auth.md`)로 분리 — 본 문서 범위 밖.

## 1. 권한구분 기준

분류는 **사이드바 노출 위치**(어느 메뉴에 뜨는가)를 1차 기준으로 함.

- **공통** = 개인/기업 사이드바 양쪽에 노출 (대부분 내부에서 userType로 분기)
- **개인 전용** = 개인 사이드바에만 노출
- **기업 전용** = 기업 사이드바에만 노출 (또는 Vue 라우터 가드의 `companyRolePages`)

## 2. 마이페이지 기능 대응표

| 마이페이지 기능 | 권한구분 | Vue 경로 | Next 경로 | 매칭 |
|---|---|---|---|---|
| 마이페이지 레이아웃 | 공통 | `views/mypage/MyPageLayout.vue` | `app/mypage/layout.tsx` | ✅ |
| 사이드바 | 공통 | `components/mypage/MyPageSideBar.vue` | `components/mypage/MyPageSidebar.tsx` | ✅ |
| 기본 화면(=정보수정) `/mypage` | 공통 | `views/mypage/common/InformationEditPage.vue` | `app/mypage/page.tsx` (→ information-edit 리다이렉트) | ✅ |
| 회원 정보 수정 | 공통 | `views/mypage/common/InformationEditPage.vue` | `app/mypage/information-edit/page.tsx` + `common/InformationEditClient.tsx` | ✅ |
| 회원 탈퇴 | 공통 | `views/mypage/common/WithdrawPage.vue` | `app/mypage/withdraw/page.tsx` + `common/WithdrawClient.tsx` | ✅ |
| 일정 캘린더 | 공통 | `views/mypage/common/ScheduleCalendarPage.vue` | `app/mypage/calendar/page.tsx` + `common/CalendarClient.tsx` | ✅ |
| 지원 내역(프로젝트) | 공통 | `views/mypage/personal/AppliedProjectsPage.vue` | `app/mypage/applied-projects/page.tsx` + `personal/AppliedProjectsClient.tsx` | ✅ |
| 스크랩 내역(프로젝트) | 공통 | `views/mypage/personal/ProjectScrapPage.vue` | `app/mypage/project-scrap/page.tsx` + `personal/ProjectScrapClient.tsx` | ✅ |
| 이력서 목록 | 개인 전용 | `views/mypage/personal/ResumeListPage.vue` | `app/mypage/resume/page.tsx` + `personal/ResumeListClient.tsx` | ✅ |
| 이력서 등록 | 개인 전용 | `views/mypage/personal/ResumeFormPage_P.vue` | `app/mypage/resume/new/page.tsx` + `personal/ResumeFormClient.tsx` | ✅ |
| 이력서 수정 | 개인 전용 | `views/mypage/personal/ResumeFormPage_P.vue` (`resumeform/:resumeSq`) | `app/mypage/resume/[resumeSq]/page.tsx` + `personal/ResumeFormClient.tsx` | ✅ |
| 소속 정보 | 개인 전용 | `views/mypage/personal/AffiliatedInfoPage.vue` | `app/mypage/affiliated-info/page.tsx` + `personal/AffiliatedInfoClient.tsx` | ✅ |
| 소속 지원 내역 | 개인 전용 | `views/mypage/personal/AffiliatedJobApplicationsPage.vue` | `app/mypage/affiliated-job-applications/page.tsx` + `personal/AffiliatedJobApplicationsClient.tsx` | ✅ |
| 소속 스크랩 내역 | 개인 전용 | `views/mypage/personal/AffiliatedScrapPage.vue` | `app/mypage/affiliated-scrap/page.tsx` + `personal/AffiliatedScrapClient.tsx` | ✅ |
| 소속 정보 수정 | 기업 전용 | `views/mypage/company/AffiliationEditPage.vue` | `app/mypage/affiliation-edit/page.tsx` + `company/AffiliationEditClient.tsx` | ✅ |
| 소속 인원 목록 | 기업 전용 | `views/mypage/company/AffiliatedMembersPage.vue` | `app/mypage/affiliated-members/page.tsx` + `company/AffiliatedMembersClient.tsx` | ✅ |
| 지원자 현황 | 기업 전용 | `views/mypage/company/AffiliationApplicantListPage.vue` | `app/mypage/affiliation-applicants/page.tsx` + `company/AffiliationApplicantsClient.tsx` | ✅ |
| 프로젝트 공고 목록 | 기업 전용 | `views/mypage/company/AffiliationProjectListPage.vue` | `app/mypage/affiliation-projects/page.tsx` + `company/AffiliationProjectsClient.tsx` | ✅ |
| 프로젝트 등록/수정 | 기업 전용¹ | `views/mypage/common/ProjectPostPage.vue` (`projectPostPage`, `projectPostPage/:project_sq`) | `app/mypage/project-post/page.tsx`, `project-post/[project_sq]/page.tsx` + `company/ProjectPostClient.tsx` | ✅ |

¹ Vue에서 파일은 `common/` 폴더에 있으나, 라우터 가드의 `companyRolePages`(`ProjectPostPage`, `ProjectPostPageWithId`)로 **기업 전용**으로 통제됨. Next는 `company/ProjectPostClient.tsx`로 분리. 사이드바 어느 쪽에도 노출되지 않음(프로젝트 상세 등에서 진입).

## 3. 권한 분기(userType 체크)가 결정되는 위치 — ★ 다음 깊은 검증의 핵심

- **Vue (중앙집중형):** `frontend/vue_js/src/fo/router/index.js`의 `router.beforeEach` 가드(286–357행)가 `userStore.getUserType`을 `companyRolePages`/`userRolePages`와 대조해 **라우트 진입 자체를 차단/리다이렉트**. + 사이드바 `MyPageSideBar.vue:4`의 `v-if="userStore.userType === 'COMPANY'"`로 메뉴 렌더 분기.
- **Next (분산형, 라우트 가드 없음):** `middleware.ts` 없음, `app/mypage/layout.tsx`에도 가드 없음. userType 분기는 (a) `components/mypage/MyPageSidebar.tsx:92`의 `getUserType() === 'COMPANY'`로 **메뉴 렌더만** 분기, (b) 각 `*Client.tsx` 내부의 `getUserType()`로 **API 엔드포인트/UI만** 분기. **라우트 접근 권한 자체는 통제하지 않음.**
- userType 값 출처: Next `stores/userStore.ts:23` `getUserType()` = `userTypeCd 301→'PERSONAL'`, `302→'COMPANY'`, 그외 `null`. Vue는 `userStore.getUserType`(문자열 `'PERSONAL'`/`'COMPANY'`/`''`).

> ⚠️ 구조적 차이(깊은 검증 1순위): Vue는 **라우터 가드로 진입 차단**, Next는 **가드 없음 → 메뉴만 숨김**. 개인 회원이 `/mypage/affiliation-edit` 등 기업 전용 URL을 직접 입력하면 Vue는 메인 리다이렉트, Next는 진입 가능 여부를 클라이언트별로 따로 확인해야 함. (단, Vue 가드의 `companyRolePages`도 `AffiliationEdit`/`AffiliationApplicantList`를 누락 → 양쪽 모두 가드 일관성 점검 필요.)

## 4. 한쪽에만 있는 항목 (❓)

| 항목 | 상태 | 비고 |
|---|---|---|
| `views/mypage/personal/ResumeFormPage.vue` (구버전 이력서 폼) | ❓Vue에만 | 라우터에서 주석 처리(33행), `_P` 버전으로 대체. Next 대응 없음(의도적) |
| `views/mypage/personal/ResumeCompanyModal.vue` 등 personal 모달류 일부 | ❓확인 필요 | 모달 단위 대응은 본 범위(페이지 단위) 밖 — 깊은 검증 시 컴포넌트 단위로 대조 |
| `views/mypage/common/testPage.vue` | ❓Vue에만 | 라우터 미등록 테스트 파일, 의도적 제외 |
| `views/mypage/common/ProjectListPage.vue` | (mypage 밖으로 이동) | Next `app/projects/page.tsx`로 이전 — 마이페이지 메뉴 아님 |
| Next 라우트 가드(middleware/layout) | ❓Next에 없음 | Vue `beforeEach` 대응물 부재 — 3절 참고, 깊은 검증 대상 |

> 페이지(라우트) 단위로는 Vue↔Next **전부 ✅ 매칭**. 미매칭은 (a) Vue의 미사용/테스트 파일, (b) Next의 라우트 권한 가드 부재 두 가지뿐.
