# 마이그레이션 QA 수동 검증 결과 메모

> 진행 기준일: 2026-06-29 · 원본 체크리스트: [qa-migration-checklist.md](qa-migration-checklist.md)
> 사용자가 브라우저에서 직접 테스트한 결과를 섹션별로 기록한다.
> 표기: ✅정상확인 · 🔁문제재현됨(예상대로) · ⚠️예상과다름(새발견) · ⏭️건너뜀/막힘 · ⬜미진행

> ## ⚠️ 테스트 실행 기준 (필독)
> 체크리스트/check-*.md는 **`wizardly-hamilton` worktree(완성본) ↔ Vue 원본** 비교로 작성됨.
> 따라서 **반드시 worktree에서 서버를 띄워야** 화면이 체크리스트와 일치한다.
> - 서버 실행 위치: `.claude/worktrees/wizardly-hamilton-e89f7b/{backend, frontend/nextjs}`
> - 메인 체크아웃(NextJs 브랜치)은 **보일러플레이트 메인 + 카드형 프로젝트목록 + affiliation 없음**(미완성) — 여기서 띄우면 안 됨.
> - 근거: migration-map.md가 메인페이지를 ✅(MainPage.vue→app/page.tsx)로 기록하는데, 그건 worktree에만 해당. worktree의 `app/page.tsx`만 실제 `MainPage` import, ProjectListClient에 목록/지도형(isMapView+Kakao) 존재.
> - 이 worktree 변경(프론트 ~38파일)은 **미커밋 상태** — 커밋/푸시 전이라 메인 브랜치엔 반영 안 됨.

---

> 진행 순서는 [qa-test-order.md](qa-test-order.md)의 STEP 0~7을 따른다.

## STEP 0 — 회원가입 (개인 + 기업)

### 0-A 개인 회원가입 (1차 테스트 — 2026-06-29)
- ✅ **(1-4)** 아이디 중복확인 정상
- ✅ **(1-14)** 약관 동의 정상
- ⚠️ **(1-5)** 이메일 인증 — 인증 성공해도 "인증번호를 입력하세요" 문구 잔존 + 가입 진행 불가 → **코드 수정함**
- 🆕 추가 요청(개선): 전 input 실시간(키 입력마다) 검증, 이름 규칙 부재, 휴대폰 길이 제한 → **코드 수정함**

#### 수정 내역 (worktree `components/auth/PersonalSignUpForm.tsx`)
1. **이메일 인증 문구 잔존 버그** — `handleVerifyCode` 성공 시 `setVerifyError('')`로 이전 에러 제거. 인증번호 input은 인증 완료 후 disabled, 확인 버튼은 "인증 완료" 표기+disabled.
2. **가입 진행 불가 (근본 원인)** — `handleSubmit`이 `validateXxx()` 호출 직후 갱신 전(stale) `valid` 플래그를 읽어 항상 막힘. 각 검사가 **boolean을 반환**하도록 바꿔 반환값으로 판정.
3. **실시간 검증** — 모든 필드 `onBlur`→`onChange`(키 입력마다). 충족 시 라벨 체크표시, 미달 시 사유 노출.
4. **이름 규칙 추가** — `/^[가-힣a-zA-Z]{2,20}$/` (숫자·특수문자·공백 불가).
5. **휴대폰 길이 제한** — `maxLength={11}` + 숫자 외 자동 제거 + `inputMode="numeric"`, 검증 `/^01\d{8,9}$/`.
6. 부수: 렌더 중 컴포넌트 생성(FieldLabel/ErrorMsg) → 모듈 스코프로 이동(빌드 에러 예방), 미사용 import 제거. ESLint exit 0.

→ ✅ **재테스트 성공 (2026-06-29).** 실시간 검증·인증 문구·가입 제출 모두 정상.

### 0-B 기업 회원가입 — 선제 수정 (코드 읽고 동일 버그 확인)
CompanySignUpForm에 개인 폼과 **동일한 버그 3종**(stale-state 제출 막힘 / 인증 문구 잔존 / 실시간 검증 없음) 확인 → 테스트 전 같은 수정 선제 적용:
- handleSubmit 반환값 판정, handleVerifyCode 성공 시 문구 제거 + 인증 완료 후 disabled
- 전 필드 실시간 검증, 담당자 이름 규칙 `/^[가-힣a-zA-Z]{2,20}$/`(1-13 해소), 휴대폰 maxLength 11+숫자필터
- FieldLabel/ErrorMsg 모듈 스코프, `req` 헬퍼 제거. ESLint exit 0.
- ⚠️ 발견: 현재 기업 폼엔 **대표자명·사업자번호·개업일 입력 자체가 없음** → 체크리스트 1-9("3종 필수 강제")는 이 폼 버전과 불일치.

