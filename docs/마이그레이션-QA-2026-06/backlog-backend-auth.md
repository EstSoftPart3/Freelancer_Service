# 백로그: 백엔드 인증 경계 (마이그레이션과 분리)

> ⚠️ 이 문서는 **백로그**다. 지금 코드를 고치지 않는다. 마이그레이션 QA 완료 후 재개.

## 1. 한 줄 요약
dev 프로파일 백엔드 인증이 전역·핸들러 두 층 모두 비어 있어 프로젝트 상세/글쓰기가 비인증·타역할에 노출. 마이그레이션과 무관한 별개 백엔드 이슈.

## 2. 코드 근거
- `JwtAuthenticationFilter.java:73` — `EXCLUDE_URLS`를 `uri::startsWith`로 매칭 → `/api/projects`·`/api/board`·`/api/qna` 접두사 하위 전부 인증 면제.
- `SecurityConfigDev.java:62` — admin 외 `.anyRequest().permitAll()` (역할 검사 없음).
- `ProjectService.java:326-366` — `fetchProject`가 토큰 null이어도 상세 전체 반환 (userType 분기 없음).
- 메서드 보안 어노테이션(`@PreAuthorize` 등) 백엔드 전체 0건.
- 상세 판정·표는 [check-auth-guards.md](check-auth-guards.md) **6. 백엔드 방어선 검증** 섹션 참조.

## 3. dev/prod 어긋남 (둘 다 손봐야 함)
- **dev: 과잉 개방** — `EXCLUDE_URLS` 접두사 면제 + `permitAll`로 보호 대상까지 열림.
- **prod: 과잉 차단** — `SecurityConfigProd`의 `.anyRequest().authenticated()`가 공개 목록 조회(게시판/프로젝트 목록)까지 인증 요구 → 정상 동작 불가.
- 한쪽만 고치면 안 됨. 공개/보호 정책을 **하나의 기준**으로 정의해 dev·prod 양쪽에 일관 적용해야 함.

## 4. 착수 시 첫 단계
전체 엔드포인트 **공개/보호 매트릭스** 설계부터 시작 → `backend-auth-matrix.md` 작성.
(엔드포인트 × {공개/로그인필요/역할별} 정리 후, 그 매트릭스를 dev/prod 설정과 필터에 반영.)

## 5. 마이페이지 권한 — 양쪽 구멍 (Vue·Next 둘 다 프론트 가드 없음)

> 마이그레이션 누락이 아님. Vue 라우터 가드(`userRolePages`/`companyRolePages`)에 **원래 없던** 페이지들.
> 마이페이지 userType 구분이 프론트에 원래 없었으니 **백엔드가 막아야 함**. 근거: [check-mypage.md](check-mypage.md), `frontend/vue_js/src/fo/router/index.js:308-316`.

- 소속 정보 수정 `AffiliationEdit` (기업 전용) — Vue `companyRolePages` 미포함 + Next 가드 없음 → 백엔드 역할 검사 필요.
- 지원자 현황 `AffiliationApplicantList` (기업 전용) — Vue `companyRolePages` 미포함 + Next 가드 없음 → 백엔드 역할 검사 필요.
- 이력서 목록 `ResumeList` (개인 전용) — Vue `userRolePages` 미포함 + Next 가드 없음 → 백엔드 역할 검사 필요.
- 이력서 등록 `ResumeFormNew` (개인 전용) — Vue `userRolePages` 미포함 + Next 가드 없음 → 백엔드 역할 검사 필요.
- 이력서 수정 `ResumeFormEdit` (개인 전용) — Vue `userRolePages` 미포함 + Next 가드 없음 → 백엔드 역할 검사 필요.
- 소속 정보 `AffiliatedInfo` (개인 전용) — Vue는 로그인 가드(`authRequiredPages`)만 있고 role 가드 없음 + Next 가드 없음 → 백엔드 역할 검사 필요.
- 소속 지원 내역 `AffiliatedJobApplications` (개인 전용) — Vue `userRolePages` 미포함 + Next 가드 없음 → 백엔드 역할 검사 필요.
- 소속 스크랩 내역 `AffiliatedScrap` (개인 전용) — Vue `userRolePages` 미포함 + Next 가드 없음 → 백엔드 역할 검사 필요.

## 6. 상태
**미착수** / 마이그레이션 QA 완료 후 재개 예정.
