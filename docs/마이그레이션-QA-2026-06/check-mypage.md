# 마이페이지 검증 (Vue → Next.js)

> 검증 세션 — 프론트 가드 분류 단계. 추측 없이 실제 라우터/레이아웃 코드를 직접 읽어 작성.
> 작성 기준일: 2026-06-26 · 선행 문서: [mypage-scope.md](mypage-scope.md)
> 백엔드 인증 경계는 [backlog-backend-auth.md](backlog-backend-auth.md)로 분리 — 본 문서 범위 밖.

## 권한 가드 복원 필요

Vue 라우터 가드(`companyRolePages`)에는 있으나 Next로 옮겨오며 빠진 **마이그레이션 누락** 항목.
프론트 라우트 가드(미들웨어/레이아웃 등)로 복원 필요.

**Vue 가드 출처:** `frontend/vue_js/src/fo/router/index.js:310-316` `companyRolePages`
**Next 가드 부재:** `middleware.ts` 없음 + `app/mypage/layout.tsx` 가드 없음(사이드바+children 렌더만)

| 페이지 | route name | Vue 가드 | Next 가드 | Next 경로 |
|---|---|---|---|---|
| 소속 인원 목록 | `AffiliatedMembers` | ✓ companyRolePages | ✗ | `app/mypage/affiliated-members/page.tsx` |
| 프로젝트 공고 목록 | `AffiliationProjectList` | ✓ companyRolePages | ✗ | `app/mypage/affiliation-projects/page.tsx` |
| 프로젝트 등록 | `ProjectPostPage` | ✓ companyRolePages | ✗ | `app/mypage/project-post/page.tsx` |
| 프로젝트 수정 | `ProjectPostPageWithId` | ✓ companyRolePages | ✗ | `app/mypage/project-post/[project_sq]/page.tsx` |

> 이 4개는 Vue `beforeEach`에서 `userType`이 `PERSONAL`/비로그인이면 메인 리다이렉트로 진입 차단됨
> (`router/index.js:330-336`). Next는 동일 차단 로직이 없어 URL 직접 입력 시 진입 가능.
> 동작 차이(메뉴 숨김만 vs 진입 차단)는 다음 깊은 검증 단계에서 대조.

### 분류에서 제외된 기업 전용 페이지 (가드 복원 대상 아님)

- `AffiliationEdit`(소속 정보 수정), `AffiliationApplicantList`(지원자 현황) → Vue `companyRolePages`에도 **원래 없음**.
  마이그레이션 누락이 아니라 양쪽 구멍 → [backlog-backend-auth.md](backlog-backend-auth.md)에 분리 기록.

### 개인 전용 페이지

- `ResumeList`/`ResumeFormNew`/`ResumeFormEdit`/`AffiliatedInfo`/`AffiliatedJobApplications`/`AffiliatedScrap`
  → Vue `userRolePages`에 마이페이지 항목이 **0건**(`['UserProjectSpec']`뿐). 양쪽 모두 role 가드 없음 → 백로그.

---

## 개인 전용 동작 검증 (Vue → Next 1:1, 동작만)

> 검증일: 2026-06-26 · 권한 가드는 위 섹션에서 완료, 여기선 **동작/필드/CRUD만**.
> 대상: mypage-scope.md 개인 전용 6행. 추측 없이 실제 파일만 대조.
> 읽은 파일: Vue `views/mypage/personal/{ResumeListPage, ResumeFormPage_P, AffiliatedInfoPage, AffiliatedJobApplicationsPage, AffiliatedScrapPage}.vue`
> ↔ Next `components/mypage/personal/{ResumeListClient, ResumeFormClient, AffiliatedInfoClient, AffiliatedJobApplicationsClient, AffiliatedScrapClient}.tsx`

