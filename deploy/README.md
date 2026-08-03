# deploy/

실서버(CasaOS) 배포 구성.

**절차·롤백·문제 해결은 `docs/배포-가이드.md` 를 볼 것.** 이 파일은 구성 요약이다.
서버 구조(도메인·컨테이너·경로)는 `docs/서버-인프라-현황.md` 에 있다.

## 구성

| 파일 | 용도 |
|---|---|
| `docker-compose.yml` | 백엔드(jar 마운트) + FO(Next.js 이미지 빌드) |
| `.env.example` | 운영 값 템플릿. `.env` 로 복사해 채운다(**커밋 금지**) |

BO 는 여기 없다. 정적 파일이라 `/DATA/freelancer_project/admin/` 내용만 교체하면 되고
기존 nginx 컨테이너를 그대로 쓴다.

## 배포 방식

```
백엔드  jar 교체 + 새 컨테이너로 갈아타기   롤백: 기존 컨테이너 다시 start
BO     정적 파일 교체                      롤백: 백업 tar 복원
FO     새 컨테이너 + NPM 포트 전환          롤백: NPM 을 8082(구 Vue)로
```

기존 컨테이너(`freelancer-api-server` 등)는 **정지만 하고 지우지 않는다** — 그게 롤백 수단이다.

## 빠른 시작

```bash
cd ~/freelancer/deploy
cp .env.example .env && vi .env
docker network inspect freelancer-admin --format '{{range .Containers}}{{.Name}} {{end}}'  # redis 확인
docker stop freelancer-api-server
docker compose up -d --build
docker compose ps
```

전환 후 **Cloudflare Purge Everything 필수.** 잊으면 배포가 안 된 것처럼 보인다.

## 주의

- `SPRING_PROFILES_ACTIVE=prod` 가 없으면 Security 설정이 아예 활성화되지 않는다
  (`SecurityConfigDev`/`Prod` 둘 다 `@Profile` 이 걸려 있다)
- `API_INTERNAL_BASE_URL` 에 공개 도메인을 넣으면 Next rewrite 가 자기 자신을 가리켜 무한 루프가 된다
- `NEXT_PUBLIC_*` 과 `API_INTERNAL_BASE_URL` 은 **빌드 타임에 이미지로 구워진다** — 바꾸면 `--build` 필수
- `FILE_ENCRYPT_KEY` 를 바꾸면 기존 첨부를 복호화할 수 없다
- 컨테이너 시간대는 KST 고정. UTC 면 모집 마감 판정이 9시간 어긋난다
