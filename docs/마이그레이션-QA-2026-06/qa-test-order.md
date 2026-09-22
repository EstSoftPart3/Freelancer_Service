# 마이그레이션 QA — 테스트 실행 순서 (의존성 기준)

> 이 문서는 [qa-migration-checklist.md](qa-migration-checklist.md)(서비스 플로우 관점 원본)를 **실제 테스트가 가능한 의존성 순서**로 재배치한 뷰다.
> 내용·원인·우선순위(P0~P3)는 원본 그대로, **순서만** 바꿨다. 괄호 안 `(1-3)`은 원본 항목번호(추적용).
> 결과 기록은 [qa-migration-results.md](qa-migration-results.md)에 한다.
>
> **★서버는 반드시 `wizardly-hamilton` worktree에서 기동** (완성본). 메인 체크아웃은 미완성본이라 화면이 체크리스트와 불일치.

## 진행 원리

계정이 있어야 → 로그인 → 로그인해야 → 마이페이지/프로젝트. 개인·기업 **두 계정**이 필요하므로 STEP 0에서 둘 다 만든다.

| STEP | 단계 | 선행 |
|---|---|---|
| 0 | 회원가입 (개인+기업 계정 확보) | 없음 |
| 1 | 로그인 / 세션 | STEP 0 |
| 2 | 계정복구 (아이디찾기/비번재설정) | STEP 0 계정 존재 (비로그인) |
| 3 | 마이페이지 — 개인 | 개인 로그인 |
| 4 | 프로젝트 — 지원/합격·불합격/인터뷰 | 이력서(STEP 3) |
| 5 | 마이페이지 — 기업 | 기업 로그인 |
| 6 | 알람 | 위 액션들의 부산물 |
| 7 | 미검증 / 갭 | 인증 통과 |

> 표기: `[정상]` 재현 확인용 · `[문제]` 재현 여부만 확인(+원인+우선순위). P0=작동불능/미구현 · P1=명확한 누락·계약위험 · P2=동작 미세차 · P3=경미.

---

## STEP 0 — 회원가입 (개인 + 기업 계정 한 번에)

> **선행:** 없음. 여기서 만든 개인/기업 계정을 이후 모든 STEP에서 재사용.

### 0-A. 개인 회원가입
- [ ] **(1-3)** [정상] 아이디/비번/이름/생년월일/성별/휴대폰/주소/이메일인증/약관 전체 검증 통과 후 제출
- [ ] **(1-4)** [정상] 아이디 중복확인(GET /check-id, 디바운스 500ms) → 중복 시 "이미 사용 중"
- [ ] **(1-5)** [정상] 이메일 인증 → 발송(POST /email/send-code) → 코드 확인(POST /email/verify-code)
- [ ] **(1-7)** [문제·P1] 제출 → **성공/실패 오탐 가능**. `SignUpController`가 `ApiResponse` 직접 반환 → 실패해도 HTTP 200, 에러는 body.status에만. Next는 2xx=성공 판정 → `body.status==='OK'` 검사 복원 필요. (백엔드 확정)
- [ ] **(1-14)** [문제·P2] 약관 동의 모달 미구현(체크박스만, 약관 본문 미표시)

### 0-B. 기업 회원가입
- [ ] **(1-9)** [문제·P1(기획확인)] 대표자명·사업자번호·개업일 3종 **필수 입력 강제**. Next만 임의 필수화, 백엔드 DTO는 optional·미저장 → 기획 의도 확인 필요(필수 유지 시 백엔드 저장 추가)
- [ ] **(1-13)** [문제·P2] 담당자 이름 2자 미만 검증 누락(빈값만 검사)

> **여기서 막히면:** 이후 전체 보류. 막힌 항목만 기록 후 재시도 일정.

---

## STEP 1 — 로그인 / 세션

> **선행:** STEP 0에서 개인(또는 기업) 계정 생성 완료.

