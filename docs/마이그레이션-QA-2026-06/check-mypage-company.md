# 마이페이지 기업 전용 검증 (Vue → Next.js)

> 검증 세션 — 기업(company) 전용 동작/계약 검증. 추측 없이 실제 프론트/백엔드 코드를 직접 읽어 작성.
> 작성 기준일: 2026-06-29 · 선행 문서: [check-mypage.md](check-mypage.md) (개인 전용 = 완료)
> 범위: 기업 전용 프론트만. 백엔드는 **계약 대조용 읽기만**. 인증/인가·시큐리티는 [backlog-backend-auth.md](backlog-backend-auth.md)(10번) — 본 문서 범위 밖.
> 코드 수정 없음(발견만). 실제 수정은 9번 통합 단계에서 일괄.
>
> 읽은 파일 — Next: `components/mypage/company/{ProjectPostClient, AffiliationProjectsClient, AffiliatedMembersClient, AffiliationApplicantsClient, AffiliationEditClient}.tsx`
> ↔ Vue: `views/mypage/common/ProjectPostPage.vue`, `views/mypage/company/*.vue`
> ↔ 백엔드(계약 대조): `ProjectController`/`ProjectCreateRequest`/`ProjectFormDataResponse`/`GroupSkillInfoResponse`/`ExistProjectVo`,
> `CompanyController`/`CompanyStatusRequest`/`CompanyMemberResponse`/`CompanyMemberVo`,
> `ApplicationController`, `InformationEditController`/`AffiliationInfoUpdateRequestDTO`/`AffiliationInfoResponseDTO`.

---

## ★결론 먼저 (이력서 패턴과의 대비)

개인 전용 **이력서 폼**은 경로 불일치(404) → Content-Type 불일치(415) → 필드명/구조 불일치의 **3겹**으로 완전 작동 불능이었다.
**기업 전용 폼은 그 패턴이 재현되지 않는다.** 프로젝트 공고 등록/수정·소속 정보 수정 모두 **경로·Content-Type·제출 필드명이 일치**한다.
(Next의 `requestBody`가 Vue 원본을 거의 그대로 복사 → DTO와 1:1로 맞음.)

대신 **단 한 곳에서 깨진다**: 프로젝트 폼 **로드(GET /projects/forms)** 의 `skills` 응답이 **그룹 객체 구조**인데 Next가 **평면 문자열**로 소비 →
사용/우대 기술 선택 UI가 렌더 중 터진다. 백엔드가 `usingSkills`/`preferSkills`를 `@NotEmpty`로 요구하므로,
스킬을 못 고르면 **모든 등록 요청이 400** → 실질적으로 프로젝트 등록 불가. **이게 유일한 P0.**

| 기능 | 스텁? | 경로 | Content-Type | 제출 필드명 | 깨짐 | 우선순위 |
|---|---|---|---|---|---|---|
| 프로젝트 공고 등록/수정 (ProjectPostClient) | 아니오 | ✅ 일치 | ✅ 일치(JSON) | ✅ 일치 | **폼 로드 스킬 구조 1겹** | **P0** |
| 소속 공고 지원자 현황 + 합격/불합격 (AffiliationApplicantsClient) | 아니오 | ✅ 일치 | ✅ 일치(JSON) | ✅ 일치 | 없음 | ✅ |
| 소속 인원 관리 (AffiliatedMembersClient) | 아니오 | ✅ 일치 | ✅ 일치(JSON) | ✅ 일치 | 없음(React key 경미) | ✅ (P3) |
| 프로젝트 공고 목록 (AffiliationProjectsClient) | 아니오 | ✅ 일치 | — (조회/삭제) | — | 없음 | ✅ |
| 소속 정보 수정 (AffiliationEditClient) | 아니오 | ✅ 일치 | ✅ 일치(JSON+multipart) | ✅ 일치 | 없음(읽기 미사용필드 2개) | ✅ |

