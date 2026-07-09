# SEO 배포·검색엔진 등록 가이드

SEO 전면 도입(PR #293)과 prod Security 설정 정비 이후, **실제 배포 시 사람이 해야 하는 작업**을 순서대로 정리한 문서다.
아래 1~2번을 빠뜨리면 배포해도 SSR·sitemap·메타데이터가 전부 빈 값으로 폴백되어 SEO가 무력화된다.

## 1. 백엔드 — prod 프로파일로 기동

```bash
SPRING_PROFILES_ACTIVE=prod ./gradlew bootRun   # 또는 배포 환경 변수로 지정
```

- `application.yml`은 단일 파일이고 프로파일에 따라 Security 설정만 갈린다
  (`SecurityConfigDev` ↔ `SecurityConfigProd`).
- prod 설정은 기본 차단 + 필요한 경로만 개방:
  - 공개 GET: `/projects`·`/board`·`/qna`·`/notice`·`/community`·`/answer`·`/affiliation` 조회
  - 비로그인 계정 플로우: 로그인·회원가입·이메일 인증·아이디/비밀번호 찾기
  - 관리자: `/admin/login`·`/admin/refresh-token`만 공개, 나머지 `/admin/**`은 ROLE_ADMIN
- CORS 허용 origin은 `SecurityConfigProd.corsConfigurationSource()`에 하드코딩되어 있다:
  `https://job.estsw.co.kr`(FO), `https://admin-job.estsw.co.kr`(BO).
  **도메인이 바뀌면 이 빈을 수정해야 한다.**

## 2. 프론트(Next.js) — 운영 환경변수 3개

| 환경변수 | 값 | 미설정 시 |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | 운영 백엔드 URL (예: `https://job.estsw.co.kr/api`) | `http://localhost:8080/api` 폴백 → **SSR·sitemap·RSS 전멸** (`lib/fetchers.ts`, `lib/api.ts`) |
| `NEXT_PUBLIC_SITE_URL` | 실서비스 도메인 (예: `https://job.estsw.co.kr`) | `https://freelancer-service.com` 폴백 → canonical/sitemap/OG URL이 전부 엉뚱한 도메인 |
| `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` | 네이버 소유확인 content 값 (아래 3번에서 발급) | 네이버 소유확인 불가 (메타태그 미출력) |

`NEXT_PUBLIC_*`은 **빌드 타임에 인라인**되므로 값을 바꾸면 `npm run build` 재빌드가 필요하다.

## 3. 네이버 서치어드바이저 등록 (배포 후)

https://searchadvisor.naver.com

1. 웹마스터 도구 → 사이트 등록 (실 도메인 입력)
2. 소유확인 → **"HTML 태그" 방식** 선택 → `<meta name="naver-site-verification" content="X">`의 X 값 복사
3. X를 `NEXT_PUBLIC_NAVER_SITE_VERIFICATION`에 넣고 재빌드·재배포 (`app/layout.tsx`가 메타태그 자동 렌더)
4. 서치어드바이저에서 소유확인 완료
5. 요청 → 사이트맵 제출: `/sitemap.xml`
6. 요청 → RSS 제출: `/rss.xml`
7. 검증 → robots.txt 검증, 주요 URL 몇 개 "웹 페이지 수집" 요청

## 4. 구글 서치콘솔 등록 (배포 후)

https://search.google.com/search-console

1. 도메인 속성 추가 (DNS TXT 레코드 인증 권장 — 메타태그 불필요)
2. sitemap 제출: `/sitemap.xml`
3. JobPosting 리치결과 상태 모니터링 (색인 → 채용공고 리포트)

## 5. 배포 후 확인 체크리스트

비로그인(시크릿 창 또는 토큰 없는 curl) 기준:

- [ ] `GET /api/projects?page=1&size=10` → 200
- [ ] `GET /api/board?page=1&size=10&sortType=latest` → 200
- [ ] `GET /api/community/boards?boardType=all&page=1&size=10&sortType=latest` → 200
- [ ] `GET /api/notice?page=1&size=10&sortType=latest` → 200, `GET /api/affiliation` → 200
- [ ] `POST /api/me` (토큰 없이) → 401, `GET /api/admin/users` (토큰 없이) → 401
- [ ] `https://<도메인>/sitemap.xml` — 프로젝트/게시글 URL이 채워져 있는지
- [ ] `https://<도메인>/rss.xml`, `https://<도메인>/robots.txt` 응답 확인
- [ ] 프로젝트 상세를 시크릿 창에서 열어 페이지 소스에 title·JSON-LD(JobPosting)가 박혀 있는지
- [ ] FO 로그인·BO 관리자 로그인 정상 동작 (CORS 에러 없는지 브라우저 콘솔 확인)

## 6. 모니터링·후속 (선택)

- 색인은 등록 후 며칠~몇 주 소요. 서치콘솔 "페이지 색인 생성" / 서치어드바이저 "수집 현황"에서 확인
- QnA 구조화 데이터 QAPage 승격: 백엔드가 QnA 상세 응답에 답변 **본문**을 내려주면
  `lib/jsonld.ts`에 QAPage 빌더 추가 (acceptedAnswer = `isAdoptedYn === 'Y'`) — 현재는 DiscussionForumPosting
- sitemap URL이 5만 건에 근접하면 `app/sitemap.ts`를 `generateSitemaps()` 분할로 전환
