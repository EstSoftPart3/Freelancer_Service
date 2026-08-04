# deploy/

실서버(CasaOS) 배포 구성. **2026-08-04 실제 배포 완료.**

**절차·롤백·문제 해결은 `docs/배포-가이드.md` 를 볼 것.** 이 파일은 구성 요약이다.
서버 구조(도메인·컨테이너·경로)는 `docs/서버-인프라-현황.md` 에 있다.

## 구성

| 파일 | 용도 |
|---|---|
| `docker-compose.yml` | 백엔드(jar 마운트) + FO(Next.js 이미지) + BO(nginx + 정적파일) |
| `bo-nginx.conf` | BO 컨테이너의 nginx 설정(SPA 폴백) |
| `.env.example` | 운영 값 템플릿. `.env` 로 복사해 채운다(**커밋 금지**) |
| `monitoring-uplink-patch.sh` | 서버 watchdog 에 적용한 업링크 판정 함수(적용 완료, 기록용) |

## 배포 방식 — 포트를 그대로 물려받는다

기존 컨테이너를 **정지**시키고 같은 포트로 새 컨테이너를 올린다.
→ **NPM·Cloudflare 설정 변경 0건.**

| 포트 | 기존 (2026-08-04 제거) | 신규 |
|---|---|---|
| 8081 | `freelancer-api-server` | `freelancer-api` |
| 8082 | `freelancer-web-server` (Vue) | `freelancer-next` |
| 8083 | `freelancer-admin-server` | `freelancer-bo` |

`/DATA` 파일을 **전혀 건드리지 않으므로** 별도 백업이 필요 없다.
구 컨테이너는 CasaOS 타일 정리 과정에서 삭제했고 정의는 `~/freelancer/rollback/` 에 있다.
롤백은 `docker compose down` + `docker compose -p tender_hazel -f ~/freelancer/rollback/tender_hazel-compose.yml up -d`.
배포 파일은 전부 `~/freelancer/`(estsoft 소유) → **sudo 불필요.**

## 빠른 시작

```bash
cd ~/freelancer/deploy
cp .env.example .env && chmod 600 .env && vi .env

docker stop freelancer-api-server
docker compose up -d backend                       # ① 백엔드 먼저
DOCKER_BUILDKIT=0 docker compose build frontend-next   # ② FO 빌드(백엔드 필요)
docker stop freelancer-web-server freelancer-admin-server
docker compose up -d                               # ③ 교체
```

## 함정 (전부 실제로 겪은 것)

- **`DOCKER_BUILDKIT=0` 이 필요하다** — `build.network: estsoft` 를 BuildKit 이 지원하지 않는다.
  네트워크가 필요한 이유는 `sitemap.xml` 이 **빌드 시점에 백엔드를 호출**하는 정적 프리렌더이기 때문.
  그래서 **백엔드를 먼저 띄워야 한다.** 안 하면 빈 sitemap 이 조용히 구워진다.
- **`API_INTERNAL_BASE_URL` 은 빌드 ARG 와 런타임 env 양쪽 다 필요하다.**
  `NEXT_PUBLIC_` 이 없는 변수는 번들에 인라인되지 않고 서버가 요청마다 읽는다.
  런타임 쪽을 빠뜨리면 SSR·sitemap 이 **에러 없이** 빈 값으로 폴백한다.
- **`~/freelancer/admin/uploads` 를 미리 만들어야 한다** — 없으면 BO 가
  `read-only file system` 으로 기동 실패한다(ro 마운트 안에 겹쳐 마운트하기 때문).
- **BO 는 `VITE_API_BASE_URL` 을 주고 빌드해야 한다** — 안 주면 localhost 로 나간다.
- `SPRING_PROFILES_ACTIVE=prod` 가 없으면 Security 가 아예 비활성이다(Dev/Prod 둘 다 `@Profile`).
- `FILE_ENCRYPT_KEY` 를 바꾸면 기존 첨부를 복호화할 수 없다.
- 컨테이너 TZ 는 KST 고정. UTC 면 모집 마감 판정이 9시간 어긋난다.
- **`x-casaos` 블록을 지우면 CasaOS UI 에서만 앱이 "정지"로 보인다.** 컨테이너는 멀쩡한데
  UI 에서 "시작"을 누르면 자기가 쓰던 포트라 `port is already allocated` 가 난다.
  CasaOS 는 compose 원본 파일을 다시 읽어 이 블록이 있어야 관리 대상으로 인정한다.
