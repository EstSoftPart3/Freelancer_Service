# Vue 명세 추출 — 프로젝트 지원 / 합격·불합격 / 인터뷰 플로우

> 마이그레이션 검증 6단계의 1단계. **Vue 원본(frontend/vue_js/src/fo)에서만** 추출한 "동작 규칙".
> 추측 없음 — 코드에 있는 것만. 다음 단계(Next 대조)의 기준 문서.
> 작성 기준일: 2026-06-26

## 0. 전제 — 성공/실패 판정 방식 (★다음 대조의 핵심)

`src/axios.js`의 공통 래퍼(`api.$get/$post/$patch/$delete`)는:
- 응답을 `response.data`(= 백엔드 바디)로 반환한다.
- axios가 에러를 던지면(= **비2xx HTTP 상태**) `catch`에서 그대로 re-throw 한다.

따라서 **이 플로우의 모든 화면은 성공/실패를 오직 HTTP 상태(try/catch)로만 판정한다.**
지원·상태변경·인터뷰 어디에서도 `body.status`(예: `'OK'`)를 검사하지 않는다.
→ "await가 throw 안 하면 성공" 패턴. (로그인 영역에서 발견된 `body.status==='OK'` 패턴과 대조됨 — Next 마이그레이션이 이 차이를 잘못 옮겼는지 확인 필요.)

- 요청 인터셉터가 `localStorage.accessToken`을 `Authorization: Bearer`로 자동 주입.
- 401 → `/refresh-token`(refreshToken을 Bearer로) 자동 재발급 후 원요청 재시도, 실패 시 `clearLoginState()`.
- 일부 컴포넌트(CompanyProjectSpecPage, InterviewSelectModal)는 **쿠키에서 accessToken을 따로 읽어** 수동으로 헤더에 또 넣음(중복·불일치). 동작엔 영향 없음.
- `$delete(url)`는 두 번째 인자(config)를 **무시**한다. 호출부가 `{withCredentials:true}`를 넘겨도 적용 안 됨(참고용 메모).

상태 코드(한글 문자열로 비교): **지원중 · 인터뷰요청중 · 인터뷰확정 · 합격 · 불합격 · 지원취소**

---

## A. 개인이 프로젝트 지원

대상 파일: `views/project/UserProjectSpecPage.vue`(개인 상세),
`views/project/CompanyProjectSpecPage.vue`(회사 상세 — 기업 지원 진입),
`components/mypage/common/ResumeSelectModal.vue`(개인 지원 확정),
`components/company/AffiliationMemberModal.vue`(기업 지원 확정).

### A-1. 지원 버튼 노출 조건 (상세 페이지)

프로젝트 상세는 `GET /projects/{project_sq}/details`로 로드하고 응답 `output.userRole`로 분기한다.
(로그인 여부 자체를 컴포넌트가 검사하지 않음 — 노출은 백엔드가 내려준 `userRole`/`isApplied`에 전적으로 의존.)

| 조건 | 노출 | 동작 |
|---|---|---|
| `userRole`이 `PERSONAL` 또는 `COMPANY_EXTERNAL` + `isApplied===0` + 모집중 | **지원하기** | 클릭 → `applyCheck` |
| 동일 role + `isApplied===1` | **지원 완료**(비활성 텍스트) | 없음 |
| `isRecruitmentEnded` true | **지원 마감**(disabled) | 없음 |
| `userRole==='COMPANY_MEMBER'` (개인상세) | "해당 프로젝트에는 참여할 수 없습니다." 버튼 | ⚠️ 그래도 `@click="applyCheck"`가 걸려 있음(클릭 시 지원 모달이 뜰 수 있는 모순) |
| `userRole==='COMPANY_AUTHOR'` (회사상세) | 수정하기 / 삭제하기 | 지원 불가 |

- `isRecruitmentEnded` = `projectRecruitEndDt + 'T23:59:59' < now` (클라이언트 시계 기준).
- 모집 마감은 **버튼 비활성화만** 함. 실제 지원 API 차단은 백엔드 의존.
- 개인 상세의 "지원하기"는 `applyCheck`를, 회사 상세의 "지원하기"는 `openMemberModal`(기업 지원)을 호출한다.

### A-2. 지원 가능 조건 / 차단 분기

`applyCheck()` (UserProjectSpecPage):
1. `project.isApplied===1` → `alertStore.show('이미 지원한 프로젝트입니다.', 'danger')` 후 중단. (1차 중복 차단 — 클라이언트)
2. 아니면 `ResumeSelectModal`(role `'PERSONAL'`, projectSq, onConfirm=상세 재조회) 오픈.

