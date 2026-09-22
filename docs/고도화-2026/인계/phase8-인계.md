# Phase 8 인계 — 새 세션에서 여기서부터 시작

> 작성 2026-07-31 (Phase 5·6·7 종결 시점) · 다음은 **Phase 8 — 봇 더미데이터 자동화**

---

## ✅ Phase 8 종결 (2026-08-03) — 이 문서는 기록용이다

**PR #320 머지 완료**(머지 커밋 `cbd6919a`), 이슈 #319 종료, 브랜치 삭제, Epic #298 체크 완료.
**다음 세션은 Phase 9(실서버 배포)를 진행한다** — `docs/고도화-실행계획.md` 의 Phase 9 절과
메모리 `project_prod_deployment.md` 부터 읽을 것.

남은 것은 코드가 아니라 운영이다 — BO `게시물 관리 > 커뮤니티 시드` 에서 실전 200건 투입.
초기엔 `과거에 분산`, 이후 매일 `오늘 하루` 모드.

---

## ⚠️ 2026-07-31 갱신 — 아래 4·5절 계획은 폐기됐다

**사용자가 "돈이 들지 않게" 를 요구해 방식을 전면 변경했다.**
Claude API 를 호출하는 `scripts/dummy-bot/` 은 **만들지 않았다.**

대신 **BO 화면 기능**으로 구현했다 — 외부 AI(무료 채팅)로 콘텐츠를 만들어
BO `/contents/board/seed` 에 JSON 을 붙여넣으면 서버가 작성자·작성일시·카테고리·
채택상태를 배분해 등록한다. 회수 버튼도 같은 화면에 있다.

- 이슈 **#319**, **PR #320 OPEN**(base `NextJs`), 커밋 `56a7e9de`
- 신규 API `/admin/seed` (prompt · preview · commit · revoke)
- **DB 스키마 변경 없음**
- 아래 **3절(글쓰기 계약)** 은 FO API 기준이라 이 기능과는 무관하다.
  시더는 `AdminSeedMapper` 의 전용 INSERT 를 쓴다.

**남은 것 — 사용자가 직접 실행할 DB 작업 2건**
1. `!python "C:/dev/Freelancer_Service/docs/phase8-seed-precheck.py"` (조회 전용)
2. `!python "C:/dev/Freelancer_Service/docs/phase8-bot-accounts.py" --apply` (봇 5→25개)

상세는 메모리 `project_enhancement_roadmap.md` 의 Phase 8 절을 볼 것.

---

## 1. 첫 3분

```bash
git -C C:/dev/Freelancer_Service branch --show-current   # NextJs 여야 함
git -C C:/dev/Freelancer_Service log --oneline -3        # cd8c8b49 (PR #318 머지)가 최상단
gh issue view 298 --json body                            # Epic 체크리스트 — 8만 남음
```

읽을 문서: `docs/고도화-실행계획.md` 의 **Phase 8** 섹션.

**Phase 5·6·7 은 전부 종결됐습니다** — PR #316·#318 머지, 이슈 #315·#317 종료, 브랜치 삭제 완료.
육안검증도 끝났고 피드백 수정까지 확정됐습니다. 되돌아볼 것 없습니다.

## 2. 블로커 없음 — 바로 착수 가능

Phase 8 의 유일한 선결 조건이던 **봇 계정이 이미 만들어져 있습니다.**

| 계정 | user_sq | 비밀번호 | 닉네임 |
|---|---|---|---|
| `bot_01` | 149 | `{{BOT_PW}}` | 현장지기 |
| `bot_02` | 150 | `{{BOT_PW}}` | 공정관리 |
| `bot_03` | 151 | `{{BOT_PW}}` | 안전제일 |
| `bot_04` | 152 | `{{BOT_PW}}` | 도면쟁이 |
| `bot_05` | 153 | `{{BOT_PW}}` | 현장기록 |

전원 로그인 확인했고, `bot_01` 로 실제 글을 써서 등록·삭제까지 검증했습니다.
(공식 관리자 계정은 `estsw_admin` / user_sq 148 / `{{CORP_PW}}`)

**일괄 회수 SQL** — 봇 글을 한 번에 내리는 근거입니다:
```sql
UPDATE TBL_BOARD_M SET board_is_deleted_yn='Y' WHERE user_sq IN (149,150,151,152,153);
```
계정 자체를 지우려면 `python docs/phase7-accounts.py --rollback`.

## 3. 🔴 계획서에 없는 제약 — 실제 호출로 확인한 것

`POST /api/board` 는 **`skillTagsJson` 과 `categoryCd` 둘 다 필수**입니다.

계획서에는 `skillTagsJson` 만 적혀 있는데, **Phase 4 에서 카테고리가 필수화**되어 하나 더 늘었습니다.
빠뜨리면 `400 "카테고리를 선택해주세요."` 가 떨어집니다.

```
multipart/form-data
  ttl            제목
  description    본문 HTML
  skillTagsJson  "[]"          ← 봇은 스킬태그를 쓰지 않으므로 빈 배열
  categoryCd     3201          ← 필수. 봇 프롬프트가 함께 고르게 할 것
  normalTags     ""            ← 콤마 조인, 빈 문자열 허용
```

**카테고리 코드**: 3201 자유 / 3203 현장정보 / 3204 기능요청 / 3205 정보
(3202 '일반'은 비활성 — 게시판 이름과 중복이라 Phase 4 에서 뺐습니다)