### 1. 이력서 목록 (ResumeListPage ↔ ResumeListClient)

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| 목록 조회 `GET /mypage/resume/list?currentPage&size`, `output.output`/`output.totalCount` | ✅ | `ResumeListClient.tsx:25-36` | 동일(Next는 `userSq` 파라미터 추가만) |
| 삭제 `PATCH /mypage/resume/{sq}/delete`, **`res.status==='OK'`로 성공판정** | ⚠️다름 | `:40-51` | Next는 status 검사 없이 **HTTP 성공(try/catch)만**으로 판정 |
| 대표 설정 `PATCH /mypage/resume/representative/{sq}` | ✅ | `:53-60` | 동일 |
| 복사: confirm 모달로 **"파일 포함(예)/제외(아니오)" 선택** → `withFiles` 분기 | ⚠️다름 | `:62-70,129` | Next "복사하기"는 **항상 `withFiles:true` 하드코딩**, 포함/제외 선택 UI 없음 |
| 필드명 resumeSq/resumeTtl/resumeIsRepresentativeYn/resumeCreatedAtDtm | ✅ | `:82-107` | 동일 |
| 등록/수정 이동, 상세는 ResumeDetailModal | ⚠️다름 | `:94,122` | Vue 제목 클릭=상세 **모달**(`ResumeDetailModal`); Next는 제목/수정 모두 **수정 페이지로 이동**(상세 모달 미이관) |

### 2. 이력서 등록/수정 (ResumeFormPage_P ↔ ResumeFormClient) — ★최대 갭

스텁(토스트만)은 아님(실 API 호출). 그러나 **충실 이관이 아니라 축소 재구현**. Vue 대비 입력 항목·검증·필드명이 대거 어긋남.

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| **프로필 사진 업로드**(미리보기·삭제·10MB/1MB 체크) | ❌누락 | — | Next 폼에 사진 입력 자체가 없음 |
| **첨부파일**(다중, 기존+신규 통합, 중복방지, 10MB/1MB 체크) | ❌누락 | — | Next 폼에 첨부 입력 자체가 없음 |
| **프로젝트 이력**(`projectHistoryList`, 기종/OS/DBMS/언어/Tool/FW 스킬 분류, 펼침/접기) | ❌누락 | — | Next에 프로젝트 이력 섹션 전체 부재 |
| 제출 유효성: 제목·이름·생년월일·전화(`/^010-\d{4}-\d{4}$/`)·이메일(정규식)·주소·자기소개 필수 + 파일 1MB | ❌누락 | `:177-210` | Next `handleSubmit`에 **검증 0건**. 빈 값·잘못된 형식 그대로 전송 |
| 신규 등록 시 `GET /mypage/edit/info`로 **회원 기본정보 자동기입** | ❌누락 | `:170-175` | Next는 자동기입 없음(빈 폼) |
| 이메일: 단일 input(`resumeEmail`) + 형식검증 | ⚠️다름 | `:241-258` | Next는 `아이디@도메인드롭다운(+직접입력)` 조합으로 재구성 |
| 학력/경력/교육/자격증 입력 = **전용 모달**(학교검색·자격증검색 등) | ⚠️다름 | `Section`/draft 폼 | Next는 모달 없이 **인라인 직접입력**(검색 기능 없음) |
| 제출 페이로드 키: `educationList / careerList / trainingHistoryList / certificationList / skillTagList` | ⚠️다름(★필드명) | `:179-197` | Next는 `education / career / trainingHistories / certificates / skills` — **5개 키 전부 불일치** |
| 교육 항목 구조 `trainingProgramNm/trainingInstitutionNm/trainingStartDt/trainingEndDt` | ⚠️다름(★필드명) | `:31-35,97` | Next는 `{program, institution, period}` — 키·기간형식 모두 다름 |
| 자격증 항목 `certificationNm/certificationCd` | ⚠️다름(★필드명) | `:37-40,98` | Next는 `{certificateName, certificateDate}` |
| 제출 형식: `FormData(dto Blob + 파일)` multipart | ⚠️다름 | `:179-205` | Next는 파일이 없어 **순수 JSON** 전송 |
| 등록 `POST /mypage/resume` · 수정 `PUT /mypage/resume/{id}` · 상세 `GET /mypage/resume/{id}` | ⚠️다름(확인필요) | `:133,200,203` | Next는 `POST /resume/new` · `PUT /resume/update/{sq}` · `GET /resume/detail/{sq}` — 엔드포인트 경로 상이(백엔드 인증 트랙과 별개로 **계약 일치 확인 필요**) |
| 성공판정 | ⚠️다름 | `:198-209` | 양쪽 try/catch(HTTP) 기반은 같으나, Next는 위 검증부재로 실패를 사전에 못 거름 |