### A-3. 개인 지원 확정 (ResumeSelectModal, role=PERSONAL)

- 이력서 목록: `GET /mypage/resume/select-list` (`res.output` 배열). 배열 아니면 콘솔 에러만.
- 이력서 선택은 **단일 선택**(`selectedResume`를 splice로 비우고 1건만). 미선택 시 "선택 완료" 클릭하면 `'이력서를 선택해주세요.'`(danger) 후 중단.
- 확정(`confirm`): `POST /projects/applications/{projectSq}`
  body `{ resumeSq: [선택한 resumeSq], projectApplicationTyp: 'PERSONAL' }`
  - 성공(throw 없음): `'프로젝트 지원에 성공하였습니다.'` → `onConfirm()`(상세 재조회로 isApplied 갱신) → 모달 닫기.
  - 실패(throw): `'프로젝트 지원에 실패했습니다.'`(danger). 라우팅 이동 없음.

### A-4. 기업(소속) 지원 진입 — 회사 상세의 "지원하기"

`CompanyProjectSpecPage.openMemberModal()` → `AffiliationMemberModal`(modal-xl) 오픈.
- 소속 인원 목록: `GET /companies?page&size&searchType&keyword` → `output.members/page/totalPages`.
- 인원 선택 토글(`toggleSelection`):
  - 대표이력서(`resumeSq`) 없으면 `'대표 이력서를 먼저 선택해주세요.'`(danger) 후 중단.
  - **중복 지원 체크**: `GET /projects/applications/{projectSq}/check?userSq={memberSq}`
    - `res.output` truthy → `'이미 지원한 이력 있는 사용자입니다.'`(danger), 선택 막음.
    - falsy → 선택 목록에 추가.
    - 체크 자체 실패 → `'지원 여부 확인 중 오류가 발생했습니다.'`(danger).
  - 이미 선택된 인원 재클릭 → 선택 해제.
- 이력서 변경: `ResumeSelectModal`(role `'COMPANY'`, userSq) → 확정 시 `PATCH /mypage/resume/representative/{resumeSq}` body `{ memberSq }` (대표 이력서 지정, 지원 API 아님).
- 인원 이력서 목록(회사용): `GET /mypage/resume/list/{userSq}`.

### A-5. 기업 지원 확정 (AffiliationMemberModal)

"선택완료" → `CommonConfirmModal`("해당 프로젝트에 지원하시겠습니까?") → 확인 시
`POST /projects/applications/{projectSq}` body `{ resumeSq: [선택인원들의 resumeSq...], projectApplicationTyp: 'COMPANY' }` (**복수 인원 일괄 지원**)
- 성공: `res.message || '프로젝트 지원에 성공했습니다.'` → 확인모달 닫기 → 부모 모달 닫기. (라우팅 이동 없음 — `router.push`는 주석처리)
- 실패: `'지원 중 오류가 발생했습니다.'`(danger).

### A-6. 지원 후 상태 변화 / 회사 측 표시

- 개인: onConfirm으로 상세 재조회 → `isApplied` 1로 갱신 → 버튼이 "지원 완료"로. 별도 알림 발송 코드는 이 화면에 없음(백엔드 위임 추정).
- 회사 측 노출은 별도 화면(B)에서 `appStatus`로 표시. 신규 지원 건은 `지원중` 상태로 집계됨.
- 스크랩(참고): `POST /projects/{projectSq}/scraps` body `{ hasScrapped, target:'프로젝트' }`, 응답 `output`=스크랩 수. 토글식.

---

## B. 회사의 합격 / 불합격 처리

대상: `views/mypage/company/AffiliationProjectListPage.vue`(공고 목록·지원현황 진입),
`components/mypage/personal/PersonalApplyStatusModal.vue`(개인 지원자 탭),
`components/mypage/company/ApplyStatusModal.vue`(기업 지원자 탭),
`components/mypage/common/ResumeDetailModal.vue`(이력서 열람).

### B-0. 지원현황 모달 진입

`AffiliationProjectListPage`(공고 목록, `GET /projects/companies`):
- 각 공고 "지원현황 바로가기" → `openUserApplyModal` → `openPersonalModal`(개인 탭 먼저).
- 개인/기업 탭 토글: 두 모달이 `onToggle`로 서로를 다시 연다(`resetModal`이 modalStack을 비우고 교체).
- 알림 진입: URL 쿼리 `projectSq` + `appTyp`('corporate'|'personal')가 있으면 해당 프로젝트 모달 자동 오픈(목록 로드 후 + 쿼리 watch). 기본값 personal.