- [ ] **(1-1)** [정상] 개인/기업 토글 + 아이디·비번 입력 → 성공 시 "OOO님 안녕하세요" 알림 + `/` 이동
- [ ] **(1-2)** [정상] 아이디저장/자동로그인 체크 → 다음 방문 시 해당 유형 아이디 자동 채움
- [ ] **(1-6)** [정상] 보호 라우트 직접 URL 접근 → 토큰 없으면 `/login` 리다이렉트(proxy.ts, Vue보다 견고)
- [ ] **(1-8)** [문제·P1] 로그인 상태에서 뒤로가기로 `/login`·`/sign-up` 재진입 → **차단 안 됨**. proxy.ts에 `token && publicAuthPath → /` 규칙 없음
- [ ] **(1-10)** [문제·P2] 새로고침 후 로그인 사용자도 첫 렌더 비로그인 UI 깜빡임. Zustand `persist` 없음, `/me` 비동기 복원
- [ ] **(1-11)** [문제·P2] 로그인 유형 "마지막 선택 기억" 미흡. 토글 시 유형 미저장 + 마운트 복원 키 불일치(`savedLoginType`)
- [ ] **(1-12)** [문제·P2] 소셜 로그인 버튼 제공자 표현 오류. `DOMAIN_PROVIDERS`(이메일 도메인)를 소셜 버튼으로 렌더. 현재 '준비 중' 알림이라 기능 영향 없음

> **여기서 막히면:** 이후 모든 STEP 보류.

---

## STEP 2 — 계정복구 (아이디찾기 / 비밀번호 재설정)

> **선행:** STEP 0 계정 존재. 비로그인 상태에서 진입(로그인 불필요).

### 정상 동작
- [ ] [정상] 아이디찾기 → 이름+이메일 인증 → 계정 있으면 결과 페이지, 없으면 "일치하는 회원 정보를 찾을 수 없습니다"
- [ ] [정상] 비번재설정 STEP-A(본인확인) → 아이디+이름+이메일 인증 → 성공 시 `/reset-password`
- [ ] [정상] 비번재설정 STEP-B(새 비번) → 정규식+확인 일치 → POST /reset-password(쿠키 세션) → 성공 시 `/login`
- [ ] [정상] 재설정 토큰 4분기(유효/만료/사용됨/위조) → 전부 백엔드 쿠키 세션 위임(회귀 없음)

### 알려진 문제
- [ ] [문제·P1] 아이디찾기 결과 → **가입일 빈칸 + 구분(userType) 누락**. Next가 `regDt`를 읽으나 실제 필드명은 `userCreatedAtDtm`(백엔드 확정) → `regDt→userCreatedAtDtm` 교정 + 구분 컬럼·날짜 포맷 복원
- [ ] [문제·P1] 비번재설정 STEP-A → 아이디(≥4자)·이름(≥2자) 길이 검증 누락(빈값만 검사)
- [ ] [문제·P2] 아이디찾기 결과 없음 시 로그인/비번찾기 버튼 노출 차이(Next 항상 노출 vs Vue 숨김)
- [ ] [문제·P2] STEP-A 이메일 도메인 목록 불일치(Vue=naver/gmail/yahoo vs Next=naver/gmail/daum/nate/hotmail, yahoo 누락)
- [ ] [문제·P3] 아이디찾기 결과 `?output=` → PII(userId/userNm)가 SSR HTML/서버 로그/URL에 노출
- [ ] [문제·P3] `/reset-password` 직접 진입 → 세션 미검증 폼 렌더(양쪽 동일, 제출은 백엔드 거부)

---

## STEP 3 — 마이페이지 — 개인

> **선행:** 개인 계정 로그인.

### 정상 동작
- [ ] [정상] 이력서 목록 조회(GET /mypage/resume/list) → 대표 설정 → 삭제
- [ ] [정상] 소속 정보 조회(GET /mypage/applications/info) → 탈퇴(PATCH .../withdraw)
- [ ] [정상] 소속 지원현황 조회(GET /mypage/applications/user) → 필터(all/read/unread)·검색·지원취소
- [ ] [정상] 소속 스크랩 조회(GET /mypage/applications/scraps) → 검색·삭제