---

## 1. 프로젝트 공고 등록/수정 (ProjectPostPage ↔ ProjectPostClient) — ★핵심

스텁 아님(실 API). 제출 계약은 견고. **문제는 폼 로드 + 검증/기능 누락.**

### 3겹 점검 (이력서 기준 순서대로)

**a) 경로 — ✅ 일치.** `ProjectController @RequestMapping("/projects")`:
- 등록 `POST /projects`, 수정 `PATCH /projects`, 폼데이터 `GET /projects/forms?projectSq=` — Next 호출과 전부 일치
  (`ProjectPostClient.tsx:110,198,201`). 이력서의 `/new`·`/update/`·`/detail/` 같은 **유령 경로 없음**.

**b) Content-Type — ✅ 일치.** 백엔드 `POST/PATCH`가 `@RequestBody ProjectCreateRequest`(순수 JSON).
Next도 JSON 전송. **multipart 아님** — `projectImageUrl`은 양쪽 다 빈 문자열 `''`로, 이미지 업로드가 애초에 없음(415 위험 없음).

**c) 제출 필드명 — ✅ 일치.** Next `requestBody`(`:164-194`) 키가 `ProjectCreateRequest` 레코드 컴포넌트와 1:1:

| Next 전송 | 백엔드 기대 | 비고 |
|---|---|---|
| projectId / projectTitle / projectImageUrl | 동일 | ✅ |
| projectSalary / projectSalaryNegotiableYn | 동일 | ⚠️ salary는 문자열로 보냄 → 백엔드 `Long`(Jackson 강제변환, 빈값→null) |
| detailedAddressName/AddressDetail/Zonecode/Lat/Lon/SigunguCode | 동일 | ⚠️ zonecode/lat/lon 문자열→Long/Double 강제변환(빈값→null) |
| subwayAddressName/Lat/Lon/SigunguCode | 동일 | ✅ (단 항상 빈값 — 아래 P1) |
| devGrade / educationLvl | 동일 | ✅ |
| projectStartDt/EndDt/recruitStartDt/EndDt | 동일 | ✅ `<input type=date>` → `yyyy-MM-dd` → `LocalDate` 정상(이력서 career의 `yyyy-MM` 함정 없음) |
| workType / recruitJob / usingSkills / preferSkills | 동일 | ✅ 키 일치(`@NotEmpty`) — 단 값 공급이 깨짐(아래 P0) |
| preference / description / interviewTime / isNotification | 동일 | ⚠️ interviewTime 항상 `[]`(아래 P1) |

→ **제출 본문은 도달하고 매핑된다.** 이력서처럼 "본문 전체 폐기"되는 일은 없음.

### ★P0 — 폼 로드 스킬 구조 불일치 (등록 차단)

`GET /projects/forms` 응답의 `skills`는 **그룹 객체 리스트**:
`List<GroupSkillInfoResponse> { parentSkillTagNm: String, childSkillTagNms: List<String> }`
(`ProjectFormDataResponse.java:23`, `GroupSkillInfoResponse.java`).

그런데 Next는 이를 **평면 `string[]`** 로 간주:
- `loadFormData`에서 `skills: out.skills ?? []`, `preferSkillsList: out.skills ?? []` 그대로 저장(`:117-118`)
- 렌더에서 `options.skills.filter((s) => s.toLowerCase().includes(...))`(`:210-211`) →
  `s`가 객체이므로 `s.toLowerCase`는 함수 아님 → **렌더 중 TypeError** → 사용/우대 기술 선택 UI 붕괴.

Vue는 동일 응답(`skills.value`)을 **전용 `SkillSelectModal`에 그대로 넘겨** 그룹 구조를 모달이 처리(`ProjectPostPage.vue:1205-1218`).
Next는 모달을 인라인 평면 필터로 대체하며 **구조 가정을 깨뜨림**.