#### ★백엔드 계약 확인 (2026-06-26, 코드 대조 — register/update DTO만)

대조 대상 — 백엔드: `ResumeController.java`(`@RequestMapping("/mypage/resume")`),
요청 DTO `ResumeRequestDTO.java`. Next: `ResumeFormClient.tsx` `handleSubmit` `:177-210`.

**선결 발견 2건 — 필드명을 따지기 전에 요청이 DTO까지 도달하지 못함:**

1. **엔드포인트 경로 불일치 → 404 (모든 데이터 유실).** 백엔드 실제 매핑은
   등록 `POST /mypage/resume`(루트), 수정 `PUT /mypage/resume/{resumeSq}`,
   상세 `GET /mypage/resume/{resumeSq}`. Next는 `POST /mypage/resume/new`·
   `PUT /mypage/resume/update/{sq}`·`GET /mypage/resume/detail/{sq}` 호출
   (`ResumeFormClient.tsx:200,203,133`). `/new`·`/update/`·`/detail/` 매핑은
   `ResumeController`·`ResumeDetailController` 어디에도 없음 → 핸들러 미스 404.
   `next.config.ts` rewrite는 `/api/* → BACKEND/*` 패스스루라 경로를 교정하지 않음.
   ⇒ **필드명 일치 여부와 무관하게 요청 본문 전체가 폐기된다.**
2. **컨텐트타입 불일치.** 백엔드는 `@RequestPart("dto") ResumeRequestDTO` +
   `profileImages`/`attachments`(multipart) 형태만 받음. Next는 파일 입력이 없어
   순수 JSON(application/json) 전송 → 경로가 맞더라도 415/바인딩 실패.

**상위 객체(리스트) 키 대조** — *경로/415가 먼저 막지만, 본문이 도달한다고 가정 시:*

| 필드 | Next 전송 | 백엔드 기대 | 일치? | 불일치 시 결과 |
|---|---|---|---|---|
| 학력 | `education` | `educationList` | ❌ | 미매핑 → 무시(빈 저장) |
| 경력 | `career` | `careerList` | ❌ | 미매핑 → 무시(빈 저장) |
| 교육이력 | `trainingHistories` | `trainingHistoryList` | ❌ | 미매핑 → 무시(빈 저장) |
| 자격증 | `certificates` | `certificationList` | ❌ | 미매핑 → 무시(빈 저장) |
| 보유기술 | `skills` | `skillTagList` | ❌ | 미매핑 → 무시(빈 저장) |
| 프로젝트이력 | (없음) | `projectHistoryList` | ❌ | 폼에 입력 자체 없음 → 항상 null |
| 프로필사진 | (없음) | `profileImage`+`profileImages` | ❌ | 폼에 입력 없음 → 항상 null |
| 첨부파일 | (없음) | `attachmentList`+`attachments` | ❌ | 폼에 입력 없음 → 항상 null |
| 주소 | `address`(문자열)+top-level `detailAddress`/`zonecode`/`latitude`/`longitude` | `address`(중첩 `AddressDTO` 객체) | ❌ | 타입 불일치(String vs 객체) + 평면 4필드는 DTO에 top-level 없음 → 주소 전체 유실 |
| resumeTtl/resumeNm/resumeBirthDt/resumePhoneNum/resumeEmail/resumeGreetingTxt/resumeIsNotificationYn | 동일 | 동일 | ✅ | (스칼라 기본정보만 정상 매핑) |

**항목 내부 구조 대조** (2번 요청 항목):