두 모달 공통:
- 개인 목록: `GET /projects/applications/{projectSq}/personal?page&size&filter&searchType&keyword` → **`res.response`(배열), `res.totalPages`** (※ `res.output` 아님).
- 기업 목록: `GET /projects/applications/{projectSq}/corporate/grouped` (회사별 그룹 `res.response`).
- 필터 카운트는 **현재 페이지 데이터로 클라이언트 계산**(전체 합계 아님). 키: all / passed(합격) / in_progress(지원중) / interview_confirmed(인터뷰확정) / interview_requested(인터뷰요청중) / rejected(불합격·지원취소).
- 이력서 클릭 → `ResumeDetailModal`(`isFromApplicationList:true`) → `POST /mypage/resume-detail-view` body `{resumeSq, projectSq, applicationSq}` (**열람 처리 포함** 조회). ⚠️ ResumeDetailModal에는 합격/불합격 액션 버튼이 **없다**(선택 버튼 주석처리). 합격/불합격은 목록 모달에서만 처리.

### B-1. 개인 지원 건 처리 (PersonalApplyStatusModal)

지원자 `appStatus`별 버튼:

| appStatus | 노출 버튼 | 클릭 동작 |
|---|---|---|
| **지원중** | "인터뷰 요청" / "불합격" | 인터뷰요청 → `updateStatus(applicationSq,'인터뷰요청중')` · 불합격 → 확인모달 후 `updateStatus(...,'불합격')` |
| 인터뷰요청중 | "인터뷰 요청중"(비활성 표시) | 없음 |
| 불합격 | "불합격"(표시) | 없음 |
| 인터뷰확정 | "인터뷰 확정" + 툴팁(`appStatusVo.interviewDt` 원문) | 없음(hover만) |
| 지원취소 | "지원 취소됨" | 없음 |

- ★개인 건에는 **'합격' 상태로 전이시키는 버튼이 없다.** 합격 단계 없이 `지원중 → 인터뷰요청중`으로 바로 간다. (필터엔 '합격' 카운트 칸이 있으나 이를 만드는 액션이 프론트에 없음.)
- `updateStatus`: `PATCH /projects/applications/{applicationSq}` body `{ status }`.
  - 성공: 로컬 상태만 즉시 갱신(`updateStatusLocally`) + `'상태가 정상적으로 변경되었습니다.'`. (재조회 안 함)
  - 실패: `'상태 변경 중 오류가 발생했습니다.'`(danger).
- 불합격은 `CommonConfirmModal`("해당 지원자를 불합격 처리하겠습니까?") 경유.

### B-2. 기업 지원 건 처리 (ApplyStatusModal)

| appStatus | 노출 버튼 | 클릭 동작 |
|---|---|---|
| **지원중** | "인터뷰 요청" / "불합격" | 인터뷰요청 → `updateStatus(...,'인터뷰요청중')`(성공 시 **재조회** + 알림) · 불합격 → 확인모달 후 `updateStatus(...,'불합격')` |
| **합격** | "인터뷰 요청" | `fetchAvailableInterviewTimes(applicationSq)` → 인터뷰 시간 선택 모달(아래 C-3) |
| 불합격 | "불합격" | ⚠️ `@click="handleReject(applicant)"` — **`handleReject`가 이 컴포넌트에 정의돼 있지 않음**(클릭 시 에러). 미완성/사문화 코드로 보임 |
| 인터뷰요청중 | "인터뷰 요청중"(비활성) | 없음 |
| 인터뷰확정 | "인터뷰 확정" + 툴팁(`formatDate(interviewDt)`) | 없음 |
| 지원취소 | "지원 취소됨" | 없음 |

- ★프롬프트가 언급한 **"전체합격 / 개별합격"** 분기 버튼은 **Vue 코드에 존재하지 않는다.** 검색해도 없음(`전체합격`/`개별합격`/`일괄합격` 등 미존재). 기업 지원 건도 개인과 동일하게 `지원중 → 인터뷰요청중/불합격`만 프론트에서 설정 가능.
- ★'합격' 상태는 UI에 표시·분기는 있으나, 이 상태로 **전이시키는 프론트 액션이 없다**(개인·기업 모두). 백엔드 주도이거나 레거시 상태일 가능성 → 다음 대조에서 백엔드/Next 동작 확인 필요.
- 개인↔기업 탭 토글 버튼은 양쪽에 있음. 단 ApplyStatusModal의 '기업' 버튼은 핸들러 없음(현재 탭이라 비활성), '개인' 버튼만 `toggleToPersonal`.