**연쇄 효과(P0 확정):** 스킬을 못 고름 → `usingSkills=[]`, `preferSkills=[]` → 백엔드 `@NotEmpty`(`ProjectCreateRequest.java:53-55`) 위반 →
경로/필드명이 다 맞아도 **모든 등록/수정 요청이 400**. 프런트는 일반 토스트 "프로젝트 등록에 실패했습니다."만 표시(`:206`).
⇒ **현 상태에서 기업 프로젝트 공고 등록은 사실상 불가능.**

### P1 — 기능 누락(마이그레이션 회귀)

1. **인터뷰 가능 시간 선택 전체 부재.** Next는 `interviewTime: []` 하드코딩(`:192`). Vue는 `InterviewTimeModal`로 날짜·시간 선택 후
   `${date}T${time}`(LocalDateTime) 배열 전송(`ProjectPostPage.vue:1143-1145,1247-1261`). 백엔드는 `@NotNull`만 걸어 빈 배열은 통과 →
   에러는 없지만 **기능 자체가 사라짐**(수정 시 기존 인터뷰시간 프리필도 무시).
2. **지하철역 검색 비작동.** Next 지하철 입력은 `readOnly` + placeholder "지하철역 주소 (미구현 - 직접 입력)"(`:231`) — readOnly라 직접 입력도 막힘.
   Vue는 `SubwaySearchModal`(Kakao Places)로 역 선택·좌표·시군구코드 추출(`ProjectPostPage.vue:682-701`). → progress.md P1 `SubwaySearchModal`과 동일 건.
3. **지역(시/구) 캐스케이드 셀렉트 제거.** Vue는 cities/districts 2단 셀렉트 + Kakao 지오코딩(`ProjectPostPage.vue:825-862`).
   Next는 이를 들어내고 Daum 우편번호만 사용. 백엔드는 여전히 `cities`를 내려줌(미사용). 주소는 우편번호로 동작하므로 **축소이지 차단은 아님**.

### P2 — 유효성 검증 갭

Next `handleSubmit`(`:156-162`)은 제목·(주소 또는 지하철)·devGrade·educationLvl·프로젝트기간·모집기간만 검사.
**누락**: `projectSalary`(`@NotNull`), `workType`/`recruitJob`/`usingSkills`/`preferSkills`(`@NotEmpty`), description.
→ 이 값들이 비면 프런트가 못 거르고 **백엔드 400**으로 떨어짐. Vue는 14개 필드 전부 실시간+제출 검증(`ProjectPostPage.vue:899-1084`, 단가 숫자/1억 한도 포함).

### 경미

- 수정 프리필 시 `detailedZonecode`/`detailedSigunguCode`가 **`ExistProjectVo`에 아예 없음**(`ExistProjectVo.java`) →
  Next `exist.detailedZonecode`(`:130-131`)는 undefined → 우편번호/시군구 미복원 → 재저장 시 null. (Vue도 동일 한계.)

---

## 2. 소속 공고 지원자 현황 + 합격/불합격 (AffiliationApplicantListPage ↔ AffiliationApplicantsClient)

스텁 아님. **계약 전부 일치, 깨짐 없음.** `ApplicationController @RequestMapping("/mypage/applications")`:

| 동작 | Next 호출 | 백엔드 | 일치 |
|---|---|---|---|
| 목록 조회 | `GET /mypage/applications/company` (page/size/searchType/keyword/readType) | `@GetMapping("/company")` 동일 파라미터(`:33-43`) | ✅ |
| 열람 처리 | `PUT /mypage/applications/read/{sq}` | `@PutMapping("/read/{companyApplicationSq}")`(`:46`) | ✅ |
| 합격/불합격 | `PUT /mypage/applications/apply/{sq}` body `{companyApplicationStatusCd}` | `@PutMapping("/apply/...")` `@RequestBody CompanyApplication.getCompanyApplicationStatusCd()`(`:54-59`) | ✅ JSON·필드명 일치 |

