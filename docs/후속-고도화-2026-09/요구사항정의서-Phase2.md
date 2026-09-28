# Phase2 요구사항정의서

> 작업이 진행될 때마다 **상태** 열을 갱신한다. 2026-09-28 운영 배포 완료(NextJs `0b23e518`).
> 작성 2026-09-15 · 브랜치 구조 `NextJs` ← `Phase2_proto_260909`(프론트, 시연용 동결) ← `Phase2_backend_260915`(백엔드 연동)
>
> 상태: ✅ 완료 · 🟡 진행 · ⬜ 예정 · ⏸ 보류

## 요약

| 대분류 | 소분류 수 | ✅ | 🟡 | ⬜ |
|---|---|---|---|---|
| 1. 공통 | 11 | 11 | 0 | 0 |
| 2. 연봉 | 31 | 30 | 0 | 1 |
| 3. 커뮤니티 | 12 | 12 | 0 | 0 |
| 4. 투표 | 6 | 6 | 0 | 0 |
| 5. 면접후기 | 7 | 7 | 0 | 0 |
| 6. 배포·운영 | 12 | 11 | 0 | 0 (⏸ 1 폐기) |

---

## 1. 공통

| 중분류 | 소분류 | 상태 | 구현 위치 | 비고 |
|---|---|---|---|---|
| 1-1 헤더 | 1단(로고) + 2단(전체 네비) 구성 | ✅ | `components/common/CommonHeader.tsx` | 47823d81 |
| | 연봉계산기·연봉순위표 강조 버튼 | ✅ | 〃 | |
| | 커뮤니티 가로 메가메뉴(6대분류 + 소분류) | ✅ | 〃 `COMMUNITY_MEGA` | 링크 클릭 시 닫힘 처리 |
| | 기업서비스 드롭다운(로그인·가입·공고관리·파트너관리) | ✅ | 〃 | |
| | "소속" → "파트너" 라벨 변경(라우트 `/affiliation` 유지) | ✅ | 〃 | |
| | 반응형 breakpoint 분리(lg 네비 / xl 검색·기업서비스) | ✅ | 〃 | 좁은 화면 겹침 버그 수정 |
| 1-2 메인페이지 | 배너 축소, 추천 프로젝트 카드 그리드(조회수순 고정) | ✅ | `components/main/MainPage.tsx` | 04768af4 |
| | 추천 게시글 카드(월간 인기 50건) | ✅ | 〃, `GET /community/best` | |
| | 인기 프로젝트 조회수·지원수 노출, 인기글 미래날짜 버그 | ✅ | 백엔드 project·community | 4ab9ec76 |
| 1-3 로그인 | 개인/기업 전용 경로 분리(`?loginType=COMPANY`), 탭 토글 제거 | ✅ | `components/auth/LoginForm.tsx` | db9c0931 |
| 1-4 공용 컴포넌트 | InfoTooltip 클릭 시 안 열리던 버그(`closeOnClick={false}`) | ✅ | `components/ui/tooltip.tsx` | |

## 2. 연봉