- **학력 item** — Next `{educationSchoolNm, educationMajorNm, educationAdmissionDt, educationGraduationDt, educationStatusCd}`
  vs 백엔드 `EducationDTO` 동일 5필드(+ `educationSq`/`resumeSq`는 신규 시 생략 무방). → **내부 필드명 일치**(단 상위 키 `education`≠`educationList`라 리스트째 유실).
- **경력 item** — Next `{careerCompanyNm, careerDepartmentNm, careerPositionNm, careerStartDt, careerEndDt}`
  vs `CareerDTO` 동일. → **내부 일치**. 단 Next가 `yyyy-MM`(month, `:158-159`)로 보냄 → 백엔드 `LocalDate`(yyyy-MM-dd) 파싱 위험. 상위 키 `career`≠`careerList`.
- **교육이력 item** — Next `{program, institution, period}` vs `TrainingHistoryDTO {trainingProgramNm, trainingInstitutionNm, trainingStartDt, trainingEndDt}`. → **내부도 전면 불일치**(program≠trainingProgramNm, institution≠trainingInstitutionNm, 단일 `period` 문자열 vs 시작/종료 2개 LocalDate).
- **자격증 item** — Next `{certificateName, certificateDate}` vs `CertificationDTO {certificationCd, certificationNm, certificationIssuerNm}`. → **내부도 전면 불일치**(certificateName≠certificationNm, certificateDate는 대응 필드 없음, 백엔드 `certificationCd`/`certificationIssuerNm`는 Next 미전송).
- **보유기술 item** — Next `{skillTagNm, skillTagSq?}` vs `SkillTagDTO {skillTagSq, skillTagNm, parentSkillTagSq, skillTagLvl, resumeSkillSq, resumeSq}`. → 보내는 2필드(`skillTagNm`/`skillTagSq`)는 **이름 일치**, 나머지는 null 허용. 상위 키 `skills`≠`skillTagList`.

