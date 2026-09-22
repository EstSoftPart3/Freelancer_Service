# Next 대조 — 프로젝트 지원 / 합격·불합격 / 인터뷰 플로우

> 마이그레이션 검증 2단계. 기준 명세: [vue-spec-project.md](./vue-spec-project.md).
> 대조 대상: migration-map의 프로젝트 지원/인터뷰 관련 행에 적힌 Next `app/` 경로 + 그 페이지가
> 렌더링하는 동일 기능의 client 컴포넌트만. 다른 기능은 열지 않음.
> 추측 없음 — 코드에 있는 것만. 작성 기준일: 2026-06-26
>
> ★범위 제외 확정: '전체합격/개별합격' 분기는 Vue 원본에 없음(기획-구현 갭) → 대조 대상 아님.
> 실제 존재 분기(지원중 → 인터뷰요청중 / 불합격)만 대조.

## 0. 연 파일 (대조 범위)

| Vue 기준 | Next 경로 (app) | 실제 로직 위치 |
|---|---|---|
| Vue 개인/회사 상세 2파일 | `app/projects/user/[project_sq]/page.tsx`, `app/projects/company/[project_sq]/page.tsx` | 둘 다 동일 `components/project/ProjectSpec.tsx` 1개로 통합 |
| AppliedProjectsPage | `app/mypage/applied-projects/page.tsx` | `components/mypage/personal/AppliedProjectsClient.tsx` |
| AffiliationProjectListPage | `app/mypage/affiliation-projects/page.tsx` | `components/mypage/company/AffiliationProjectsClient.tsx` |
| (판정 래퍼) | — | `lib/api.ts` |

**구조적 차이:** Vue는 개인상세(`UserProjectSpecPage`)·회사상세(`CompanyProjectSpecPage`)가 별도 파일이었으나, Next는 두 라우트가 **단일 `ProjectSpec.tsx`** 를 공유한다. 따라서 회사상세 전용 진입(기업 지원 = `openMemberModal`)이 구조적으로 사라졌다.

**최상위 결론:** 지원 확정·회사측 합격/불합격·인터뷰 시간 확정 플로우 전체가 **Next에 미구현**이다. 지원현황 모달군(`PersonalApplyStatusModal`/`ApplyStatusModal`/`ResumeDetailModal`)·이력서 선택 모달군(`ResumeSelectModal`/`AffiliationMemberModal`)·인터뷰 모달군(`InterviewSelectModal`)에 대응하는 Next 파일이 **존재하지 않는다**(전체 검색으로 확인). 구현된 것은 조회/표시와 `지원취소` 뿐이다.

---