### 알려진 문제
- [ ] [문제·★P0] **이력서 등록/수정 → 저장 → 완전 작동불능.** 원인 3겹: ①경로 불일치(Next `POST /mypage/resume/new`·`PUT .../update/{sq}`·`GET .../detail/{sq}` vs 백엔드 `POST /mypage/resume`·`PUT|GET /mypage/resume/{sq}` → 404로 본문 폐기) ②Content-Type(백엔드 multipart 기대 vs Next JSON → 415) ③필드명 5+종·항목 내부구조·주소 평면↔중첩 불일치
- [ ] [문제·P0] 이력서 폼 → 입력 항목 3종(프로필 사진·첨부파일·프로젝트 이력) 자체 부재 → 항상 null
- [ ] [문제·P0] 이력서 폼 → 유효성 검증 0건(필수·전화/이메일 정규식·파일용량 전무)
- [ ] [문제·P1] 이력서 신규 등록 → 회원 기본정보 자동기입(GET /mypage/edit/info) 누락(빈 폼)
- [ ] [문제·P1] 소속 지원현황/스크랩 → 회사명 클릭 상세 모달 미이관(클릭 불가 span)
- [ ] [문제·P1] 이력서 목록 → 제목 클릭 상세 모달(ResumeDetailModal) 미이관(수정 페이지로 이동)
- [ ] [문제·P1] 이력서 복사 → 파일 포함/제외 선택 누락(항상 포함 하드코딩)
- [ ] [문제·P1] 소속 탈퇴 후 → 소속 플래그 미갱신(clearUser 누락, 새로고침 전까지 stale)
- [ ] [문제·P2] 성공 판정 방식 제각각(이력서 삭제·스크랩은 HTTP만, 지원취소는 status 검사)

---

## STEP 4 — 프로젝트 — 지원 / 합격·불합격 / 인터뷰

> **선행:** 이력서 작성 가능해야 의미 있음(STEP 3). 단 목록/상세 조회는 독립 테스트 가능.

### 정상 동작
- [ ] [정상] 프로젝트 상세 조회(GET /projects/{sq}/details) → 모집중/마감/지원완료 버튼 분기
- [ ] [정상] COMPANY_AUTHOR → 공고 수정 이동 / 삭제(DELETE /projects/{sq})
- [ ] [정상] 프로젝트 상세 → 스크랩 토글(POST /projects/{sq}/scraps)
- [ ] [정상] 본인 지원현황 목록(GET /projects/applications[/corporate]) → 지원취소(PATCH, 확인모달)
- [ ] [정상] 인터뷰 확정 상태 → 확정 날짜 배지 읽기전용 표시

### 알려진 문제
- [ ] [문제·★P0] **"지원하기" → 지원 확정 → 미구현.** handleApply가 `toast.info('지원하기 기능은 준비 중입니다.')` 스텁. ResumeSelectModal·AffiliationMemberModal·`POST /projects/applications/{sq}`·중복지원 체크 전부 부재
- [ ] [문제·★P0] **회사 → 공고 지원현황 → 합격/불합격 처리 → 미구현.** 공고 목록에 "지원현황" 진입 버튼 없음, ApplyStatusModal·ResumeDetailModal·`updateStatus` 전부 부재. ※마이페이지 "지원자 현황"의 합격처리는 별경로로 구현됨(혼동 주의)
- [ ] [문제·★P0] **인터뷰 시간 확정 → 미구현.** '인터뷰요청중'이 액션 없는 배지뿐, InterviewSelectModal·`PATCH /projects/applications/interviews/{slotSq}` 부재(개인·기업 양 경로)
- [ ] [문제·P1] 스크랩 요청 바디 `target`: Next `'project'` vs Vue `'프로젝트'`. 백엔드 기대값 확인 후 일치 필요
- [ ] [문제·P2] 모집 마감 표현: Next는 마감 시 지원/스크랩 버튼 숨김(Vue는 "지원 마감" 비활성 버튼)
- [ ] [문제·P2] `isRecruitmentEnded` 경계: Next는 `T23:59:59` 미부가 → 약 하루 일찍 마감
- [ ] [문제·P2] COMPANY_MEMBER 버튼 의미 역전: 차단 문구 제거 + 정상 "지원하기" 부여(원본버그-Next처리)

---

## STEP 5 — 마이페이지 — 기업

> **선행:** 기업 계정 로그인(STEP 0-B 계정).
> ★대비: 이력서의 3겹 패턴은 기업 폼에서 재현 안 됨(제출 계약 일치). 깨지는 곳은 프로젝트 폼 '로드' 한 곳뿐.

