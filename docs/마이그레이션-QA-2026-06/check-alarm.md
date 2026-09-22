# 알람(알림) 서비스 Vue → Next 대조 검증

> 검증 세션. 추측 없이 실제 코드만 근거. 프론트엔드만 검증(백엔드 인증/생성 로직은 백로그 범위 밖).
> 작성 기준일: 2026-06-26

## 0. 범위 / 대상 파일

`docs/migration-map.md`에는 **알림 전용 행이 없음**. 실제 코드 검색 결과 알림 기능은 양쪽 모두
**공통 헤더 컴포넌트 1곳에 완결**되어 있음(별도 페이지/스토어/훅 없음).

| 코드베이스 | 파일 |
|---|---|
| Vue | [CommonHeader.vue](frontend/vue_js/src/fo/components/common/CommonHeader.vue) |
| Next | [CommonHeader.tsx](frontend/nextjs/components/common/CommonHeader.tsx) |
| API 래퍼 (Vue) | [axios.js](frontend/vue_js/src/axios.js) |
| API 래퍼 (Next) | [lib/api.ts](frontend/nextjs/lib/api.ts) |

- Vue 검색에서 잡힌 `alertStore.js` / `CommonAlert.vue`는 **토스트(alert)** 기능이지 알림(notification)이 아님 → 대상 아님.
- 다른 기능 파일은 열지 않음(지침 준수).

---

## ★ 0-1. 최우선 점검: 스텁/미구현 여부

**미구현 스텁 없음.** "준비 중입니다" toast나 빈 핸들러 없음. 6개 핸들러 전부 실제 API를 호출함.