> ★주목: **기업 측 합격(502)/불합격(503) 액션이 여기엔 실제 구현돼 있음**(`AffiliationApplicantsClient.tsx:71-83,149-156`).
> check-project.md가 "프로젝트 지원 액션 모달군 전체 스텁"이라 한 것과 별개 경로 — 마이페이지 지원자현황의 합격처리는 멀쩡함. (혼동 주의.)

---

## 3. 소속 인원 관리 (AffiliatedMembersPage ↔ AffiliatedMembersClient)

스텁 아님. `CompanyController @RequestMapping("/companies")`:

| 동작 | Next 호출 | 백엔드 | 일치 |
|---|---|---|---|
| 목록 조회 | `GET /companies` (page/size/searchType/keyword) | `@GetMapping` + `CompanyMemberSearchRequest` | ✅ |
| 퇴사 처리 | `PATCH /companies` body `{userSq, newStatus:'퇴사'}` | `@PatchMapping` `@RequestBody CompanyStatusRequest{userSq, newStatus}`(`CompanyStatusRequest.java`) | ✅ 필드명 일치 |
| 응답 필드 | members/page/totalPages + 항목 userNm/resumeTtl/leavedYn/userSq/careerYr/skillTagNms/careerStartDt/EndDt | `CompanyMemberResponse` + `CompanyMemberVo` 동일 | ✅ |

- **경미(P3):** 리스트 React key가 `member.id`(`AffiliatedMembersClient.tsx:93`)인데 `CompanyMemberVo`엔 `id` 없음(있는 건 `userSq`/`resumeSq`) →
  key가 전부 undefined → React 중복 key 경고/렌더 글리치 가능. 데이터 유실 아님. `userSq`로 교체 권장.
- ⚠️ **값 수준 미추적:** `newStatus:'퇴사'` 한글 리터럴을 `CompanyService.updateMemberStatus`가 그대로 해석하는지(코드값 변환 여부)는 서비스 로직이라 추적 안 함 — 9번 QA에서 실제 퇴사 반영 확인 필요.

---

## 4. 프로젝트 공고 목록 (AffiliationProjectListPage ↔ AffiliationProjectsClient)

스텁 아님. 조회성(골격만 점검). `GET /projects/companies`, `GET /projects/companies/status`, 삭제 `DELETE /projects/{sq}` — 모두 `ProjectController`에 존재(`:66,74,90`). 경로 일치, 페이지네이션/필터/검색 골격 정상.
- ⚠️ 미추적: 상태 필터 값(`all`/`recruiting`/`closed`/`scheduled`)을 `CompanyFilterRequest`가 어떻게 매핑하는지는 조회성이라 가볍게 넘김 — QA 시 카운트/필터 결과만 눈으로 확인.

---

## 5. 소속 정보 수정 (AffiliationEditPage ↔ AffiliationEditClient)

스텁 아님. **계약 전부 일치.** `InformationEditController @RequestMapping("/mypage/edit")`:

| 동작 | Next 호출 | 백엔드 | 일치 |
|---|---|---|---|
| 조회 | `GET /mypage/edit/affiliation/info` | `@GetMapping("/affiliation/info")`(`:139`) | ✅ |
| 저장 | `POST /mypage/edit/affiliation/update` (JSON) | `@PostMapping` `@RequestBody AffiliationInfoUpdateRequestDTO`(`:161`) | ✅ |
| 모집 해제 | `POST /mypage/edit/affiliation/recruiting/cancel` | `@PostMapping(...)`(`:150`) | ✅ |
| 프로필 이미지 | `POST .../profile-image/update` multipart `file` | `@RequestParam("file") MultipartFile`(`:202-205`) | ✅ 필드명 `file` 일치 |
| 이미지 삭제 | `DELETE .../profile-image` | `@DeleteMapping`(`:220`) | ✅ |