→ ✅ **재테스트 성공 (2026-06-29).**

### 1-9 종결 — 버그 아님(설계 의도)
대표자명·사업자번호·개업일은 **가입 인입을 쉽게 하려고 회원가입 단계에서 의도적으로 제외**. 추후 프로젝트 등록 등 기업 정보가 필요할 때 **마이페이지 기업 인증 모달**에서 인증/등록하도록 설계됨. → 체크리스트 1-9는 **무효 처리**(기획 의도 확인 완료, 수정 불필요).

### ✅ STEP 0 완료 — 개인·기업 계정 확보, 검증 폼 개선 완료. STEP 1로 진행.

---

## STEP 1 — 로그인 / 세션  (테스트 2026-06-29)

- ✅ **1-1** 로그인 성공 + 환영 알림 + 홈 이동 정상
- ✅ **1-6** 비로그인 `/mypage` 직접 진입 → `/login` 리다이렉트 정상
- ✅ **1-10** 새로고침 깜빡임 **없음** (worktree 개선됨, 회귀 아님)
- ✅ **1-11** 마지막 로그인 유형 기억(`localStorage.savedLoginType`) — 의도된 정상 UX로 종결
- ✅ **1-12** 소셜 버튼 카카오/네이버/구글/애플 정식 표기 — 체크리스트 지적은 이 버전에서 **이미 수정됨**, 종결
- 🔁 **1-8 (P1) 재현** — 로그인 상태에서 `/login`·`/sign-up` 차단 안 됨. proxy.ts에 `token && publicAuthPath → /` 규칙 없음. **수정 후보**
- ❓ **1-2 동작 해명** — "로그인 유지"는 세션 여부가 아니라 **쿠키 수명만** 제어: 체크=30일 / 미체크=1일. 둘 다 영구 쿠키라 탭 닫아도 유지됨. → 미체크를 **세션 쿠키**로 바꿀지 기획 결정 대기.

### STEP 1 수정 적용 (2026-06-29) — 재테스트 대기
1. **1-2 세션 쿠키화** — `cookies.ts` setCookie `days: number|null`(null=세션 쿠키) 지원, `LoginForm`에서 미체크 시 `null`로 설정(accessToken/refreshToken/userType). → 미체크=브라우저 종료 시 로그아웃, 체크=30일.
2. **1-8 인증경로 재진입 차단** — `proxy.ts`에 `AUTH_ONLY_PATHS`(login/sign-up/find-account/reset-password) 추가, 토큰 있으면 `/`로 리다이렉트. board/projects 등 일반 공개 페이지는 영향 없음.

※ 비고: `LoginForm.tsx:40` setState-in-effect는 기존 코드 경고(이번 변경 무관, dev 정상).

✅ **재테스트 전부 확인 (2026-06-29). STEP 1 종결.**

---

## STEP 2 — 계정복구  (테스트 2026-06-29)

- ✅ **2-C** 비번 재설정 → 새 비번으로 로그인 성공
- ⚠️ **2-A/2-B 인증 문구 잔존** — 인증 완료돼도 "인증 미완료" 문구 안 사라짐 → **수정함**(FindAccountForm 양 폼)
- ⚠️ **2-C 실시간 검증 부재** — 회원가입처럼 키 입력마다 검증으로 변경 요청 → **수정함**(ResetPasswordForm)
- ℹ️ **2-B 이름 틀려도 인증번호 발송 + 제출 시점에 "정보 없음"** — 이메일 인증은 이름과 독립이라 발송은 정상 동작, 이름 불일치는 서버 조회(`/reset-password/verify`) 시점에 걸림(설계상 정상). 문구 잔존만 버그였고 수정됨.

#### 수정 내역
- `FindAccountForm.tsx` (아이디찾기 + 비번재설정 STEP-A 양 폼): 인증 성공 시 `setVerifyError('')`, 인증번호 input·확인 버튼 완료 후 disabled + "인증 완료" 표기.
- `ResetPasswordForm.tsx` (STEP-B 새 비번): `onBlur`→`onChange` 실시간 검증, 비번 변경 시 확인란 재검사(stale 비교 방지), FieldLabel 모듈 스코프로 이동. ESLint clean.

→ ✅ 인증 문구·실시간 검증 재테스트 OK.