**현장정보(3203)를 고르면** FO 글쓰기 폼이 기본 양식을 주입합니다
(`frontend/nextjs/components/community/boardTemplates.ts`). 봇이 그 카테고리로 쓸 거면
양식 형태에 맞춰 생성하는 편이 목록에서 자연스럽습니다.

## 4. Phase 8 계획 요약 (상세는 계획서)

```
scripts/dummy-bot/
  src/{index,auth,generate,post}.ts, src/prompts/, src/state.json, logs/
  .env.example   (실제 .env 는 gitignore)
```

- **모델**: `claude-opus-5`. 하루 20건이면 비용은 무시할 수준. 더 줄이려면 `claude-haiku-4-5`
- **Message Batches API**: 하루치를 한 배치로 넣으면 토큰 50% 할인. 야간 cron 과 궁합이 좋음
- **구조화 출력**: `output_config.format` 에 JSON Schema(`title`/`category`/`body_html`/`tags`).
  opus-5 는 prefill 이 400 이므로 이 방식을 쓸 것
- `stop_reason === 'refusal'` 체크 후 스킵 (`content[0]` 무조건 접근 금지)
- **남용 방지**: `MAX_POSTS_PER_RUN=25` 상한 + 락파일, `state.json` 에 최근 제목 해시로 중복 차단,
  `TARGET_BASE_URL` 기본값 `localhost:3000`, **봇은 글 작성만**(조회·추천·댓글 금지 — 베스트글 순위 오염 방지),
  첫 2주 `DRY_RUN=true` 로 품질 육안 검수

> Claude API 를 쓰는 코드를 작성하기 전에 **`claude-api` 스킬을 먼저 읽을 것.**
> 모델 ID·파라미터·배치 API 사용법이 거기 있습니다.

## 5. 실행 환경

| 대상 | 포트 | 기동 |
|---|---|---|
| 백엔드 | 8080 | `cd backend && ./gradlew bootRun` (run_in_background) |
| FO | 3000 | `cd frontend/nextjs && npm run dev:clean` ← **언제나 dev:clean** |
| BO | 5173 | `cd frontend/react_js && npm run dev` (5173 고정 — CORS) |

**포트 점유를 먼저 확인할 것.** 이전 세션 프로세스가 살아 있으면 새 코드가 아닌 구버전으로
검증하게 됩니다(이 세션에서 두 번 겪었습니다).
`Get-NetTCPConnection -LocalPort 8080 -State Listen` → `Stop-Process -Id <pid> -Force`.
FO 는 3000 이 점유되면 **조용히 3001 로 밀립니다.**

## 6. 사소하지만 걸리는 것 — `routeTree.gen.ts`

BO 의 `frontend/react_js/src/routeTree.gen.ts` 는 빌드/dev 때 자동 생성되는 파일인데,
줄바꿈(LF↔CRLF) 차이로 **항상 `modified` 로 남습니다.** `git checkout --` 로도 안 지워집니다.

`git pull` 이 이걸로 막히면:
```bash
git stash push -- frontend/react_js/src/routeTree.gen.ts
git pull
git stash drop
```
내용 자체는 라우트를 추가하면 다시 생성되므로 버려도 됩니다.

## 7. 검증할 때 밟은 함정

- **한글이 깨진다**: Git Bash 에서 `curl -d '{"ttl":"한글"}'` 은 cp949 로 나가 서버가 400/500 을 냅니다.
  JSON 은 `python` 으로 UTF-8 파일에 쓰고 `--data-binary @file`, multipart 는 `-F "ttl=<file.txt"`.
- **출력도 깨진다**: 결과를 UTF-8 파일로 쓰고 `cat` 하거나 `sys.stdout.reconfigure(encoding='utf-8')`.
- **`!` 는 bash 히스토리 확장**: 비밀번호에 `!` 가 있으면 큰따옴표 안에서도 문제가 될 수 있습니다.
- **`gh` 는 PowerShell 로 부를 것** (Bash 툴로 부르면 "Resource temporarily unavailable").
  `gh pr merge` 는 이 세션에서 정상 동작했습니다.
- **PowerShell 에서 `gh` 성공 메시지가 빨간 에러처럼 보입니다** — stderr 를 감싸서 그런 것이고 실패가 아닙니다.

## 8. 남은 데이터 흔적

- VOC 시드: sq **167·168**(공개), **172**(비공개·답변1), **173**(비공개, 메일 링크 확인용)
- 게시판 시드: sq 156~163(Phase 4 카테고리별 2건), 164, 171 은 삭제됨
- 프로젝트: sq 119 를 수정·삭제·복구 테스트에 썼고 **전부 원복**했습니다

## 9. 작업 방식 (이 세션에서 확인된 것)

- **"알아서 진행"** — 컨펌이 필요한 것만 모아 넘기고 나머지는 판단해서 끝까지 진행합니다.
- **육안검증은 사용자가 직접** 합니다. API 로 확인 가능한 것은 미리 다 확인하고,
  "브라우저로만 알 수 있는 것"만 체크리스트로 남깁니다.
- 컨펌 항목은 **결정 + 왜 그렇게 정했는지**를 함께 적습니다.
- 피드백을 받으면 **원인부터 규명**합니다 — 이 세션에서 "API 2건 vs 화면 0건" 을 파다가
  종료일 당일이 마감으로 잡히는 진짜 버그를 찾았습니다.