**결론(P0 #2 확정):** check-mypage가 "확인 필요"로 남긴 필드명 5종 불일치는 **사실로 확정**(미매핑→무시).
교육이력·자격증은 상위 키뿐 아니라 **항목 내부 필드까지 전면 불일치**. 주소는 평면↔중첩 구조 차이로 유실.
다만 실제 1차 원인은 **경로 불일치(404)**여서 — 현 상태에선 필드명이 맞든 틀리든 등록/수정 본문 전체가 저장되지 않음.
프로필사진·첨부·프로젝트이력은 폼 입력란 부재로 항상 null(P0 #1과 동일 결론).
스칼라 기본정보(제목/이름/생년월일/전화/이메일/자기소개/알림Yn)만 키 일치.

### 3. 소속 정보 (AffiliatedInfoPage ↔ AffiliatedInfoClient)

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| 조회 `GET /mypage/applications/info`, '소속 없음' 메시지 분기 | ✅ | `:23-31` | 동일 |
| 필드 companyNm/companyCeoNm/companyOpenDt/companyUrl/address/joinDt/companyIsRecruitingYn/profileImageUrl | ✅ | `:67-99` | 동일(표시 순서·채용뱃지 동일) |
| 탈퇴 `PATCH /mypage/applications/withdraw` + 안내 confirm | ✅ | `:33-43` | 동일 |
| 탈퇴 후 **userStore.isAffiliated='N', affiliatedCompanySq=null, localStorage 갱신** | ⚠️다름 | `:17,33-43` | Next는 `clearUser`를 **import만 하고 호출 안 함** → 탈퇴 후 소속 플래그가 새로고침 전까지 갱신 안 됨 |

### 4. 소속 지원 현황 (AffiliatedJobApplicationsPage ↔ …Client)

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| 조회 `GET /mypage/applications/user`, 필터(all/read/unread)·검색(title/name/greeting)·카운트뱃지 | ✅ | `:34-53` | 동일 |
| 성공판정 `res.status=='OK'` (목록·취소 모두) | ✅ | `:39-47,58-62` | Next도 목록은 HTTP, **취소는 `data.status==='OK'` 체크** 유지 |
| 취소 `PATCH /mypage/applications/{id}`, 상태뱃지 501지원중/502합격/503불합격, isDeleted | ✅ | `:125-138` | 동일 |
| 필드 applicationSq/companyNm/createdAt/applicantCnt/resumeTtl/readAt | ✅ | `:125-147` | 동일 |
| 회사명 클릭 → **상세 모달**(`AffiliationRequestDetailModal`) | ❌누락 | `:127` | Next는 회사명이 **클릭 불가 span**, 상세 모달 미이관 |

### 5. 소속 스크랩 내역 (AffiliatedScrapPage ↔ AffiliatedScrapClient)

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| 조회 `GET /mypage/applications/scraps`, 검색(company/tag/content) | ✅ | `:26-41` | 동일 |
| 성공판정 `res.status=='OK'` (목록·삭제 모두) | ⚠️다름 | `:33-41,45-56` | Next는 목록·삭제 **둘 다 status 검사 없이 HTTP만** |
| 삭제 `POST /affiliation/{id}/scrap` 토글 | ✅ | `:48` | 동일(타깃 키: Vue `sq` / Next `sq ?? id`) |
| 필드 companyNm/isRecruitingYn/memberCnt/tags/openDt | ✅ | `:92-111` | 동일 |
| 회사명 클릭 → **상세 모달**(`AffiliationRecruit`), `viewerSq` 저장 | ❌누락 | `:94` | Next는 회사명 **클릭 불가 span**, 상세 모달·viewerSq 미이관 |

---

## ★개인 전용 수정 필요 목록 (우선순위)

> ❌누락 / ⚠️다름 / 확인필요만 모음. ✅항목 제외.

**P0 — 데이터 유실·계약 불일치 (이력서 폼 집중)**
1. 이력서 폼 **입력 항목 누락 3종**: 프로필 사진·첨부파일·프로젝트 이력. Vue엔 있고 Next 폼엔 아예 없음 → 저장해도 데이터 누락.
2. 이력서 폼 **요청 필드명 불일치 5+종**: `educationList→education`, `careerList→career`, `trainingHistoryList→trainingHistories`(구조까지), `certificationList→certificates`(구조까지), `skillTagList→skills`. → 백엔드 계약과 맞는지 **반드시 확인**(이 한 건이 저장 실패/빈 저장 직결).
3. 이력서 폼 **유효성 검증 전무**: 필수값·전화/이메일 정규식·파일용량 체크 0건. Vue 규칙 이식 필요.
4. 이력서 폼 **엔드포인트 경로 상이**(`/new`,`/update/`,`/detail/`): 백엔드 인증 트랙과 무관하게 **요청 계약 일치 여부 확인 필요**.

**P1 — 기능 동작 누락 (복원)**
5. 이력서 폼 신규등록 시 **회원정보 자동기입**(`GET /mypage/edit/info`) 누락.
6. 소속 지원현황 **상세 모달**(`AffiliationRequestDetailModal`) 미이관 — 회사명 클릭 비활성.
7. 소속 스크랩 **상세 모달**(`AffiliationRecruit`)·`viewerSq` 미이관 — 회사명 클릭 비활성.
8. 이력서 상세 보기 모달(`ResumeDetailModal`) 미이관 — Next는 제목 클릭이 수정 페이지로 감.
9. 이력서 복사 **파일 포함/제외 선택** 누락(항상 포함).
10. 소속 탈퇴 후 **소속 상태 미갱신**(`clearUser` 호출 누락) — 새로고침 전까지 플래그 stale.

**P2 — 성공판정 방식 차이 (기록·정합성 점검)**
11. 성공판정이 Vue는 `body.status==='OK'`인데 Next가 HTTP만 보는 곳: 이력서 삭제, 소속 스크랩 목록·삭제. (지원현황 취소는 Next도 status 체크 유지 → 일관성 없음, 통일 필요.)