#### 2차 수정 (2026-06-29)
- ⚠️ **2-A (P1) 가입일/구분 누락 재현** → **수정함**. 백엔드 `FindIdResponseDTO`는 `userType`(공통코드 이름)·`userCreatedAtDtm`(ISO)를 이미 내려줌. 결과 페이지(`find-account/result/page.tsx`)가 `regDt`만 읽던 것 → `userCreatedAtDtm`(날짜 slice)+`userType`(구분 행) 표시로 교정.
- ⚠️ **2-A (P2) 야후 도메인 누락 재현** → **수정함**. `EMAIL_DOMAINS`에 `yahoo.com` 추가(FindAccountForm·Personal/Company 회원가입 3폼 일관 적용).
- ℹ️ **이름 틀려도 인증코드 발송** = 의도된 보안 설계(이메일 소유 확인은 신원과 독립, 일치는 `/reset-password/verify` 시점 검사). 유지.

→ ✅ **가입일/구분/야후 재테스트 확인 (2026-06-29). STEP 2 종결.**

---

## ▶ 다음 세션 재개 지점

- **완료:** STEP 0(회원가입), STEP 1(로그인/세션), STEP 2(계정복구), STEP 3(이력서 + 소속 정보/지원현황/스크랩), **STEP 4(프로젝트 상세/지원/합격·불합격·인터뷰요청/본인 지원현황·취소·인터뷰확정)** — 전부 종결.
- **다음:** **STEP 5 — 마이페이지 기업.** (원본대조부터: 소속 정보 수정/소속 인원 목록/소속 지원자 현황/기업 인증/프로젝트 공고 관리 등. 관련 컴포넌트는 components/mypage/company/*. 일부는 STEP 3~4에서 이미 교차 검증됨 → stale 여부 확인 후 검증 모드 가능.)
- **미결(배치):** 소속 스크랩 회사명 클릭 모달(P2), Phase1a 지원 P2 3건(확인모달·COMPANY차단·status판정).
- **서버:** 반드시 `wizardly-hamilton` worktree에서 기동(완성본). Redis(localhost:6379, pw 1234) 시스템 상주.
- **반복 수정 패턴(인증 4폼에 적용 완료):** ①제출 시 stale `valid` 플래그 대신 검사 **반환값**으로 판정 ②이메일 인증 성공 시 `setVerifyError('')`+완료 후 disabled ③`onBlur`→`onChange` 실시간 검증(값 인자 전달) ④이름 `/^[가-힣a-zA-Z]{2,20}$/`·휴대폰 maxLength11+숫자필터.

---

## STEP 3 — 마이페이지 — 개인

### 3-1 이력서 등록/수정/복사/삭제  (테스트 2026-06-30)

> **대조 결과 반전:** 체크리스트(06-29)는 수정 전 코드 기준이었고, worktree엔 이미 수정본이 미커밋으로 들어와 있었음. ★P0 3겹(경로/Content-Type/필드명)이 모두 해소된 상태였음을 코드 대조로 확인:
> - 경로: `POST /mypage/resume` · `PUT|GET /mypage/resume/{sq}` — 백엔드 컨트롤러와 일치
> - Content-Type: `FormData`(dto Blob=application/json + profileImages/attachments) — multipart 일치
> - 필드명/주소: `ResumeRequestDTO`와 1:1, 주소 `address{}` 중첩 일치
> - 부속 모달 6종(Education/Career/Training/ProjectHistory/Certificate/SkillSelect) 및 ResumeDetailModal 모두 구현됨(미커밋)

- ✅ **★P0 등록/수정** — 라이브 등록·수정 성공, DB 반영 확인(multipart 계약 정상 입증)
- ✅ **P1 기본정보 자동기입**(prefillFromMember) · **목록 제목→상세모달** · **복사 파일 포함/제외 선택** 전부 동작
- ✅ **대표 설정 / 삭제** 정상

#### 이번 세션 수정(라이브 검증 중 발견 → 즉시 수정, 재검증 OK)
- **A1 날짜 연도 6~7자리 입력 오류** — 4개 모달(학력/회사/교육/프로젝트)의 모든 date·month 입력에 `onKeyDown` 수동입력 차단(생년월일 필드와 동일 방식) + `max`(`9999-12`/`9999-12-31`) 상한.
- **A2 교육 이력 월 단위화** — `TrainingModal` date→month(시작월~종료월). `ResumeFormClient`에 저장 시 `toFirstDay`(yyyy-MM→yyyy-MM-01)·로드 시 `toMonth` 변환 추가.
- **A3 스킬 아이콘 누락** — `skillIconMap.ts`에 MariaDB·Windows·MacOS·Linux(OS)·PC·노트북(Device, lucide 하드웨어 아이콘) 추가. DB 실제 스킬명 조회 후 URL 200 검증.
- **B 수정페이지 "Jest worker child process exceptions"** — `.next` 캐시 삭제 + 프론트 재기동으로 Turbopack 워커 크래시 해소(동적 라우트만 깨지고 등록은 정상이라 캐시 손상으로 판단, 코드 무관). 재검증 OK.

→ ✅ **3-1 이력서 영역 종결.** 다음 = 3-2 소속(개인) 영역.

### 3-2 소속(개인) — 진행 중 (테스트 2026-06-30)

> ④소속 정보·⑤소속 지원현황은 **개인 지원→기업 합격** 선행 필요 → 그 선행 경로(STEP 5/7 영역)를 의존성 때문에 앞당겨 검증. 선행 경로는 이미 구현돼 있어 검증 위주.

**Phase 0 — 상세보기 모달 UI**
- ✅ `ResumeDetailModal` `DialogContent`를 flex 세로 레이아웃으로 변경 → 제목+X 상단 고정, 본문만 스크롤.

**토스트(sonner)**
- ✅ 자동 해제는 정상(2s)이었음(버그 아님, 호버 시 정지 특성). `closeButton` 추가 + `--toast-close-button-*` 변수로 **우측 상단 모서리** 배치(`ui/sonner.tsx`).

**Phase 1a — 개인→소속 지원** (`/affiliation`, AffiliationListPage)
- ✅ 목록/정렬5종/시·군구 캐스케이드/검색4종/스크랩/지원모달/이력서 드롭다운 선택/지원(`POST /affiliation/apply`) 전부 동작. 요청 바디 Vue와 동일 계약.
- ⚠️ P2 갭(비블로커, 배치 보강): ①신청 전 확인모달 없음 ②COMPANY 차단 클라체크 없음 ③성공판정 2xx 가정(vs Vue status==='OK').

**Phase 1b — 기업 합격 처리** (AffiliationApplicantsClient)
- ✅ 목록/필터(전체·열람·미열람 카운트)/검색/페이징/합격·불합격(`PUT /mypage/applications/apply/{sq}` 502/503, 확인모달) 동작.
- ✅ **P1 수정: 이름 클릭 상세모달 배선.** Vue는 열람처리 후 `AffiliationRequestDetailModal`을 여는데 Next는 배선 누락이었음(모달 컴포넌트는 존재) → `openApplicant`가 모달 오픈하도록 연결. 계약 검증: `GET /mypage/applications/{sq}` → `ApplyResponse{apply,affiliation}`, 하위필드(resumeSq/resumeTtl/greeting, companyNm/ceoNm/openYear/address/greeting/tags) 전부 존재.

**ResumeDetailModal 에러 처리**
- ✅ 삭제된 이력서(백엔드 `selectResumeBasic`이 `resume_is_deleted_yn='N'` 필터 → 400 "유효하지 않은 이력서입니다.") 조회 시 무한 "불러오는 중" 멈춤 → **에러 토스트 + 모달 자동 닫기**로 변경(onClose는 ref로 참조해 재조회 루프 방지). 버그 아님(Vue 동일 백엔드), 프론트 처리만 개선.

**Phase 2 — ④⑤ 검증 (2026-06-30, 합격 데이터 생성 후)**
- ✅ **④ 소속 정보**: 기업정보 표시 + 탈퇴. 탈퇴 후 소속 플래그 즉시 갱신(`useUserStore.setState({isAffiliated:false, affiliatedCompanySq:undefined})`)이 이미 반영돼 있어 P1(clearUser 미갱신) 해소 확인.
- ✅ **⑤ 소속 지원현황**: 필터/검색/상태배지(합격502 등)/지원취소/회사명 클릭 상세모달 전부 정상.

**소속 스크랩 (AffiliatedScrapClient) — 대조 완료, 검증 대기**
- ✅ 계약/기능 일치: `GET /mypage/applications/scraps`{companies,totalElements}, 검색(전체·회사명·태그·소개), 삭제(`POST /affiliation/{sq}/scrap` 토글+확인), 모집중/마감 배지·직원수·개업일·태그 표시, 페이징 — Vue와 일치.
- ⚠️ **P2 갭**: Vue는 회사명 클릭 시 `AffiliationRecruit`(소속 신청/정보) 모달을 여는데, Next는 회사명이 **비클릭 span**(모달 없음). Next엔 이 모달이 AffiliationListPage 인라인에만 있어 재사용 컴포넌트 부재 → 배선하려면 모달 추출 필요(스코프 있음). 핵심 기능(목록/검색/삭제)은 정상이라 비블로커.
- → ✅ **검증 통과(목록/검색/삭제).** 회사명클릭 P2 갭은 사용자 결정 **(B) 로그 보류**(충실도 배치에서 처리).

### ✅ STEP 3 종결 — 3-1 이력서 + 3-2 소속(정보/지원현황/스크랩) 전부 검증 완료. STEP 4로 진행.

---

## STEP 4 — 프로젝트 — 지원 / 합격·불합격 / 인터뷰

▶ **현재 구현 상태 확인 완료 (2026-06-30) — 체크리스트 stale, ★P0 3건 전부 이미 구현됨.** 검증 모드로 진행.

| 체크리스트 P0(미구현이라던) | 실제 구현 |
|---|---|
| "지원하기" 미구현(toast 스텁) | `POST /projects/applications/{sq}` — `ResumeSelectDialog`(개인 이력서 선택), `AffiliationApplyDialog`(기업 소속원+대표이력서) + 중복체크 `/projects/applications/{sq}/check` |
| 회사 합격/불합격 미구현 | `ApplyStatusModal`(`updateStatus` → `PATCH /projects/applications/{sq}`) + `AffiliationProjectsClient` 배선 |
| 인터뷰 시간 확정 미구현 | `InterviewSelectModal`(`PATCH /projects/applications/interviews/{slot}`) — 기업(ApplyStatusModal)·개인(AppliedProjectsClient) 양쪽 배선 |

**하위 단계 계획(의존성 순):**
- ✅ **4-A 프로젝트 상세 — 원본대조 완료(2026-07-01), 코드 수정 불필요.** ProjectSpec.tsx가 User/Company 두 Vue 원본을 variant로 통합 이식. 검증 결과:
  - **P1(스크랩 target) 해소·백엔드검증.** ProjectSpec.tsx:97 · ProjectListClient.tsx:372 둘 다 `target: '프로젝트'`. 백엔드 `ProjectService.toggleProjectScrap`가 `commonCodeMapper.findCommonCodeSqByName(target, SCRAP_TYPE)`로 **공통코드 한글명**을 조회 → `'프로젝트'`가 정답(`'project'`였다면 코드 미발견으로 스크랩 실패). 일치 확인.
  - **P2 부분 해소.** ①`isRecruitmentEnded`에 `T23:59:59` 부가됨(ProjectSpec.tsx:81) — 하루 일찍 마감 버그 해결. ②마감 시 disabled "지원 마감" 버튼 노출(Vue와 동일).
  - **③COMPANY_MEMBER "참여할 수 없습니다" — 도메인상 오답 확정(사용자 2026-07-01).** [[project_affiliation_domain]]: 소속=클랜, 프로젝트 공고 지원은 소속과 무관 → 소속원도 지원 가능. 게다가 상세 variant는 **보는 사람 계정타입**으로 갈려(COMPANY→/company, PERSONAL→/user) `variant==='user' && COMPANY_MEMBER` 분기는 **도달 불가(dead code)**. COMPANY_MEMBER는 variant='company'에서만 등장하는데 현재 거기선 액션버튼 0개 → **4-B에서 소속원에게 지원하기 부여(백엔드 소속원 지원 허용 여부 확인 후)**.
  - 역할 분기 일치(위 ③ 제외): 지원하기/지원완료/지원마감(base=PERSONAL·COMPANY_EXTERNAL), 스크랩(User=base, Company=EXTERNAL만), 작성자(COMPANY_AUTHOR) 수정/삭제. 개선점: 스크랩·지원에 `isLoggedIn()` 가드, 수정이동은 Vue `project.id`(원본버그) 대신 route `pid` 사용(정상).
  - ▶ 브라우저 검증: 개인/기업 버튼·스크랩·수정삭제 **사용자 확인 완료**. COMPANY_MEMBER 항목은 도메인 재정의로 4-B 이월.
- ✅ **4-B 지원하기 — 원본대조 완료(2026-07-01) + 소속원 지원 배선 수정.**
  - **개인(ResumeSelectDialog)**: Vue `ResumeSelectModal(role=PERSONAL)` 충실 이식. `POST /projects/applications/{sq}` `{resumeSq:[selected], projectApplicationTyp:'PERSONAL'}`, 제목클릭 상세미리보기, 이력서 미선택 시 차단. 일치.
  - **기업 대리지원(AffiliationApplyDialog + MemberResumeSelectDialog)**: Vue `AffiliationMemberModal`+`ResumeSelectModal(role=COMPANY)` 충실 이식. `/companies` 소속원 목록·검색, 선택 시 중복체크 `/projects/applications/{sq}/check?userSq=`, 대표이력서 없으면 차단, 확인모달→`POST ...{projectApplicationTyp:'COMPANY'}`, '이력서 변경'→`PATCH /mypage/resume/representative/{rSq}`. Vue의 조기닫힘(data-bs-dismiss)·미배선 이력서변경 등 오히려 개선.
  - **★소속원(COMPANY_MEMBER) 지원 배선(도메인 정정 반영).** [[project_affiliation_domain]]. 백엔드 `createProjectApplication`엔 역할 제한 없음(누구나 지원 가능, 본인공고 지원은 알림만 skip). `isApplied`는 COMPANY 계정의 경우 `findByProAndCom`으로 **소속 단위** 판정 → MEMBER는 EXTERNAL과 동일 취급이 맞음. **수정**: ProjectSpec.tsx `canApply = PERSONAL|COMPANY_EXTERNAL|COMPANY_MEMBER`로 확장(작성자만 제외), 지원하기/완료/마감 3버튼 `canApply` 게이트, 도달불가+오답이던 "참여할 수 없습니다" 블록 제거. `canScrap`은 Vue 원본대로 유지.
  - ✅ **라이브 검증 완료(2026-07-02, Claude in Chrome 자동화).**
    - STEP1 개인(백바울/qkdnf325→105): 모달·대표배지·A1 미리보기·단일선택 토글·POST 200·"지원 완료" 전환·새로고침 유지·DB(app147, resume131, 801/301) 전부 OK.
    - STEP2 기업 EXTERNAL(신한은행→108): 대표이력서 없는 인원 차단 토스트, B1 이력서 변경(대표 지정→목록 즉시 갱신), 2명 선택 칩+중복체크(check?userSq=90/122), 확인모달→POST 200, DB(app148·149, company17, 801/302) 전부 OK.
    - STEP3 소속원 MEMBER(estsoft/이국환→108, bizNum 동일): **지원하기 노출 확인(이번 수정의 검증)**, 수정/삭제·스크랩 미노출 정확. 소속원 전원 탈퇴상태라 빈 목록=정상 동작 확인 → 김도영(user91) 복귀 후 **전체 플로우 제출까지 성공**(이력서 변경→대표 지정→선택→확인모달→POST 200→지원 완료 전환, DB app150/resume78/company14/801/302).
  - **자동화 중 발견·수정**: ① Jest worker 크래시 근본원인 = Next16 dev가 동적 라우트 static-paths 생성 시 Windows에서 worker 크래시 → 상세 page.tsx 2곳 `export const dynamic='force-dynamic'`(사용자별 데이터라 정적 생성 부적합; Next16 문서로 유효성 확인). ② 테스트 데이터: 공고 105·108 모집마감 2026-12-31 연장(원값 105→03-07, 108→05-31), company14 김도영(user91) 소속 복귀(원값 402/2026-02-13).
  - **P3 관찰**: /projects 첫 진입 시 간헐 빈 목록(Fast Refresh 직후 1회 관찰, 재현 안 됨 — 재발 시 추적).
- ✅ **4-C 회사 지원현황(합격/불합격+인터뷰 요청) — 원본대조 + 라이브 검증 완료(2026-07-02).**
  - **원본대조(코드 수정 불필요):** Vue `AffiliationProjectListPage` + `PersonalApplyStatusModal`/`ApplyStatusModal`(기업) 2모달 구조를 Next는 `ApplyStatusModal` 단일 모달+개인/기업 내부 탭으로 통합(진입 기본 개인 탭 = Vue 동일). 계약 전부 일치: `GET .../{sq}/personal`·`GET .../{sq}/corporate/grouped`(page/size/filter/searchType/keyword, res.response+totalPages), `PATCH /projects/applications/{sq}` {status}, `GET /projects/applications/interviews/{projectSq}`→output, `PATCH /projects/applications/interviews/{slotSq}` {applicationSq}, 열람처리 `POST /mypage/resume-detail-view` {resumeSq,projectSq,applicationSq}. 필터 카운트는 양쪽 다 현재 페이지 클라 계산. **Vue 버그 미이식(개선)**: 불합격 상태 버튼이 미정의 `handleReject`를 호출하던 것 → Next는 정적 Badge. InterviewSelectModal은 2개월 달력→날짜 그룹 슬롯 리스트로 UI 단순화(계약·과거시간 차단 동일).
  - **라이브(신한은행 소유 공고 105·82):** 개인 탭 — 지원중→인터뷰 요청(app147→804), 불합격 확인모달(app151→802), 합격→인터뷰 요청→슬롯 선택(app152, PATCH interviews/1098→805+2026-07-10 10:00), 상태배지(인터뷰확정은 일시 포함), 이력서 클릭→상세모달+열람일자 갱신(재조회 시 2026-07-02 표시), 필터 탭·이름 검색(박길동→1건) 전부 OK. 기업 탭 — 회사 그룹핑+접기/펼치기, 배지(인터뷰확정 805/지원취소 806, 공고 82), **지원중 기업 지원자 액션**은 임시 데이터(app153 INSERT→검증→DELETE 원복)로 [인터뷰 요청][불합격] 노출+불합격 플로우(확인모달→PATCH 200→토스트→배지·카운트 갱신, DB 801→802) 확인. 개인↔기업 토글·검색 셀렉트 라벨 OK.
  - **수정 A4 — Select 트리거 원시값 노출(전역 P1):** Base UI(@base-ui/react) `Select.Value`는 Root에 `items`가 없으면 value 원문("all","name")을 렌더 → 값≠라벨인 8개 파일 전부 `items={searchOptions}` 추가(ApplyStatusModal·AffiliationProjectsClient·AffiliatedMembersClient·AffiliationApplicantsClient·AffiliatedJobApplicationsClient·AffiliatedScrapClient·AppliedProjectsClient(인라인 배열→SEARCH_OPTIONS 상수화)·AffiliationApplyDialog). STEP 3에서 통과한 화면 4곳도 소급 수정됨. 브라우저 재검증 "전체"/"name→이름" 표시 OK.
  - **비블로커 기록:** ①알림 경유 자동 모달 오픈(Vue: query `projectSq`+`appTyp`로 개인/기업 모달 자동 오픈) 미이식 → **STEP 6(알람)에서 배선**. ②목록 페이지 URL 쿼리 동기화(page/filter/keyword) 미이식(P3). ③Vue는 검색어 타이핑마다 재조회(watch), Next는 검색 버튼/Enter 명시 실행(P3, 개선으로 판단). ④/mypage/affiliation-projects 첫 진입 시 이펙트 중복 호출 중 1회 500 간헐 관찰(재시도 시 정상, P3 — /projects 간헐 빈 목록과 함께 추적).
  - **데이터 노트:** 공고 109(기업지원 145·146 보유)는 is_deleted='Y'라 목록 미노출(정상). 상태코드: 801지원중/802불합격/803합격/804인터뷰요청중/805인터뷰확정/806지원취소. '합격(803)' 설정 주체는 프론트에 없음(Vue 동일 — 표시·후속 액션만 존재).
- ✅ **4-D 본인 지원현황(AppliedProjectsClient) — 라이브 검증 완료(2026-07-02).**
  - ✅ **개인 계정 렌더링**: `/projects/applications`(PERSONAL 분기), "인터뷰 확정(2026-07-10 10:30)" 배지·"지원 취소됨" 배지 정확 표시.
  - ✅ **기업 계정(신한은행/company17) 화면 분기 + 지원취소 라이브**: `/projects/applications/corporate` 엔드포인트, 지원이력서 `{applicantName} / {resumeTitle}`("백바울 / 리엑트 테스트") 형식(개인은 resumeTitle만) 분기 정확. 지원중 항목 [지원취소] 버튼→확인모달("복구할 수 없습니다")→`PATCH /projects/applications/148` {status:'지원취소'} 200→"지원 취소됨" 배지 전환+지원자 수 6→5 갱신. **DB app148 801→806 반영 확인.**
  - ✅ **인터뷰 슬롯 확정 라이브(개인)**: app147을 804(인터뷰요청중)+slot 1099 해제로 임시 리셋 후 검증 → "인터뷰 요청중" 버튼 노출→클릭→`InterviewSelectModal` 오픈(`GET /projects/applications/interviews/105`). **과거 날짜(2026-03-06 09:00/09:30/10:00) 슬롯 비활성 차단 정상**, 이미 예약된 10:00(slot 1098)은 목록 제외, 미래 10:30·11:00만 선택 가능. 10:30 선택→선택완료→`PATCH /projects/applications/interviews/1099` {applicationSq} 200→배지 "인터뷰 확정 (2026-07-10 10:30)" 전환. **DB app147 805+selected_interview_dtm=2026-07-10 10:30, slot 1099='Y' 반영 확인**(리셋 전 원값과 동일 복구되어 데이터 원복 불필요).
  - **환경 노트**: 검증 중 Chrome 확장 1회 transient disconnect(재클릭으로 즉시 복구, 코드 무관).

### ✅ STEP 4 종결 — 4-A 상세 / 4-B 지원(개인·기업·소속원) / 4-C 회사 합격·불합격·인터뷰요청 / 4-D 본인 지원현황(취소·인터뷰확정) 전부 라이브 검증 완료. 다음 = STEP 5 마이페이지 기업.
- **데이터 의존성:** 4-C/4-D는 4-B 지원 선행 필요(STEP 3 소속과 동일 패턴).
- **관련 파일:** components/project/{ResumeSelectDialog, AffiliationApplyDialog, MemberResumeSelectDialog}, components/mypage/company/{ApplyStatusModal, AffiliationProjectsClient}, components/mypage/personal/AppliedProjectsClient, components/mypage/common/InterviewSelectModal. 프로젝트 상세 페이지: app/projects/{user,company}/[project_sq].

---

## STEP 5 — 마이페이지 — 기업

⬜ 미진행

---

## STEP 6 — 알람

- ✅ **원본대조 + 라이브 검증 완료(2026-07-02, estsoft/이국환 기업계정, Claude in Chrome 자동화).**
  - **원본대조(코드 수정 0건):** [CommonHeader.tsx](../frontend/nextjs/components/common/CommonHeader.tsx) ↔ [CommonHeader.vue](../frontend/vue_js/src/fo/components/common/CommonHeader.vue) 라인 단위 대조. 6개 엔드포인트(`GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/{sq}`, `DELETE /notifications/{sq}`, `PATCH /notifications`, `DELETE /notifications`)·필드명 5종(notificationSq/ContentTxt/ReadYn/TargetUrl/CreatedAtDtm)·`split('T')[0]`·수신 타이밍(마운트+로그인 watch, 폴링/SSE 없음)·벨 dot+헤더 배지(`unreadCount>0`)·미열람 강조(`==='N'`)·클릭→읽음+링크이동 병행·삭제버튼 전파차단(`preventDefault+stopPropagation`)·빈상태 문구·"전체보기" 미노출(Vue 주석/Next 부재)까지 **전부 1:1 일치**. check-alarm.md(6/26) 분석이 현재 워크트리 코드에서도 유효.
  - **라이브(네트워크 트레이스로 확증):**
    - ① 목록조회+unread-count → 배지 **28** 렌더, 벨 dot 표시, 항목·날짜 정상.
    - ② 단건삭제(불합격 알림 X 클릭): `DELETE /api/notifications/459` 200 → `GET /unread-count` 200, 배지 28→27, 항목 즉시 제거(Optimistic). **이동·PATCH 미발생 = 전파차단 정상.**
    - ③ 단건읽음(공지 항목 클릭): `PATCH /api/notifications/393` 200 → `GET /unread-count` 200, 배지 27→26, 클릭 항목만 회색·볼드해제·강조선 제거, `/notice/105` **정상 이동**(공지 상세 렌더).
    - ④ 모두읽음: `PATCH /api/notifications` 200, 배지 숫자·벨 dot 소멸(unread=0), 전 항목 읽음 스타일.
    - ⑤ 전체삭제: `DELETE /api/notifications` 200, 빈 상태(벨 아이콘 + "새로운 알림이 없습니다.") 표시.
- ⚠️ **알려진 문제 #1 라이브 재현(계획대로 기록·보류 — 백엔드 백로그, 프론트 무수정):** 알림 `notificationTargetUrl`이 **Vue 시절 camelCase 경로**로 DB 저장돼 있어 Next에서 **하드 404**.
  - 실제 저장값: `/mypage/appliedProjects`(→`applied-projects`), `/mypage/affiliationApplicantList`(→`affiliation-applicants`), `/mypage/affiliationProjectList?projectSq=96&appTyp=personal`(→`affiliation-projects`) 전부 **404** 재현. `/notice/105`·`/notice/104`(경로 불변)만 정상.
  - **프론트 라우팅은 정상**임을 입증: 올바른 kebab `/mypage/applied-projects` 직접 이동 시 "프로젝트 지원 현황" 정상 렌더. 404 원인은 오직 백엔드 저장값(구경로). 프론트 경로 생성 로직은 Vue·Next 동일(targetUrl 통과만).
  - **미이식 관찰(STEP4에서 이월):** 알림 경유 자동 모달 오픈(Vue query `projectSq`+`appTyp`) 미배선 — 위 targetUrl 자체가 404라 자동오픈 이전에 페이지 진입 실패. 백엔드 URL 정정과 함께 처리 필요.
- ⚠️ **알림 실시간성 없음(원본 한계, 회귀 아님):** 폴링·SSE·WebSocket 없음. Vue·Next 동일.
- **데이터 노트:** 사용자 승인 하에 이국환 기업계정의 실제 알림 28건을 라이브 검증에 소진(단건삭제 1·단건읽음 1·모두읽음·전체삭제) → **복구 UI 없어 영구 소실/전부 읽음 처리됨**. 테스트 전용 계정 데이터.

### ✅ STEP 6 종결 — 알림 6기능 전부 라이브 통과, 프론트 수정 0건. 유일 리스크는 백엔드 저장 targetUrl(camelCase→404, 백로그). 다음 = STEP 7.

---

## STEP 7 — 미검증 영역 / 갭

⬜ 미진행
