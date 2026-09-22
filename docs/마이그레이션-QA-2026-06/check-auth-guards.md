# 인증/권한 가드 마이그레이션 검증 (Vue → Next.js)

> → 백엔드 후속은 [backlog-backend-auth.md](backlog-backend-auth.md) 참조

> 검증 대상: `frontend/vue_js/src/fo/router/index.js` 의 `router.beforeEach` 전역 가드
> → `frontend/nextjs/` 의 보호 로직(미들웨어/레이아웃/페이지/클라이언트)
> 검증일 기준 Next.js 버전: **16.2.6**

---

## 0. 핵심 요약 (먼저 읽기)

- Next.js 쪽 보호 로직은 **`frontend/nextjs/proxy.ts`** 한 곳에 모여 있다.
  `middleware.ts`는 없지만, **Next.js 16에서 `middleware.ts` → `proxy.ts`(export `proxy`)로 정식 개명**되었으므로
  이 파일은 실제로 엣지에서 실행되는 **활성 미들웨어가 맞다.** (참고: [Next.js — proxy.js 파일 규칙](https://nextjs.org/docs/app/api-reference/file-conventions/proxy))
  → 즉 "미들웨어가 통째로 사라진" 상황은 **아니다.**
- 레이아웃(`app/layout.tsx`, `app/mypage/layout.tsx`)·페이지 서버 컴포넌트에는 가드가 **없다.** 모든 라우트 보호는 `proxy.ts` 단독.
- `proxy.ts`는 `/mypage/*` 전체를 "비로그인 → /login"으로 **포괄 보호**해서, Vue의 부분 리스트보다 오히려 **더 강하게** 막는 부분도 있다.
- 그러나 **공개 접두사(`/board`, `/qna`, `/projects`) 하위의 보호 라우트가 전부 public으로 새어나가는** 구조적 구멍이 있다. 이게 이번 검증의 핵심 보안 이슈다.

---

## 1. Vue `beforeEach` 가드에서 추출한 보호 규칙

`index.js`의 분기(라인 286–357) 기준 원본 규칙:

| # | 규칙 | 대상(라우트 name) | 미충족 시 동작 |
|---|------|------------------|----------------|
| A | 로그인 상태에서 공개(인증)페이지 접근 차단 | `publicPages` = Login, SignUp, FindAccount, FindIdResult, ResetPassword | → `Main`으로 리다이렉트 (alert 없음) |
| B | 로그인 필요 | `authRequiredPages` = MyPageDefault*, InformationEdit, Withdraw, **QnaResisterPage**, **BoardResisterPage**, ScheduleCalendar, AffiliatedInfo, (`/* ... */` 일부 생략) | alert "로그인이 필요한 서비스입니다." → `Login` |
| C | 개인(PERSONAL) 전용 | `userRolePages` = UserProjectSpec | (COMPANY 또는 비로그인) alert "개인 회원만 접근 가능합니다." → `Main` |
| D | 기업(COMPANY) 전용 | `companyRolePages` = CompanyProjectSpec, AffiliationProjectList, AffiliatedMembers, ProjectPostPage, ProjectPostPageWithId | (PERSONAL 또는 비로그인) alert "기업 회원만 접근 가능합니다." → `Main` |
| E | 권한 페이지에 비로그인 접근 | C+D 라우트 전체 | alert "로그인이 필요한 서비스입니다." → `Login` |

> *Vue 자체 버그: `authRequiredPages`에 `'MyPageDefault'`(대문자 P)로 적혀 있으나 실제 라우트 name은 `'MypageDefault'`(라인 172). 이름 불일치로 **Vue에서는 마이페이지 기본 진입(`/mypage`)이 실제로는 보호되지 않았다.** Next에서는 의도대로 보호된다(아래 B-1 참고).

판정 기준값:
- 로그인 여부: Vue `userStore.isLoggedIn` / Next `proxy.ts`는 `accessToken` 쿠키 존재 여부.
- 역할: Vue `userStore.getUserType` ('PERSONAL'|'COMPANY'|'') / Next `proxy.ts`는 `userType` 쿠키 ('PERSONAL'|'COMPANY').

---

## 2. 규칙별 이전 판정 표

| Vue 보호 규칙 | 대상 라우트 (Vue → Next 경로) | 상태 | Next.js에서 어디서 처리 | 비고 |
|---|---|---|---|---|
| **A** 로그인 시 인증페이지 차단 | Login/SignUp/FindAccount/FindIdResult/ResetPassword → `/login`,`/sign-up`,`/find-account`,`/find-account/result`,`/reset-password` | ❌ 누락 | 없음 (proxy/페이지/클라이언트 어디에도 없음) | 보안 구멍 아님(UX). 로그인 상태로 `/login` 재방문해도 막지 않음 |
| **B** 로그인 필요 — InformationEdit | `/mypage/information-edit` | ✅ 이전됨 | `proxy.ts:43` (`!isPublic && !token` → `/login`) | `/mypage/*`는 공개목록에 없어 전부 포괄 보호 |
| **B** 로그인 필요 — Withdraw | `/mypage/withdraw` | ✅ 이전됨 | `proxy.ts:43` | |
| **B** 로그인 필요 — ScheduleCalendar | `/mypage/calendar` | ✅ 이전됨 | `proxy.ts:43` | |
| **B** 로그인 필요 — AffiliatedInfo | `/mypage/affiliated-info` | ✅ 이전됨(+강화) | `proxy.ts:43` + `47` (PERSONAL_ONLY) | Vue는 로그인만 요구했으나 Next는 개인전용까지 강제(⚠️ 강화) |
| **B** 로그인 필요 — **QnaResisterPage** | `/qna/register` | ❌ **누락(보안 구멍)** | 없음 — `proxy.ts:5,10` `/qna`가 PUBLIC_PATHS라 `/qna/register`가 public 판정 | 페이지/폼에 클라이언트 가드도 없음(`BoardPostForm.tsx`) |
| **B** 로그인 필요 — **BoardResisterPage** | `/board/register` | ❌ **누락(보안 구멍)** | 없음 — `/board`가 PUBLIC_PATHS라 `/board/register`도 public | 동일하게 무가드 |
| **B** 로그인 필요 — MyPageDefault | `/mypage` (→ `/mypage/information-edit`) | ⚠️ 다르게(사실상 강화) | `proxy.ts:43` + `app/mypage/page.tsx`의 `redirect` | Vue는 name 오타로 미보호였음. Next는 정상 보호 |
| **C** 개인 전용 — UserProjectSpec | `/projects/user/:sq` | ❌ **누락(보안 구멍)** | 없음 — `/projects`가 PUBLIC_PATHS, 역할 검사 대상 아님 | 비로그인·기업도 접근 가능. `ProjectSpec.tsx`는 스크랩/지원 액션만 로그인 체크 |
| **D** 기업 전용 — CompanyProjectSpec | `/projects/company/:sq` | ❌ **누락(보안 구멍)** | 없음 — `/projects` public, 역할 검사 없음 | 비로그인·개인도 접근 가능 |
| **D** 기업 전용 — AffiliationProjectList | `/mypage/affiliation-projects` | ✅ 이전됨 | `proxy.ts:51` (COMPANY_ONLY) + `:43` 로그인 | |
| **D** 기업 전용 — AffiliatedMembers | `/mypage/affiliated-members` | ✅ 이전됨 | `proxy.ts:51` (COMPANY_ONLY) | |
| **D** 기업 전용 — ProjectPostPage | `/mypage/project-post` | ✅ 이전됨 | `proxy.ts:51` (COMPANY_ONLY) | |
| **D** 기업 전용 — ProjectPostPageWithId | `/mypage/project-post/:sq` | ✅ 이전됨 | `proxy.ts:51` (`startsWith('/mypage/project-post')`) | |
| **E** 권한 페이지 비로그인 차단 | `/mypage/*` 권한 라우트 | ✅ 이전됨 | `proxy.ts:43` (token 없으면 우선 `/login`) | |
| **E** 권한 페이지 비로그인 차단 | `/projects/user|company/:sq` | ❌ **누락(보안 구멍)** | 없음 — public이라 비로그인도 통과 | C·D와 동일 원인 |

### 참고: Vue엔 없던 Next의 추가(강화) 가드 — ⚠️ 다르게 구현
`proxy.ts`의 `PERSONAL_ONLY`(`:17`)는 Vue엔 역할 제한이 없던 다음 라우트까지 개인전용으로 막는다 — 회귀가 아니라 **강화**이므로 보안상 문제 없음(단, 의도된 정책인지 확인 권장):
`/mypage/affiliated-scrap`, `/mypage/affiliated-job-applications`, `/mypage/resume`, `/mypage/applied-projects`, `/mypage/project-scrap`.

---

## 3. ❌ 누락 = 보안 구멍 (우선순위별)

> 공통 원인: `proxy.ts`의 `PUBLIC_PATHS`가 **접두사 매칭**(`pathname === p || startsWith(p + '/')`, `proxy.ts:41`)이라
> `/board`,`/qna`,`/projects`를 public으로 열면 그 **하위 보호 라우트까지 전부 public으로 새어나간다.**

### 🔴 P1 — 비로그인 글쓰기 페이지 노출 (B 규칙 위반)
- **라우트:** `/board/register`, `/qna/register`
- **현상:** 비로그인 사용자가 등록 폼 페이지에 그대로 진입 가능. `BoardPostForm.tsx`에도 로그인 가드 없음(제출 시 백엔드가 막아주길 기대하는 상태).
- **영향:** Vue에서 "로그인 필요"로 막던 기능이 프런트 가드 기준 완전 개방. 인증되지 않은 작성 시도/스팸 노출.
- **수정안:** `PUBLIC_PATHS`에서 글 목록만 공개로 두고 `/board/register`·`/qna/register`는 보호. 접두사 매칭 대신 **공개 경로를 정확 매칭**하거나, register 경로를 명시적으로 제외.
  ```ts
  // 예: 등록 경로는 공개에서 제외
  const isPublic =
    pathname === '/' ||
    (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
      && !pathname.endsWith('/register'))
  ```

### 🔴 P1 — 프로젝트 상세의 역할/로그인 가드 소멸 (C·D·E 규칙 위반)
- **라우트:** `/projects/user/:sq` (Vue=개인전용), `/projects/company/:sq` (Vue=기업전용)
- **현상:** `/projects`가 public 접두사 → 두 상세 페이지 모두 **비로그인·역할무관 전면 개방.** 페이지 서버 컴포넌트/`ProjectSpec.tsx` 어디에도 접근 가드 없음(액션 단위 `isLoggedIn()`만 존재).
- **영향:** Vue의 개인/기업 분리 정책과 "비로그인 → 로그인" 규칙이 사라짐.
- **수정안:** `proxy.ts`에 프로젝트 상세용 분기 추가. 예) `/projects/user/*` → `userType==='PERSONAL'` 강제, `/projects/company/*` → `COMPANY` 강제, 그리고 비로그인은 `/login`. (단, 상세 조회를 의도적으로 공개로 바꾼 정책 변경인지 PO 확인 필요 — 정책 변경이면 ⚠️로 재분류.)

### 🟡 P3 — 로그인 상태에서 인증 페이지 재진입 미차단 (A 규칙 위반)
- **라우트:** `/login`, `/sign-up`, `/find-account`, `/reset-password`
- **현상:** 로그인 상태로도 접근 가능(Vue는 Main으로 보냄).
- **영향:** 보안 구멍 아님. UX/혼동 수준.
- **수정안(선택):** `proxy.ts`에 `if (token && PUBLIC_AUTH_PATHS.includes(pathname)) redirect('/')` 추가.

---

## 4. 추가로 확인된 약점 (가드 동작 자체)

- `proxy.ts`는 로그인 판정을 **`accessToken` 쿠키의 단순 존재 여부**로만 한다(서명/만료 검증 없음). `userType` 쿠키도 클라이언트에서 세팅되는 일반 쿠키(`lib/cookies.ts`, `LoginForm.tsx:78`)라 위조 가능 → **역할 우회 가능.**
  - 단, 이는 Vue도 클라이언트 스토어 기반이라 동일한 한계. **최종 권한 판정은 반드시 백엔드에서** 이뤄져야 함(프런트 가드는 UX 차원).
- 따라서 위 P1 구멍들도 "백엔드 API가 막아주는지"를 별도로 확인할 것. 프런트 가드 회귀는 사실이며, 백엔드 검증이 없으면 실제 데이터 노출로 이어진다.

---

## 5. 결론

- **이전됨 ✅:** `/mypage/*` 로그인 필요(B 다수) 및 기업전용(D 다수)은 `proxy.ts`로 정상 이전, 일부는 강화됨.
- **누락 ❌(보안 구멍):**
  1. `/board/register`, `/qna/register` — 로그인 가드 소멸 (P1)
  2. `/projects/user/:sq`, `/projects/company/:sq` — 로그인+역할 가드 소멸 (P1)
  3. `/login` 등 인증페이지 로그인 시 차단 (P3, UX)
- **근본 원인 1개:** `PUBLIC_PATHS` 접두사 매칭이 공개 목록 하위의 보호 라우트를 함께 개방. → 공개 경로를 정확 매칭하거나 보호 하위 경로를 명시 제외하면 P1 2건이 동시 해결됨.

---

## 6. 백엔드 방어선 검증 (P1 라우트 → 실제 데이터 노출 판정)

> 검증 방식: 프런트 가드가 뚫린 P1 라우트가 **백엔드에서도 막히지 않아 실제 데이터 노출/무단 쓰기로 이어지는지**를 실제 코드로 판정.
> 추측 없음 — 모든 근거에 `파일:라인` 표기.

### 6.0 백엔드 스택·구조 (실파일 확인)
- **루트:** `backend/` — Spring Boot, **Java**, MyBatis(`mapper/**/*.xml`) + 일부 JPA. (`backend/src/main/resources/application.yml:64`, `DemoApplication.java`)
- **활성 프로파일:** `dev` (`application.yml:1-3` `spring.profiles.active: dev`) → 활성 시큐리티 설정은 **`SecurityConfigDev`** 한 개. `SecurityConfigProd`는 비활성.
- **API 접두사:** `server.servlet.context-path: /api` (`application.yml:74`). 프런트 `lib/api.ts:9` baseURL `/api` → 동일 접두사로 매핑.

### 6.1 인증 레이어는 두 층 — 둘 다 확인함
**(a) 전역 인증 레이어 (2겹):**
1. **`JwtAuthenticationFilter`** (`JwtAuthenticationFilter.java:64-110`) — `UsernamePasswordAuthenticationFilter` 앞에 등록(`SecurityConfigDev.java:63`). 핵심 함정: **`EXCLUDE_URLS`를 `uri::startsWith`로 매칭**(`:73`). 즉 접두사가 걸리면 토큰 없이 통과시키고, 토큰이 있을 때만 인증정보를 세팅(`:74-85`). 비-제외 경로만 토큰 없으면 401(`:92-95`).
   - `EXCLUDE_URLS`에 **`/api/projects`(:48), `/api/board`(:34), `/api/qna`(:38)** 가 그대로 포함 → 그 하위 전부 인증 면제.
2. **`SecurityConfigDev.authorizeHttpRequests`** (`SecurityConfigDev.java:51-62`) — `/admin/**`=ROLE_ADMIN, `/me`=인증, **그 외 전부 `.anyRequest().permitAll()`(:62)**. 즉 admin 외 역할 검사 없음.

**(b) 핸들러 레벨:** 메서드 보안 어노테이션(`@PreAuthorize`/`@Secured`/`@RolesAllowed`)은 **백엔드 전체에서 0건**(grep 결과 `SecurityConfigDev.java:58`의 URL 규칙뿐). 개별 컨트롤러도 로그인/`userType` 강제 분기 없음(아래).

→ 결론: 이 3개 접두사 하위는 **(a)도 (b)도 막지 않는다.** "전역이 막아주는데 핸들러만 비었다"가 아니라, **두 층 모두 비어 있음.**

### 6.2 판정 표

| 엔드포인트 (백엔드) | 호출처(프론트) | 전역 인증 적용 | 핸들러 권한체크 | userType 분리 | 실제 노출 위험 |
|---|---|---|---|---|---|
| `GET /api/projects/{sq}/details` | `/projects/user/:sq` — `ProjectSpec.tsx:57` | ❌ 면제 (`JwtAuthenticationFilter.java:48` `/api/projects` startsWith + `SecurityConfigDev.java:62` permitAll) | ❌ 없음 (`ProjectController.java:112-121` `authentication==null` 명시 허용) | ❌ 없음 — 단일 메서드, 토큰 null이어도 전체 반환 (`ProjectService.java:326-366`) | **상** |
| `GET /api/projects/{sq}/details` | `/projects/company/:sq` — `ProjectSpec.tsx:57` (동일 컴포넌트) | ❌ 면제 (위와 동일) | ❌ 없음 (위와 동일) | ❌ 없음 — user/company 라우트가 **같은 엔드포인트**로 수렴, 분기 없음 | **상** |
| `POST /api/board` (등록) | `/board/register` — `BoardPostForm.tsx:87-88` (`boardCategory='board'`) | ❌ 면제 (`JwtAuthenticationFilter.java:34` `/api/board` startsWith + permitAll) | ❌ 없음 (`BoardController.java:89-108` `@AuthenticationPrincipal Long userSq` → 비로그인 시 `null`, 그대로 `setUserSq(null)` 후 insert) | N/A (로그인 자체를 강제 안 함) | **중** (무단 쓰기/스팸; 읽기 노출 아님) |
| `POST /api/qna` (등록) | `/qna/register` — `BoardPostForm.tsx:87-88` (`boardCategory='qna'`) | ❌ 면제 (`JwtAuthenticationFilter.java:38` `/api/qna` startsWith + permitAll) | ❌ 없음 (`QnaController.java:54-73` board와 동일 패턴) | N/A | **중** (무단 쓰기/스팸) |

### 6.3 핵심 판정 (프로젝트 상세 = 검증 목표)
- **개인전용/기업전용 분리는 백엔드에서 강제되지 않는다.** 프런트의 `/projects/user/:sq`·`/projects/company/:sq`는 둘 다 동일한 `GET /api/projects/{sq}/details` 하나를 호출(`ProjectSpec.tsx:57`)하고, 서비스 `fetchProject`는 `token != null`일 때만 스크랩/지원/`userRole` **부가정보**를 채울 뿐 — 토큰이 null이어도 `findBySq`로 조회한 **프로젝트 상세 전체를 그대로 반환**한다(`ProjectService.java:327-366`). userType로 데이터를 가리거나 거르는 분기는 **존재하지 않음**.
- 따라서 P1(프로젝트 상세)는 프런트 가드 회귀가 **백엔드 미방어와 겹쳐 실제 데이터 노출로 확정**된다. (비로그인·타역할 모두 상세 열람 가능)
- 단, 조회수는 무조건 증가(`ProjectService.java:327` `updateViewCnt` — 토큰 검사 전)하므로 비인증 조회로 카운트 오염도 동반됨.

### 6.4 board/qna 등록 보충
- 데이터 "노출"보다는 **무단 쓰기**가 본질. 비인증 `POST /api/board|qna`가 필터·시큐리티를 모두 통과(`userSq=null`)하므로 인증 없는 글 작성이 가능. 실제 insert 성공 여부는 DB의 `user_sq` NOT NULL 제약에 의존하나, **인증 방어선 자체는 부재**. → 위험 **중**(P1 분류 유지, 단 노출 아닌 쓰기 측면).

### 6.5 주의: prod 프로파일은 다르게 동작(현재 비활성)
- `SecurityConfigProd.java:35-37`은 `/api/login`,`/api/refresh-token`만 permitAll, **`.anyRequest().authenticated()`**. 이 경우 `JwtAuthenticationFilter`가 제외경로를 익명 통과시켜도 시큐리티 인가 단계에서 401이 되어 위 노출은 막힌다 — **그러나 그러면 공개 게시판/프로젝트 목록 조회까지 막혀** 정상 동작 불가. 즉 prod 설정은 현 라우팅과 정합하지 않으며, **실제 활성은 `dev`**이므로 본 판정은 dev 기준이 유효하다.

### 6.6 결론
- **프로젝트 상세 P1(개인/기업) → 백엔드 방어선 없음, 실제 노출 확정 (위험: 상).** userType 분리는 백엔드에서 전혀 강제되지 않음.
- **board/qna 등록 P1 → 백엔드 인증 면제, 무단 쓰기 가능 (위험: 중).**
- 프런트 `proxy.ts` 수정만으로는 우회 가능(쿠키 위조·직접 API 호출). **근본 수정은 백엔드 `JwtAuthenticationFilter.EXCLUDE_URLS`에서 `/api/projects`·`/api/board`·`/api/qna` 접두사 면제를 GET 목록/상세 등 공개 대상으로 좁히고, 등록(POST)·역할 구분이 필요한 상세에 인증/`userType` 검사를 추가**하는 것이다.