### B-3. 처리 후 지원자 측 상태 변화 / 알림

- 회사가 상태를 바꾸면 지원자 본인 화면(섹션 C/AppliedProjectsPage)에서 해당 `applicantType`로 반영됨.
- 별도 푸시/알림 발송 코드는 이 화면들에 없음(백엔드 위임). 회사 화면은 알림 클릭 시 쿼리(`projectSq`,`appTyp`)로 모달 자동 오픈하는 진입만 처리.

---

## C. 인터뷰 시간 정하기

대상: `components/project/InterviewTimeModal.vue`(공고 등록 시 슬롯 **생성**),
`components/mypage/common/InterviewSelectModal.vue`(슬롯 중 1개 **확정**),
`views/mypage/personal/AppliedProjectsPage.vue`(지원자 본인이 시간 확정),
`components/mypage/company/ApplyStatusModal.vue`(합격 기업건 시간 확정),
`components/project/ProjectInverviewTimeButtonGroup.vue`(선택 슬롯 칩 표시).

인터뷰는 3단계 생애주기로 나뉜다.

### C-1. (선행) 회사가 인터뷰 가능 슬롯 생성 — 공고 등록/수정 시

`ProjectPostPage` → `project/InterviewTimeModal.vue`:
- 모집 기간(`recruitStartDt`/`recruitEndDt`) 미설정 시 `'모집 기간을 먼저 설정해주세요.'`(danger) 후 모달 안 뜸.
- 달력은 **복수 날짜·복수 시간** 선택(toggleTime이 push/splice = 다중). 시간은 09:00~18:00 30분 단위(고정 19칸).
- `minDate/maxDate`(=모집기간)와 과거일은 비활성. 범위 밖 클릭 방어.
- "적용" → `emit('confirm', [{date, times[]}...])` → 공고 payload `interviewTime: ['YYYY-MM-DDThh:mm', ...]`(평탄화)로 제출.
- 모집 기간을 바꾸면 범위 밖 슬롯 자동 제외 + `'모집 기간 변경으로 인해 ... 제외되었습니다.'`(warning).
- 필수값: 슬롯 0개면 `'인터뷰 가능 시간을 설정해주세요.'`.

### C-2. 지원자 본인이 시간 확정 (개인 플로우 — AppliedProjectsPage)

지원자 본인의 "프로젝트 지원 현황" 목록(`applicantType`별 표시):

| applicantType | 표시 / 액션 |
|---|---|
| 지원중 | "지원중" + "지원취소"(→ 확인모달 후 `PATCH .../{applicationSq}` `{status:'지원취소'}`, 재조회) |
| **인터뷰요청중** | "인터뷰 요청중" 버튼 → **`fetchAvailableInterviewTimes(projectSq, applicationSq)`** (시간 확정 진입) |
| 합격 | "합격"(라이트 배지, 액션 없음) |
| 인터뷰확정 | "인터뷰 확정" + 툴팁(`formatDate(interviewDt)`), 액션 없음 |
| 불합격 | "불합격"(표시) |
| 지원취소 | "지원 취소됨" |
| `isRecruitEnded===true` | "지원 마감" 배지 추가 |

- ★시간 확정이 노출되는 유일한 상태는 **인터뷰요청중**. 불합격/지원취소/지원중에서는 시간 확정 진입 자체가 없다(불합격 시 차단).
- 목록 조회: 사용자 타입 분기 — `COMPANY`면 `GET /projects/applications/corporate`, 그 외 `GET /projects/applications` (params: offset/size/searchType/keyword/readType). 응답 `output.applications / output.totalCount / output.counts`.

### C-3. 시간 선택 → 확정 모달 (InterviewSelectModal, 공통)

`fetchAvailableInterviewTimes`:
1. `GET /projects/applications/interviews/{projectSq}` → `output` = `[{ interviewTime:'YYYY-MM-DDThh:mm:ss', interviewTimeSq }]` (회사가 C-1에서 만든 슬롯).
2. `InterviewSelectModal` 오픈(`interviewTimes`, `applicationSq` 전달).

