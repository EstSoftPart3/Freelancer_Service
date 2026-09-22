# Phase 6 인계 — 새 세션에서 여기서부터 시작

> 작성 2026-07-30 (Phase 5 종료 시점) · 다음 세션은 **Phase 6 — BO 프로젝트·소속 관리**

## 1. 첫 3분에 할 것

```bash
# 현재 상태 확인
git -C C:/dev/Freelancer_Service log --oneline -5
git -C C:/dev/Freelancer_Service branch --show-current    # feat/phase-5-voc 에 있을 것
gh pr view 316 --json state,mergeable
```

읽을 문서 순서:
1. `docs/고도화-실행계획.md` 상태 보드 → **Phase 6** 섹션 (하단에 "Phase 5에서 넘어온 재료" 있음)
2. `docs/확인체크리스트-phase5.md` — **육안검증 9건이 아직 남아 있다** (사용자가 Phase 6 완료 후
   일괄 진행하기로 결정). Phase 6 검증 때 함께 진행할 것.

## 2. Phase 5 상태 — 코드는 끝, 검증만 남음

| 항목 | 상태 |
|---|---|
| 커밋 | `3593093e`(본체) + `dbf9b821`(운영자 메일) |
| 이슈 | #315 (OPEN — 육안검증 후 수동 종료) |
| PR | **#316 OPEN** (base `NextJs`) — 육안검증 후 머지 |
| 컨펌 | 6/6 확인받음 |
| 육안검증 | **0/9 — Phase 6 완료 후 일괄** |
| DB | 변경 없음. 검증 시드 sq **167·168 남아 있음(지우지 말 것)** |

### PR #316 — 사용자가 다음 세션에서 직접 머지한다 (2026-07-30 결정)
"머지는 내일 할게"라고 했다. **먼저 `gh pr view 316 --json state` 로 상태를 확인**하고:

- 이미 **MERGED** → `NextJs` 를 pull 하고 거기서 `feat/phase-6-...` 브랜치를 딴다 (정상 경로)
- 아직 **OPEN** → 머지를 기다릴지 물어볼 것. `feat/phase-5-voc` 위에 Phase 6 을 쌓으면 PR 이 겹친다.
  `gh pr merge` 는 자동 승인 가드에 막히므로 **내가 대신 머지할 수 없다** — 사용자가 직접 하거나
  `!` 접두사로 실행해야 한다.

육안검증 9건(체크리스트-phase5)은 머지 여부와 무관하게 **Phase 6 완료 후 일괄**이다.

## 3. 실행 환경 (이 세션에서 띄워둔 것 — 이미 꺼져 있을 수 있음)

| 대상 | 포트 | 기동 |
|---|---|---|
| 백엔드 | 8080 | `cd backend && ./gradlew bootRun` (run_in_background로) |
| FO | 3000 | `cd frontend/nextjs && npm run dev:clean` ← **언제나 dev:clean** |
| BO | 5173 | `cd frontend/react_js && npm run dev` (5173 고정 — CORS) |

**포트를 먼저 확인할 것.** 이 세션에서 8080·3000에 예전 프로세스가 살아 있어 새 코드가 반영되지
않은 채로 검증하다 시간을 버렸다. `Get-NetTCPConnection -LocalPort 8080 -State Listen` 으로 확인하고
필요하면 `Stop-Process -Id <pid> -Force`.

## 4. Phase 6 착수 시 바로 쓸 것

### BO 신규 화면은 `features/voc/` 를 복제
`features/board/`(12파일)보다 `features/voc/`(7파일)가 6-A·6-B에 필요한 것과 모양이 같다.
자세한 파일 목록과 함정 4건은 **계획서 Phase 6 섹션 하단**에 적어뒀다.

### 반드시 지킬 것 3가지
1. **관리자 삭제는 마스터 쿼리** — `AND user_sq = #{userSq}` 가 붙은 쿼리를 관리자 경로에서 부르면
   남의 데이터에 0행 반영 후 **조용히 성공**한다. Phase 5에서 실제로 밟을 뻔했다.
2. **목록·카운트는 `<sql>` 조각 공유** — 한쪽만 조건을 늘리면 "목록은 맞는데 뒷 페이지가 비는" 증상.
3. **`SortDirectionUtil.normalize`** — `${sortOrder}` 직접 삽입이라 SQL Injection 방지 필수.

### 공용 DB 규칙 (변함없음)
스키마 변경·데이터 정정은 **스크립트 준비 + 드라이런까지 하고 사용자에게 넘긴다.** 자동 승인 가드가
공용 DB 접속 스크립트를 `--dry-run`조차 막는다. Phase 6은 DDL이 필요 없을 가능성이 높다
(6-A는 기존 API 재사용, 6-B는 기존 `TBL_PROJECT_M` 조회·수정).

## 5. 운영 배포 전 처리 목록에 추가된 것

Phase 5에서 프로퍼티 2개가 생겼다. **운영 배포(Phase 9) 때 반드시 지정**:

```yaml
app:
  bo:
    base-url: https://admin-job.estsw.co.kr   # 접수 메일의 BO 바로가기 링크
  voc:
    notify-email: <담당자 주소>                # 미설정 시 SMTP 발신 계정으로 감
```

## 6. 사용자 작업 방식 (이 세션에서 확인된 것)

- **"알아서 진행"** — 컨펌이 필요한 것만 모아서 넘기고, 나머지는 판단해서 끝까지 진행한다.
- **육안검증은 사용자가 직접** 한다. 내가 API로 확인할 수 있는 것은 미리 다 확인하고, 사용자에게는
  "브라우저로만 알 수 있는 것"만 남긴다.
- 컨펌 항목은 **결정 내용 + 왜 그렇게 정했는지**를 함께 적는다(체크리스트-phase5 형식이 좋은 반응).