## A. 개인/기업이 프로젝트 지원

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| 상세 로드 `GET /projects/{sq}/details` → `output`로 분기 | ✅구현 | [ProjectSpec.tsx:55-61](../frontend/nextjs/components/project/ProjectSpec.tsx#L55) | `r.data.output` 동일 키. |
| A-1 PERSONAL/COMPANY_EXTERNAL + isApplied 0 + 모집중 → "지원하기" | ⚠️다름 | [ProjectSpec.tsx:258-277](../frontend/nextjs/components/project/ProjectSpec.tsx#L258) | 버튼은 있으나 클릭이 실동작 아님(아래 A-2 스텁). |
| A-1 isApplied===1 → "지원 완료"(비활성) | ✅구현 | [ProjectSpec.tsx:272-274](../frontend/nextjs/components/project/ProjectSpec.tsx#L272) | `disabled` + "지원완료" 텍스트로 동등. |
| A-1 `isRecruitmentEnded` → "지원 마감"(disabled 버튼) | ⚠️다름 | [ProjectSpec.tsx:258,279](../frontend/nextjs/components/project/ProjectSpec.tsx#L258) | Next는 마감 시 지원/스크랩 버튼을 **아예 숨김**(`!isRecruitmentEnded` 가드). Vue처럼 "지원 마감" 비활성 버튼을 보여주지 않음. |
| A-1 `isRecruitmentEnded` 계산식 = `endDt + 'T23:59:59' < now` | ⚠️다름 | [ProjectSpec.tsx:116-117](../frontend/nextjs/components/project/ProjectSpec.tsx#L116) | Next는 `new Date(endDt).getTime() < Date.now()` — `T23:59:59` 미부가 → 마감일 **자정(00:00) 기준**으로 약 하루 일찍 마감 처리. |
| A-1 COMPANY_MEMBER(개인상세) → "참여할 수 없습니다" 버튼 | ⚠️다름 | [ProjectSpec.tsx:279-283](../frontend/nextjs/components/project/ProjectSpec.tsx#L279) | Next는 COMPANY_MEMBER에게 **정상 "지원하기" 버튼**을 노출(차단 문구 없음). 자세히는 §3 원본버그 처리 참고. |
| A-1 COMPANY_AUTHOR → 수정/삭제 | ✅구현 | [ProjectSpec.tsx:239-256](../frontend/nextjs/components/project/ProjectSpec.tsx#L239) | 수정→project-post, 삭제→`DELETE /projects/{sq}` 후 `/projects` 이동. 동등. |
| A-2 `applyCheck` 1차 중복 차단(isApplied 1 → alert) | ❌누락 | [ProjectSpec.tsx:85-89](../frontend/nextjs/components/project/ProjectSpec.tsx#L85) | `handleApply`가 **스텁**: `toast.info('지원하기 기능은 준비 중입니다.')`. 중복 차단·모달 진입 없음. |
| A-3 개인 지원 확정 `POST /projects/applications/{sq}` (ResumeSelectModal, PERSONAL) | ❌누락 | (없음) | 이력서 선택 모달·지원 POST가 코드베이스에 전무. |
| A-4 회사상세 "지원하기" → AffiliationMemberModal(소속 인원 선택) | ❌누락 | (없음) | 통합 `ProjectSpec`에서 동일 스텁 호출. 소속 인원 목록/중복체크(`.../check`)/대표이력서 지정 전무. |
| A-5 기업 지원 확정 `POST /projects/applications/{sq}` (COMPANY, 복수 일괄) | ❌누락 | (없음) | 미구현. |
| A-6 지원 후 onConfirm 재조회로 isApplied 갱신 | ❌누락 | — | 지원 자체가 미구현이라 후속 갱신도 없음. |
| (참고) 스크랩 토글 `POST /projects/{sq}/scraps` | ⚠️다름 | [ProjectSpec.tsx:63-83](../frontend/nextjs/components/project/ProjectSpec.tsx#L63) | body `target: 'project'` — Vue는 `target: '프로젝트'`(한글). 리터럴 불일치(§4 P1 후보). 또한 Vue엔 없던 `isLoggedIn()` 선검사 추가. |

---

## B. 회사의 합격 / 불합격 처리

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| B-0 공고목록 "지원현황 바로가기" → 지원현황 모달 진입 | ❌누락 | [AffiliationProjectsClient.tsx](../frontend/nextjs/components/mypage/company/AffiliationProjectsClient.tsx) | 공고 목록은 구현(`GET /projects/companies`)되나, 행 액션은 **수정/삭제뿐**. "지원현황" 진입 버튼 없음 → 지원자 처리 화면 진입로 자체가 없음. |
| B-0 개인/기업 탭 토글, 알림 쿼리(`projectSq`,`appTyp`) 자동 오픈 | ❌누락 | (없음) | 모달 미존재로 N/A. |
| B-0 개인목록 `GET /projects/applications/{sq}/personal` → `res.response`/`res.totalPages` | ❌누락 | (없음) | 지원자 목록 조회 미구현 → §4의 `res.response` 어댑터 검증 불가(애초에 없음). |
| B-0 기업목록 `GET .../corporate/grouped` | ❌누락 | (없음) | 미구현. |
| B-0 이력서 클릭 → ResumeDetailModal + `POST /mypage/resume-detail-view`(열람처리) | ❌누락 | (없음) | 미구현. |
| B-1 개인 지원중 → "인터뷰 요청"/"불합격" (`PATCH /projects/applications/{appSq}` `{status}`) | ❌누락 | (없음) | `updateStatus`(인터뷰요청중/불합격) 회사측 액션 전무. (참고: 동일 PATCH는 §C의 본인 '지원취소'에서만 사용됨) |
| B-2 기업 지원중 → 인터뷰요청(성공 시 재조회+알림)/불합격 | ❌누락 | (없음) | 미구현. |
| B-2 기업 '합격' → "인터뷰 요청" → 시간 선택 모달 | ❌누락 | (없음) | 미구현(§C-3도 부재). |
| (범위제외) '전체합격/개별합격' 분기 | — | — | Vue 원본에 없음 → 대조 제외(확정). Next에도 없음(검색 확인). |

---

## C. 인터뷰 시간 정하기

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| C-1 회사 슬롯 생성(ProjectPostPage `InterviewTimeModal`) | (범위 밖) | `components/mypage/company/ProjectPostClient.tsx` (`interviewTime` 존재) | 프로젝트 '등록' 행이라 본 대조 범위 밖 — 깊이 대조 안 함. 인터뷰 생애주기 중 **유일하게 흔적이 남은** 부분으로만 기록. |
| C-2 본인 목록 조회 `GET /projects/applications`(또는 `/corporate`) → `output.applications/totalCount/counts` | ✅구현 | [AppliedProjectsClient.tsx:42-61](../frontend/nextjs/components/mypage/personal/AppliedProjectsClient.tsx#L42) | userType 분기(`COMPANY`→`/corporate`) 동일. 응답 키 `output.applications/totalCount/counts` 정확. |
| C-2 지원중 → "지원취소"(확인모달 후 `PATCH .../{appSq}` `{status:'지원취소'}`, 재조회) | ✅구현 | [AppliedProjectsClient.tsx:77-88,154-159](../frontend/nextjs/components/mypage/personal/AppliedProjectsClient.tsx#L77) | ConfirmDialog 경유 + 재조회까지 동등. |
| C-2 **인터뷰요청중 → "인터뷰 요청중" 버튼 → `fetchAvailableInterviewTimes`(시간 확정 진입)** | ❌누락 | [AppliedProjectsClient.tsx:164](../frontend/nextjs/components/mypage/personal/AppliedProjectsClient.tsx#L164) | Next는 액션 없는 **`<Badge>인터뷰 요청중</Badge>` 표시만**. 시간 확정 진입로 사라짐. → 지원자가 인터뷰 시간을 정할 수단이 전혀 없음. |
| C-2 인터뷰확정 → "인터뷰 확정" + 날짜 툴팁(읽기전용) | ✅구현 | [AppliedProjectsClient.tsx:163](../frontend/nextjs/components/mypage/personal/AppliedProjectsClient.tsx#L163) | Badge에 `formatDate(interviewDt)` 표시. 읽기전용 동등(툴팁→인라인 표기 차이뿐). |
| C-2 합격/불합격/지원취소/지원마감 배지 표시 | ✅구현 | [AppliedProjectsClient.tsx:160-165](../frontend/nextjs/components/mypage/personal/AppliedProjectsClient.tsx#L160) | 표시 동등. |
| C-3 `InterviewSelectModal` 슬롯 조회/단일선택/확정 `PATCH /projects/applications/interviews/{slotSq}` | ❌누락 | (없음) | 모달·확정 PATCH 전무. |
| C-4 확정 주체 분기(개인=본인 / 기업합격=회사) | ❌누락 | — | 양 경로 모두 미구현이라 분기 자체가 없음. |
| C-5 인터뷰확정 후 변경·취소 UI 부재 / 지원취소는 지원중 한정 | ✅구현(부재가 일치) | AppliedProjectsClient | 확정 상태 읽기전용·취소는 '지원중'만 — Vue와 동일(우연히 일치, 인터뷰 자체 미구현이라). |

---

## 점검 4종 (필수)

### 1. 플로우 분기 정합성
- **개인 지원**: 지원 가능조건(버튼 노출)은 부분 이식되나 **클릭 실동작·중복 차단 분기 전부 누락**(스텁). 지원 후 상태변화/알림 없음.
- **회사 합격/불합격**: 불합격 분기·인터뷰요청중 전이 모두 **진입로부터 누락**(지원현황 모달 부재).
- **인터뷰 시간**: 합격/인터뷰요청중에서의 노출 자체가 없음 → "불합격 시 차단"은 자동 성립하나 정상 경로도 함께 사라짐. 개인 vs 기업 주체 차이·변경/취소 UI 부재는 검증 불가(기능 부재).

### 2. 성공/실패 판정 방식 ★
- `lib/api.ts`는 순수 axios 인스턴스 — 응답 인터셉터가 비2xx를 `Promise.reject`로 throw, **`body.status` 미검사**. ([lib/api.ts:32-72](../frontend/nextjs/lib/api.ts#L32))
- 구현된 호출(스크랩/삭제/지원취소/목록조회)은 모두 `try { await api.x() } catch` 패턴 → **Vue와 동일하게 HTTP 상태로만 판정**. body.status로 바뀌어 깨진 곳 없음.
- 지원/상태변경/인터뷰 확정 호출은 미구현이라 해당 판정 N/A.
- **확인필요:** 이 API들이 (로그인/회원가입처럼) 실패해도 `200 + body.status`를 줄 가능성이 있다면, 향후 구현 시 Vue 방식(HTTP만 검사)을 그대로 옮기면 잠재버그가 된다. 단, **현재는 호출 자체가 없어 실재 버그 아님**(미래 구현 주의사항). 백엔드 미확인.

### 3. Vue 원본 버그 2건의 Next 처리
- **`ApplyStatusModal.handleReject` 미정의** → **소멸(N/A)**. `ApplyStatusModal` 자체가 Next에 없음 → 버그가 옮겨질 코드가 없음. (❌누락으로 분류하지 않음)
- **개인상세 COMPANY_MEMBER 버튼의 `applyCheck` 오결선** → **다르게 깨짐(변형)**. Vue는 "참여할 수 없습니다" 문구 버튼에 모순적으로 `@click=applyCheck`가 걸려 있었으나, Next([ProjectSpec.tsx:279-283](../frontend/nextjs/components/project/ProjectSpec.tsx#L279))는 COMPANY_MEMBER에게 **차단 문구를 없애고 정상 "지원하기" 버튼**을 부여 → `handleApply`(스텁) 호출. 모순은 사라졌지만 "참여 불가" 의도 표시도 사라져 **의미가 반대로 바뀜**.

### 4. 응답 키 어댑터 정합성
- 구현된 부분의 키는 정확: 본인 지원현황 `output.applications/totalCount/counts`([AppliedProjectsClient.tsx:54-57](../frontend/nextjs/components/mypage/personal/AppliedProjectsClient.tsx#L54)), 공고목록 `output.projects/totalPages`. **엉뚱한 키로 빈 데이터 뜨는 find-id형(`regDt→userCreatedAtDtm`) 불일치 없음.**
- 단, Vue에서 키가 갈리던 지점(지원자목록 `res.response`/`res.totalPages` vs 상세/슬롯 `res.output`)은 **그 기능(지원현황 모달)이 통째로 미구현**이라 어댑터 검증 불가 = 위험 지점이 이식되지 않음.
- **P1 후보(요청 바디 리터럴 불일치):** 스크랩 `target: 'project'`(Next) vs `'프로젝트'`(Vue). 응답 키는 아니나 동일 계열(값 계약 불일치) 버그 — 백엔드가 한글 값을 기대하면 스크랩 동작 깨짐. 백엔드 미확인이므로 **확인필요/P1**.

---

## 수정 필요 목록 (우선순위)

### P0 — 기능 전체 누락 (핵심 플로우 미이식)
1. **개인/기업 지원 확정 미구현** — `ProjectSpec.handleApply`가 `toast.info(준비중)` 스텁. ResumeSelectModal·AffiliationMemberModal·`POST /projects/applications/{sq}`·중복지원 체크(`.../check`) 전부 부재. (A-2~A-6)
2. **회사 지원현황/합격·불합격 처리 미구현** — AffiliationProjects에 "지원현황" 진입 없음. PersonalApplyStatusModal·ApplyStatusModal·ResumeDetailModal·`updateStatus(인터뷰요청중/불합격)` 전부 부재. (B 전체)
3. **인터뷰 시간 확정 미구현** — `인터뷰요청중`이 액션 없는 배지뿐. InterviewSelectModal·`fetchAvailableInterviewTimes`·`PATCH /projects/applications/interviews/{slotSq}` 부재. 개인·기업 양 경로 모두. (C-2 인터뷰요청중, C-3, C-4)

### P1 — 계약/리터럴 불일치 (구현된 코드의 잠재버그)
4. **스크랩 `target` 리터럴**: Next `'project'` ↔ Vue `'프로젝트'`. 백엔드 기대값 확인 후 일치 필요. ([ProjectSpec.tsx:69](../frontend/nextjs/components/project/ProjectSpec.tsx#L69))

### P2 — 동작 미세 차이 (⚠️다름)
5. **모집마감 표현**: Next는 마감 시 지원/스크랩 버튼을 숨김(Vue는 "지원 마감" 비활성 버튼 표시). ([ProjectSpec.tsx:258,279](../frontend/nextjs/components/project/ProjectSpec.tsx#L258))
6. **`isRecruitmentEnded` 경계**: Next는 `T23:59:59` 미부가로 마감일 자정 기준 → 약 하루 일찍 마감. ([ProjectSpec.tsx:116](../frontend/nextjs/components/project/ProjectSpec.tsx#L116))
7. **COMPANY_MEMBER 버튼 의미 역전**: 차단 문구 제거 + 정상 지원 버튼 부여(원본버그-Next처리, §3). ([ProjectSpec.tsx:279](../frontend/nextjs/components/project/ProjectSpec.tsx#L279))

### 확인필요
8. 향후 지원/상태변경/인터뷰 구현 시, 해당 API가 `200+body.status`로 실패를 줄 가능성 → HTTP-only 판정(Vue 방식) 답습 금지. 백엔드 응답 규약 확인 필요. (현재는 미구현이라 실버그 아님)

---

## 비고
- 본 대조는 migration-map의 프로젝트 지원/인터뷰 행 + 해당 페이지의 client 컴포넌트 + 판정 래퍼(`lib/api.ts`)만 열어 수행. 백엔드·타 기능 미개봉.
- `ProjectPostClient`의 인터뷰 슬롯 생성(C-1)은 '프로젝트 등록' 행 소관으로 범위 밖 — 존재만 확인, 미대조.
- '전체합격/개별합격' 분기는 Vue 부재 확정으로 대조 제외(Next에도 없음).