모달 동작:
- 회사가 제공한 날짜만 달력에 `available`/`has-times`로 활성. 그 외/과거일 클릭 불가.
- 시간은 해당 날짜의 제공 슬롯만 노출, **단일 선택**(같은 시간 재클릭=해제, 다른 시간 클릭=덮어쓰기).
- 이미 지난 시각 클릭 시 `'이미 지난 시간은 선택할 수 없습니다.'`(danger).
- "적용"(`handleConfirm`): 날짜·시간으로 `interviewTimeSq` 역매칭. 없거나 applicationSq 없으면 `'날짜와 시간을 선택해주세요.'`(danger).
- 확정: `PATCH /projects/applications/interviews/{interviewTimeSq}` body `{ applicationSq }`.
  - 성공: `'인터뷰 시간 선택에 성공하였습니다.'`(success) → 모달 닫기 → (호출부) 목록 재조회.
  - 실패: `'인터뷰 시간 선택에 실패하였습니다.'`(danger).
- 확정 후 상태는 **인터뷰확정**으로 바뀌어 양측 화면에 날짜 툴팁으로 표시.

### C-4. 누가 시간을 확정하는가 — 경로별 차이 (★주의)

같은 `InterviewSelectModal`이 두 경로에서 열린다:
- **개인 플로우**: 지원자 본인이 `인터뷰요청중` 상태에서 직접 선택(C-2).
- **기업 합격 건**: 회사 측 `ApplyStatusModal`에서 지원자 `합격` 상태일 때 회사가 "인터뷰 요청"으로 동일 모달을 열어 선택(B-2 / C-3).

→ 즉 코드상 인터뷰 시간 확정 주체가 경로에 따라 **지원자 / 회사로 갈린다.** 의도된 분기인지 다음 대조에서 확인 필요.

### C-5. 이미 정한 경우 / 시간 변경 / 취소

- **인터뷰확정 이후 UI에는 변경·취소 버튼이 없다.** 모든 화면에서 확정 상태는 "인터뷰 확정" + 날짜 툴팁(읽기 전용)으로만 표시.
- 지원자 "지원취소"는 **지원중 상태에서만** 가능(AppliedProjectsPage). 인터뷰요청중/인터뷰확정에서는 취소 진입 없음.
- 재선택/리스케줄 경로는 프론트에 구현돼 있지 않음(백엔드에 있더라도 진입점 없음).

---

## D. 권한(개인/기업) 요약

| 행위 | 허용 role/조건 | 근거 |
|---|---|---|
| 개인 지원 | `PERSONAL`/`COMPANY_EXTERNAL` + isApplied 0 + 모집중 | UserProjectSpecPage 버튼 v-if |
| 기업(소속) 지원 | 회사 상세에서 "지원하기"(역할 게이팅은 위와 동일 v-if) | CompanyProjectSpecPage + AffiliationMemberModal |
| 스크랩 | 개인상세: PERSONAL/COMPANY_EXTERNAL · 회사상세: COMPANY_EXTERNAL만 | 각 상세 v-if |
| 공고 수정/삭제 | `COMPANY_AUTHOR` | CompanyProjectSpecPage |
| 합격/불합격·인터뷰요청 | 공고 소유 회사(지원현황 모달 진입자) | AffiliationProjectListPage→모달 |
| 인터뷰 시간 확정 | 지원자 본인(개인 인터뷰요청중) 또는 회사(기업 합격건) | C-4 |
| 본인 지원 취소 | 지원자 본인, 지원중 한정 | AppliedProjectsPage |

권한 가드 자체(라우터 beforeEach/미들웨어)는 본 문서 범위 밖(가드 검증은 docs/check-auth-guards.md에서 별도 완료).

---

## E. 다음 단계(2단계 대조) 체크포인트

1. **성공판정**: Next가 지원/상태변경/인터뷰에서 HTTP-throw 기준을 유지했는지, 아니면 `body.status` 검사로 바꿔 깨졌는지.
2. **'합격' 상태 출처**: 프론트 전이 액션이 없는 '합격'을 Next/백엔드가 어떻게 만드는지.
3. **'전체합격/개별합격'**: Vue엔 없음 — Next에 새로 생겼는지, 기획 추가인지 확인.
4. **인터뷰 확정 주체**(개인=지원자 / 기업합격=회사)가 Next에서도 동일한지.
5. **응답 키 차이**: 지원자 목록은 `res.response`+`res.totalPages`, 상세/슬롯은 `res.output`. Next 어댑터가 키를 맞췄는지.
6. `handleReject` 미정의, COMPANY_MEMBER 버튼의 applyCheck 오결선 등 Vue 버그가 Next로 전파됐는지.