| 핸들러 | Vue | Next | 실제 동작 |
|---|---|---|---|
| 목록 조회 | `fetchNotifications` ([axios.js:487](frontend/vue_js/src/fo/components/common/CommonHeader.vue#L487)) | `fetchNotifications` ([api.ts:71](frontend/nextjs/components/common/CommonHeader.tsx#L71)) | ✅ 실호출 |
| 안읽음 수 | `fetchUnreadCount` (L498) | `fetchUnreadCount` (L80) | ✅ 실호출 |
| 읽음 처리 | `markAsRead` (L509) | `markAsRead` (L89) | ✅ 실호출 |
| 단건 삭제 | `deleteNoti` (L522) | `deleteNoti` (L104) | ✅ 실호출 |
| 모두 읽음 | `markAllAsRead` (L535) | `markAllAsRead` (L116) | ✅ 실호출 |
| 전체 삭제 | `deleteAllNoti` (L546) | `deleteAllNoti` (L127) | ✅ 실호출 |

---

## 1. 댓글 알림 생성/수신 흐름

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| **알림 생성 트리거**: 프론트에 알림 생성 호출 **없음**. 생성은 백엔드 부수효과(댓글 등록 API)로 추정 | ✅구현(동일) | — | 양쪽 모두 프론트엔드는 생성에 관여 안 함. 댓글→알림 생성은 백엔드 책임(이번 검증 범위 밖) |
| **수신 = 목록 조회** `GET /notifications` | ✅구현 | [CommonHeader.tsx:73](frontend/nextjs/components/common/CommonHeader.tsx#L73) | 동일 엔드포인트 |
| **안읽음 수** `GET /notifications/unread-count` | ✅구현 | [tsx:82](frontend/nextjs/components/common/CommonHeader.tsx#L82) | 동일 엔드포인트 |
| **수신 타이밍**: 마운트 시 1회 + 로그인 상태 변화 시 재조회. **폴링/SSE/WebSocket 없음** | ✅구현(동일) | [tsx:61-69](frontend/nextjs/components/common/CommonHeader.tsx#L61) | 양쪽 모두 **실시간 아님**. 드롭다운/팝오버를 다시 열어도 재조회 안 함 → 페이지 재로드 전까지 stale. Vue·Next 동일하므로 마이그레이션 결함 아님 |
| **안읽음 표시**: `unreadCount > 0`이면 벨에 점(dot) + 패널 헤더에 배지 숫자 | ✅구현 | [tsx:160](frontend/nextjs/components/common/CommonHeader.tsx#L160), [tsx:268](frontend/nextjs/components/common/CommonHeader.tsx#L268) | 동일. 항목별 미열람은 `notificationReadYn==='N'`으로 좌측 강조선+배경색 |

---

## 2. 알림 클릭 → 게시글 이동 / 읽음 처리

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| **클릭 핸들러**: 항목 div `@click=markAsRead`, 내부 링크가 `notificationTargetUrl`로 이동 (둘 다 발생) | ✅구현 | [tsx:170](frontend/nextjs/components/common/CommonHeader.tsx#L170), [tsx:178](frontend/nextjs/components/common/CommonHeader.tsx#L178) | 구조 동일. Vue `router-link :to`, Next `<Link href>` |
| **라우팅 경로 = 서버 제공값** `noti.notificationTargetUrl`. 프론트가 경로를 조립하지 **않음** | ⚠️확인필요 | [tsx:178](frontend/nextjs/components/common/CommonHeader.tsx#L178) | 경로는 백엔드가 내려준 문자열 그대로 사용. **프론트엔드 측 경로 생성 로직 차이 없음**(양쪽 동일). 단, 백엔드가 저장한 URL이 Vue 시절 경로면 Next에서 깨질 수 있음 → 아래 3-1 참고 |
| **이동 후 읽음 처리**: 클릭 시 `markAsRead` → `PATCH /notifications/{sq}` 후 `unread-count` 재조회 | ✅구현 | [tsx:89-102](frontend/nextjs/components/common/CommonHeader.tsx#L89) | 동일. 이미 읽음(`Y`)이면 early-return. Optimistic UI(즉시 `Y` 반영) 동일 |
| **삭제 버튼은 이동/읽음 막음**: `@click.prevent.stop` | ✅구현 | [tsx:104-106](frontend/nextjs/components/common/CommonHeader.tsx#L104) | Vue `.prevent.stop` ↔ Next `e.preventDefault()+e.stopPropagation()` 동일 |

---

## 3. 목록/전체읽음/삭제 등 부가 기능

| Vue 동작 규칙 | 상태 | Next 위치 | 어떻게 다른지 |
|---|---|---|---|
| **모두 읽음** `PATCH /notifications` → 전 항목 `Y`, unread=0 | ✅구현 | [tsx:116-125](frontend/nextjs/components/common/CommonHeader.tsx#L116) | 동일. 전파 차단(`stopPropagation`) 동일 |
| **전체 삭제** `DELETE /notifications` → 목록 비움, unread=0 | ✅구현 | [tsx:127-136](frontend/nextjs/components/common/CommonHeader.tsx#L127) | 동일 |
| **단건 삭제** `DELETE /notifications/{sq}` → 해당 항목 제거 후 unread 재조회 | ✅구현 | [tsx:104-114](frontend/nextjs/components/common/CommonHeader.tsx#L104) | 동일 |
| **빈 상태** "새로운 알림이 없습니다." + 벨 슬래시 아이콘 | ✅구현 | [tsx:203-208](frontend/nextjs/components/common/CommonHeader.tsx#L203) | 동일(Vue `bi-bell-slash` ↔ Next `lucide Bell`) |
| **"전체보기" → `/mypage/notifications`** | ✅구현(동일) | — | Vue에서 **주석 처리되어 비활성**([vue:236-242](frontend/vue_js/src/fo/components/common/CommonHeader.vue#L236)). Next엔 아예 없음 → 양쪽 모두 미노출, 동일 |

---

## 추가 점검 결과

### A. 성공/실패 판정 방식 — **HTTP 상태 기반 (양쪽 동일)**
- Vue `api.$get/$patch/$delete`은 axios 응답을 그대로 반환하고 비-2xx는 axios가 throw → `try/catch`.
- Next는 raw axios(`api.get` 등) 사용, 동일하게 비-2xx throw → `try/catch`.
- **양쪽 모두 `body.status` 같은 바디 필드를 검사하지 않음.** 성공/실패 = HTTP 상태코드.
- 실패 시 동작도 동일: `console.error`만 하고 사용자 토스트 없음(조용히 실패).

### B. 응답 키/필드명 불일치 — **불일치 없음** ★(반복 패턴 점검 통과)
`find-id의 regDt`, `스크랩 target` 같은 값 어긋남 패턴이 **알림에는 없음**. 인터페이스 필드가 완전 일치:

| 필드 | Vue | Next ([tsx:24-30](frontend/nextjs/components/common/CommonHeader.tsx#L24)) |
|---|---|---|
| `notificationSq` | ✅ | ✅ |
| `notificationContentTxt` | ✅ | ✅ |
| `notificationReadYn` (`'Y'`/`'N'`) | ✅ | ✅ |
| `notificationTargetUrl` | ✅ | ✅ |
| `notificationCreatedAtDtm` (`.split('T')[0]`) | ✅ | ✅ |

- **응답 언래핑도 일치**: Vue `$get`은 `response.data` 반환→`notifications.value = res`; Next는 `const { data } = api.get(...)`(=`response.data`)→`setNotifications(data)`. **둘 다 HTTP 바디를 배열/숫자로 그대로 사용** → 래핑 깊이 불일치 없음.
- `unread-count`도 동일: 양쪽 모두 바디를 숫자로 직접 사용.

### C. 동적 라우트 경로 — **프론트 생성 로직 차이 없음 / 백엔드 저장값 의존**
- `notificationTargetUrl`은 **서버가 내려준 문자열**을 양쪽 모두 그대로 `to`/`href`에 사용. 프론트엔드가 `/board/${sq}` 식으로 조립하는 코드는 **양쪽 다 없음** → Next가 엉뚱한 URL을 *생성*할 위험은 없음.
- 단, **백엔드가 저장한 URL이 Vue 시절 경로 규칙**이면 Next에서 라우트가 바뀐 메뉴는 깨질 수 있음:
  - 댓글 알림(본 검증 핵심 시나리오): 대상은 `/board/:board_sq` → migration-map 기준 Vue·Next **경로 동일**(`app/board/[board_sq]`) → **정상 이동**. ✅
  - 그러나 `/projectListPage`→`/projects`, `/findAccount`→`/find-account` 등 **camelCase→kebab-case로 바뀐 경로**를 타깃으로 저장한 알림이 있다면 Next에서 404 가능. → 프론트만으로 확정 불가(백엔드 저장값 확인 필요).

---

## 4. 수정 필요 목록 (❌누락 / ⚠️다름 / 스텁 / 확인필요만, 우선순위순)

| # | 우선순위 | 항목 | 상태 | 근거 / 영향 | 비고 |
|---|---|---|---|---|---|
| 1 | **중** | 알림 클릭 시 `notificationTargetUrl`이 **Vue 시절 경로**(`/projectListPage`, `/findAccount` 등)로 저장돼 있으면 Next에서 404 | ⚠️확인필요 | 프론트 경로 생성 로직은 동일·정상. 위험은 **백엔드 저장값**에 한정. 댓글 알림(`/board/:sq`)은 경로 불변이라 안전 | 백엔드 알림 생성부 URL 점검 필요 → **백엔드 범위(백로그)**. 프론트 결함 아님 |
| 2 | **낮** | 알림 **실시간성 없음**: 마운트/로그인 시에만 조회, 폴링·SSE·WebSocket 없음. 패널 재오픈 시에도 재조회 안 함 | ⚠️다름(아님, 동일) | Vue·Next **동일 동작** → 마이그레이션 결함 아님. 신규 알림은 새로고침 전까지 미반영 | 원본 한계를 그대로 이식. 개선하려면 별도 과제 |
| 3 | **낮** | API 실패 시 사용자 피드백 없음(`console.error`만) | ⚠️다름(아님, 동일) | Vue·Next 동일 | 원본 동작 유지 |

### 결론
- 알림 서비스는 **충실하게 이식됨**: 6개 엔드포인트·필드명·읽음/안읽음·삭제·전체읽음·전체삭제·Optimistic UI·전파차단까지 1:1 일치.
- **스텁/미구현 없음**, **필드 불일치 없음**(find-id·스크랩류 패턴 미발견), **성공판정은 HTTP 상태 기반(동일)**.
- 유일한 실질 리스크(#1)는 **프론트가 아니라 백엔드가 저장하는 `notificationTargetUrl` 값**이며, 본 검증의 핵심 시나리오(내 글 댓글 알림 → `/board/:sq`)는 경로가 불변이라 **정상 이동**. → 프론트 수정 필요 항목은 사실상 없음.