### 정상 동작 (제출 계약 일치 확인됨)
- [ ] [정상] 프로젝트 공고 목록(GET /projects/companies, .../status) → 필터·검색·삭제
- [ ] [정상] 소속 지원자 현황(GET /mypage/applications/company) → 열람 → 합격(502)/불합격(503) 처리(PUT .../apply/{sq})
- [ ] [정상] 소속 인원 관리(GET /companies) → 퇴사 처리(PATCH /companies)
- [ ] [정상] 소속 정보 수정(GET/POST /mypage/edit/affiliation/*) → 텍스트 저장·프로필이미지 업로드/삭제·모집 해제

### 알려진 문제
- [ ] [문제·★P0] **공고 등록/수정 → 사용/우대 기술 선택 → 등록 → 사실상 불가.** GET /projects/forms의 `skills`가 그룹 객체(`{parentSkillTagNm, childSkillTagNms[]}`)인데 Next가 평면 `string[]`로 가정 → `s.toLowerCase()`로 스킬 피커 렌더 붕괴 → 빈 채 제출 → 백엔드 `@NotEmpty` 위반 → 모든 등록/수정 400
- [ ] [문제·P1] 인터뷰 가능 시간 선택 전체 부재(Next `interviewTime:[]` 하드코딩, InterviewTimeModal 미이관)
- [ ] [문제·P1] 지하철역 검색 비작동(입력 readOnly + "미구현" placeholder, SubwaySearchModal 미이관)
- [ ] [문제·P1] 지역(시/구) 캐스케이드 셀렉트 제거(우편번호로 축소)
- [ ] [문제·P2] 제출 검증 갭(단가·근무형태·직군·사용/우대기술·상세내용 미검증 → 백엔드 400 유발)
- [ ] [문제·P3] 수정 프리필 → 우편번호/시군구 미복원(ExistProjectVo에 필드 부재, 양쪽 공통)
- [ ] [문제·P3] 소속 인원 목록 React key가 `member.id`(부재)라 undefined → `userSq` 권장

---

## STEP 6 — 알람(알림)

> **선행:** 위 액션들(지원·합격 등)이 수행돼 알림 생성돼 있어야 일부 확인 가능(없으면 빈 목록 기준).

### 정상 동작 (충실 이식)
- [ ] [정상] 헤더 알림 → 목록 조회(GET /notifications) + 안읽음 수(unread-count) → 벨 dot/배지
- [ ] [정상] 알림 클릭 → notificationTargetUrl 이동 + 읽음 처리(PATCH /notifications/{sq}) + 안읽음 수 재조회
- [ ] [정상] 모두 읽음(PATCH /notifications) · 전체 삭제(DELETE /notifications) · 단건 삭제(DELETE /notifications/{sq})
- [ ] [정상] 빈 상태 표시 · Optimistic UI · 삭제 버튼 전파 차단

### 알려진 문제
- [ ] [문제·중(백엔드 백로그)] 저장된 `notificationTargetUrl`이 Vue 구경로(camelCase, 예 `/projectListPage`)면 Next에서 404. **백엔드 저장값** 문제(프론트 경로 생성은 정상). 댓글 알림(`/board/:sq`)은 안전
- [ ] [문제·낮(원본 한계)] 알림 실시간성 없음(폴링·SSE·WebSocket 없음). 양쪽 동일 → 회귀 아님

---

## STEP 7 — 미검증 영역 / 알려진 갭

> **선행:** 인증 통과. 이번에 처음 손으로 확인하는 영역 — 새 발견은 별도 항목으로 추가 기록.

- [ ] [미검증] 게시판(board) CRUD — 필드명/성공판정 빠른 스캔 예정
- [ ] [미검증] Q&A CRUD
- [ ] [미검증] 공지(notice) CRUD
- [ ] [미검증] 메인 등 단순 조회성 페이지 — 손테스트 예정
- [ ] [갭] /affiliation 공개목록 페이지 — **페이지 자체 부재(404)**. 마이그레이션 진짜 누락(progress.md 8번). Vue `AffiliationListPage` 기준 복원 필요

---

## 사용법
각 항목을 브라우저에서 직접 눌러보며 체크. **알려진 문제는 재현 여부만 확인, 수정은 검증 완료 후 일괄 처리.** 결과는 [qa-migration-results.md](qa-migration-results.md)에 기록.