| 중분류 | 소분류 | 상태 | 구현 위치 | 비고 |
|---|---|---|---|---|
| 2-1 연봉계산기(C) | 필수 입력 6종(고용형태·직무·연차·지역·기술스택·연봉) | ✅ | `components/salary/SalaryCalculatorForm.tsx` | 직무·지역·스킬은 `GET /projects/forms` |
| | 선택 입력 11종(나이·학력·회사규모·회사유형·직급·팀규모·고용세부·근무형태·성과급·스톡옵션·이직횟수) | ✅ | 〃 | |
| | 기술스택 선택 모달 | ✅ | `SkillPickerModal.tsx` | |
| | **입력 3종 추가**(현재 회사명·직전 연봉·최근 이직 연월) | ✅ | 〃 | 회사명은 EMPLOYED만 노출 |
| | **로그인 필수** 게이트(비로그인 → 로그인 후 복귀) | ✅ | `SalaryAnalyzingScreen.tsx`, `LoginForm.tsx` | D화면에서 게이트, `?redirect=`로 복귀 |
| | **제출 저장 API 연동**(1인 1건, 재제출 시 갱신) | ✅ | `POST /salary/submissions` | D화면에서 애니메이션과 병행 호출 |
| | **이전 입력 불러오기**(localStorage 이력 대체) | ✅ | `GET /salary/submissions/me` | 계산기 진입 시 모달로 안내 |
| 2-2 AI 분석 중(D) | 4단계 진행 연출 + 마스코트 크로스페이드 → 리포트 자동 이동 | ✅ | `SalaryAnalyzingScreen.tsx` | 549bad4a. 이제 실제 제출 완료를 기다린 뒤 이동 |
| 2-3 연봉 리포트(E) | 내 연봉 vs 시장 평균·상위 N% | ✅ | `SalaryReportScreen.tsx`, `GET /salary/report` | |
| | 연봉 분포 히스토그램(9구간, 내 위치 표시) | ✅ | 〃 | |
| | 5년 연봉 추정(일반 / 인생 빡세게 모드) | ✅ | 〃 | 연차구간별 중앙값/상위25% 근거 |
| | 기술스택 추가 시 예상 상승률 | ✅ | 〃 | 표본 5 미만 스킬 제외 |
| | 같은 조건 개발자가 다니는 회사 | ✅ | 〃 | 실데이터만, 3명 미만이면 빈 상태 문구 |
| | **리포트 통계 API** | ✅ | `GET /salary/report` | 실표본 30 미만이면 시드 혼합, 그래도 부족하면 지역→연차 순 완화 |
| | **표본 메타 표기**("표본 N명, 실제 M명") | ✅ | 〃 | 조건 완화 여부·예시 데이터 포함 배지도 표기 |
| | **회사·이직동향 빈 상태 문구** | ✅ | 〃 | |
| 2-4 추천(E 하단 분리) | 내 기술 기반 프로젝트 추천 3건 | ✅ | `SalaryRecommendScreen.tsx`, `GET /projects` | 이미 실API |
| | 내 연봉 근접 프로젝트 3건 | ✅ | 〃 | 이미 실API |
| | 최근 3개월 이직 연봉 동향 피드 | ✅ | `SalaryReportScreen.tsx` | 실데이터만, 닉네임 첫 글자. 이제 리포트 API가 내려줌 |
| | 이직 시 예상 연봉 범위(보수·평균·적극) | ✅ | `buildJobChangeSalaryBands` | 피드 기반 순수 계산, 유지 |
| 2-5 연봉순위표(F) | 전체/직무/연차/지역 4개 기준 랭킹 20위 | ✅ | `SalaryRankingScreen.tsx`, `GET /salary/ranking` | |
| | **순위표 API**(비로그인 공개) | ✅ | `GET /salary/ranking` | |
| | **예시 데이터 포함 배지** | ✅ | 〃 | 실표본 부족 시 |
| 2-6 DB | **`TBL_SALARY_SUBMISSION_M`**(제출 1인 1건) | ✅ | `docs/도구/migrate-2026-09-salary.py` | 개발 DB 적용 완료 |
| | **`TBL_SALARY_SUBMISSION_SKILL_S`**(제출별 기술스택) | ✅ | 〃 | 개발 DB 적용 완료 |
| | **시드 4,000행**(표본 부족 조건 보정용) | ✅ | 〃 | 🔴 최초 시드는 직무·지역명이 실제 공통코드와 달라(예: "백엔드 개발자"≠"백엔드/서버개발") 재생성함. 스킬 13,919건 포함, 회사명·이직연월은 안 넣음 |
| 2-7 백엔드 | **`domain/salary` 패키지**(controller·service·mapper·entity·dto) | ✅ | `backend/.../domain/salary` | vote/interview 규약. compileJava 통과 |
| | **통계 계산기**(경험적 분포·백분위·성장률·스킬 상승폭) | ✅ | `SalaryStatsCalculator` | 실표본 30 이상이면 실데이터만, 부족하면 지역→연차 순 완화 |
| | **보안 설정**(순위표만 공개) | ✅ | `SecurityConfigProd`, `JwtAuthenticationFilter.EXCLUDE_URLS` | `GET /salary/ranking`만 permitAll, 2중 화이트리스트 반영 |
| 2-8 정리 | **가짜 생성 함수 삭제**(인터페이스만 유지) | ✅ | `lib/salaryEstimate.ts`, `lib/salaryRanking.ts` | `buildJobChangeSalaryBands`(피드 기반 순수함수)만 남김 |
| | 연봉 페이지 검색 색인 해제 여부 결정 | ⬜ | `app/salary/*/page.tsx` `robots` | 운영 배포 후에도 `noindex` 유지 중 — 결정 대기 |