저장 페이로드 키 11종(userPhoneNum/companyUrl/zonecode/address/detailAddress/sigunguCode/latitude/longitude/companyGreetingTxt/tagNm/companyIsRecruitingYn)이
`AffiliationInfoUpdateRequestDTO`와 **1:1 일치**. (sigunguCode 문자열→Long 강제변환, lat/lon number→Double — 무해.)

- **경미:** 조회 응답에서 Next가 읽는 `d.joinDt`·`d.profileImageUrl`은 `AffiliationInfoResponseDTO`에 없음(있는 건 `companyProfileImageUrl`) →
  undefined지만 **둘 다 화면 미표시/미사용**(이미지 표시는 `companyProfileImageUrl` 사용) → 무해.
- ※ 이 페이지는 check-mypage.md에서 `companyRolePages` 가드 **양쪽 구멍**으로 분류됨 → 인증경계(10번 백로그) 사안, 본 동작검증 범위 밖.

---

## 다음 확인 필요 항목 / 추가 열람 안 한 파일과 이유

**다음 확인(런타임·값 수준):**
- [ ] 프로젝트 폼 **스킬 피커 붕괴를 브라우저로 실증**(정적 분석상 `s.toLowerCase()`가 객체에서 throw). 등록 시도 → 400 재현.
- [ ] 인원관리 `newStatus:'퇴사'` 한글 리터럴이 실제 퇴사로 반영되는지(서비스 코드값 변환 여부).
- [ ] 프로젝트 목록 상태필터(`recruiting/closed/scheduled`) 카운트 정확도.

**의도적으로 열람 안 함:**
- 백엔드 인증/인가·시큐리티 설정 — 규칙상 범위 밖(10번 백로그).
- `CompanyService`/`ProjectService`/`AffiliationService` 등 **서비스 내부 로직** — 계약(엔드포인트/DTO) 대조 목적 외 미열람.
- 개인 전용(이력서 등) — [check-mypage.md](check-mypage.md)에서 완료, 재열람 안 함.
- 일반 **프로젝트 지원 액션 모달군**(`ApplyStatusModal`/`ResumeSelectModal`/`InterviewSelectModal` 등) — check-project.md의 P0 별도 트랙. 본 문서의 "지원자 현황 합격처리"와는 다른 경로라 재열람 안 함.

---

## ★기업 전용 수정 필요 목록 (우선순위)

**P0 — 등록 차단**
1. 프로젝트 폼 **스킬 옵션 구조 불일치**: `GET /projects/forms`의 `skills`(그룹 객체 `{parentSkillTagNm, childSkillTagNms[]}`)를
   Next가 평면 `string[]`로 소비 → 사용/우대 기술 피커 붕괴 → `@NotEmpty` 위반으로 **모든 등록/수정 400**. Vue의 `SkillSelectModal`식 그룹 처리 복원 필요.

**P1 — 기능 누락(복원)**
2. 인터뷰 가능 시간 선택(`InterviewTimeModal`) 미이관 — `interviewTime` 항상 `[]`.
3. 지하철역 검색(`SubwaySearchModal`, Kakao) 미이관 — 입력 readOnly 스텁. (progress.md P1과 동일.)
4. 지역(시/구) 캐스케이드 셀렉트 제거 — 우편번호로 대체됨(축소). 복원 여부는 기획 판단.

**P2 — 검증 갭(정합성)**
5. 프로젝트 폼 제출 검증 누락: 단가·근무형태·모집직군·사용/우대기술·상세내용. 백엔드 제약(`@NotNull`/`@NotEmpty`)과 어긋나 400 유발. Vue 14필드 검증 이식.

**P3 — 경미**
6. 인원목록 React key를 `member.id`(부재) → `member.userSq`로 교체.
7. 프로젝트 수정 프리필 시 우편번호/시군구 미복원(`ExistProjectVo`에 필드 부재 — 백엔드 VO 보강 필요, 양쪽 공통 한계).