## 3. 커뮤니티

| 중분류 | 소분류 | 상태 | 구현 위치 | 비고 |
|---|---|---|---|---|
| 3-1 게시판 재설계(G) | 6대분류를 실제 게시판 종류로 승격(커리어·기술·요즘회사·프로젝트·라운지 + 투표) | ✅ | f3f354cc | |
| | 게시판 종류별 기능 플래그(카테고리·비밀글·스킬태그·답변채택·관리자전용·로그인필요) | ✅ | `BoardTypeCode.java` | 하드코딩 제거 |
| | 5종 통합 컨트롤러 `/{career\|tech\|company\|teamup\|lounge}` | ✅ | `CommunityBoardController.java` | |
| | 커리어·기술소통 답변+채택 | ✅ | `AnswerService` | |
| | 공통코드 1405~1409(대분류) + 중분류 8개 신설 | ✅ | 개발 DB | 운영 적용(2026-09-28) |
| | 기존 게시글 500건 카테고리 재매핑, 레거시 3200 그룹 비활성화 | ✅ | 개발 DB | 운영 적용(2026-09-28) |
| | 프론트 게시판 메타 단일 소스화 | ✅ | `components/community/boardMeta.ts` | |
| | 5종 신규 라우트 15개(목록·등록·상세) | ✅ | `app/{career,tech,company,teamup,lounge}/**` | |
| | 카테고리 탭·안내 툴팁 문구 갱신 | ✅ | `BoardCategoryTabs`, `BOARD_CATEGORY_TIPS` | |
| | 옛 "이직" 카테고리 자동 템플릿 제거 | ✅ | `boardTemplates.ts` | |
| 3-2 어드민(BO) | 게시글·대시보드·신고 라벨 일반화 | ✅ | `AdminBoardService`, `AdminDashBoardService` | |
| 3-3 헤더 연동 | 프로젝트 공고는 기존 `/projects` 링크로 편입(데이터 무변경) | ✅ | `CommonHeader.tsx` | |

## 4. 투표

| 중분류 | 소분류 | 상태 | 구현 위치 | 비고 |
|---|---|---|---|---|
| 4-1 투표(H) | 목록(카드 그리드)·상세·등록·삭제 | ✅ | `app/vote/**`, `/votes` | 2b3cd6b4 |
| | 투표 참여 + 결과 막대(%) | ✅ | `POST /votes/{sq}/ballot` | |
| | 중복 투표 DB 차단 `UNIQUE(vote_sq, user_sq)` | ✅ | `TBL_VOTE_RECORD_S` | |
| | 마감일 지난 투표 참여 차단 | ✅ | `VoteService.castBallot` | |
| | 전용 테이블 3개(`TBL_VOTE_M`·`_OPTION_S`·`_RECORD_S`) | ✅ | 개발 DB | 운영 적용(2026-09-28) |
| | 댓글·추천·신고 없음(MVP 확정) | ✅ | — | 의도된 범위 |

## 5. 면접후기

| 중분류 | 소분류 | 상태 | 구현 위치 | 비고 |
|---|---|---|---|---|
| 5-1 면접후기(I/J) | 커리어소통과 완전 분리된 전용 도메인 | ✅ | `domain/interview`, `/interviews` | 96e07a2b |
| | 카드형 목록(키워드·회사명 검색, 정렬)·상세·삭제 | ✅ | `app/interview/**` | |
| | 작성 폼: 직무(recruitJobs)·경력 5구간 | ✅ | `app/interview/write` | |
| | 면접단계 다중선택 칩(DB 콤마 문자열) | ✅ | `InterviewService.joinStages` | |
| | 난이도 1~5 별점·분위기·제안연봉(선택) | ✅ | 〃 | |
| | 전용 테이블 `TBL_INTERVIEW_REVIEW_M` | ✅ | 개발 DB | 운영 적용(2026-09-28) |
| | 더미데이터(면접후기 10·투표 3) | ✅ | 개발 DB | 화면 검증용, 운영 이관 안 함. 운영엔 별도 시드 면접후기 100·투표 20(`seed-2026-09-28-interview-vote.py`) |

## 6. 배포·운영

| 중분류 | 소분류 | 상태 | 구현 위치 | 비고 |
|---|---|---|---|---|
| 6-1 검증 | 컴파일·타입체크·lint | ✅ | | compileJava·tsc·eslint 전부 통과 |
| | 연봉 E2E(로그인 게이트·제출·리포트·재제출·순위표·보안 401) | ✅ | | 브라우저 실제 검증 완료 — 비로그인 계산기 작성→로그인 유도→복귀 후 자동제출→리포트(표본34명·실제1명·예시데이터 배지·지역조건완화 문구·빈상태 문구 전부 정상), 순위표 전체/직무별 필터·예시데이터 배지, `GET /salary/report`·`POST /salary/submissions` 비로그인 401 |
| 6-2 코드리뷰 | 야간 cron(base=`NextJs`, Phase1 리뷰분 제외) | ⏸ | `코드리뷰-진행상황-Phase2.md` | 폐기 — 4-A 전수 코드리뷰(`d000ae7f`)·4-B 보안리뷰(`7e27f3f8`)로 대체 |
| | 판단대기 항목 처리 | ✅ | 〃 | 6건 종결(`68a2d9d5`) |
| 6-3 운영 DB 이관 | 구조 차이 + 공통코드 행 차이 확인 | ✅ | `db-diff-schema.py` | 신규 테이블 6 · 공통코드 17 추가/6 비활성 (2026-09-28) |
| | 게시판·투표·면접후기 이관 스크립트(규칙 기반 재매핑) | ✅ | `migrate-2026-09-phase2-board-vote-interview.py` | 규칙은 운영↔개발 board_sq 대조로 500건 100% 확인. 9/1 이후 운영 실게시글 0건 |
| | 운영 사본 리허설 | ✅ | | 개발 DB `--apply` 멱등 확인 + 운영 드라이런(SELECT 전용)으로 대체 |
| | 운영 백업 → 드라이런 → 적용 → 구조 차이 0 확인 | ✅ | `db-backup.py` | 백업 `C:/dev/db-backup/20260928-0936` → 적용 커밋. 연봉 시드 4,000·스킬 13,919 복사 |
| 6-4 배포 | `Phase2_backend_260915` → `NextJs` 머지·push | ✅ | | `Phase2_features_260917` 병합 `0b23e518` |
| | 백엔드 jar·FO·BO 빌드 및 배포 스크립트 | ✅ | `docs/배포-환경-인계.md` §6 | 스크립트 prod 프로파일 확인 SIGPIPE 오탐 수정 `c3aee44f` |
| | 실서버 화면 확인(헤더·게시판·투표·면접·연봉, sitemap/rss) | ✅ | | sitemap 515 · FO/BO 로그인 작성·수정·삭제 흐름 브라우저 확인 |
| | 롤백 절차 준비 확인 | ✅ | 인계 문서 §7 | jar `.bak-20260826`·`nextjs.old`·DB 백업 |
