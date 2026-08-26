#!/usr/bin/env bash
# 2026-08-26 오픈 준비 배포 (P7) — 서버에서 실행한다.
#   bash ~/freelancer/deploy/deploy-20260826.sh
#
# 사전 조건 (로컬에서 이미 끝내 둠)
#   ~/freelancer/backend/backend-0.0.1-SNAPSHOT.jar.new   새 백엔드 jar
#   /tmp/fo.tgz                                           FO 소스(node_modules·.next 제외)
#   /tmp/bo.tgz                                           BO dist (운영 API 주소 박힘)
#
# 되돌리기
#   jar   : ~/freelancer/backend/backend-0.0.1-SNAPSHOT.jar.bak-20260826
#   FO소스 : ~/freelancer/frontend/nextjs.old
#   전체   : docs/배포-가이드.md 3장(롤백)
set -euo pipefail

FR=~/freelancer
step() { echo; echo "======== $* ========"; }
fail() { echo "🔴 FAIL: $*"; exit 1; }

# ---------------------------------------------------------------- 0. 사전 확인
step "0. 사전 확인"
[ -f "$FR/backend/backend-0.0.1-SNAPSHOT.jar.new" ] || fail "새 jar 이 없다"
[ -f /tmp/fo.tgz ] || fail "/tmp/fo.tgz 가 없다"
[ -f /tmp/bo.tgz ] || fail "/tmp/bo.tgz 가 없다"
[ -f "$FR/deploy/.env" ] || fail ".env 가 없다"
echo "OK"

# ---------------------------------------------------------------- 1. FO 소스 교체
# 🔴 덮어쓰기가 아니라 통째로 갈아끼운다.
#    구 버전의 app/icon.tsx · apple-icon.tsx · opengraph-image.tsx 가 남아 있으면
#    새로 들어온 icon.png 계열과 메타데이터 라우트가 충돌한다.
step "1. FO 소스 교체"
rm -rf "$FR/frontend/nextjs.old"
[ -d "$FR/frontend/nextjs" ] && mv "$FR/frontend/nextjs" "$FR/frontend/nextjs.old"
mkdir -p "$FR/frontend/nextjs"
tar xzf /tmp/fo.tgz -C "$FR/frontend/nextjs"
ls "$FR/frontend/nextjs/app" | grep -iE 'icon|opengraph|favicon' || true
ls "$FR/frontend/nextjs/app" | grep -qE '^(icon|apple-icon|opengraph-image)\.tsx$' \
  && fail "구 .tsx 아이콘 생성기가 남아 있다"
for f in public/img/brand/logo-horizontal.png public/img/ads/ad-1.webp app/icon.png; do
  [ -f "$FR/frontend/nextjs/$f" ] || fail "$f 가 없다"
done
echo "OK — 브랜딩·광고 자산 포함 확인"

# ---------------------------------------------------------------- 2. 백엔드 jar 교체
# 실행 중인 JVM 이 읽고 있는 파일을 덮어쓰면 안 되므로 rename 으로 바꾼다.
step "2. 백엔드 jar 교체"
cd "$FR/backend"
mv -f backend-0.0.1-SNAPSHOT.jar backend-0.0.1-SNAPSHOT.jar.bak-20260826
mv -f backend-0.0.1-SNAPSHOT.jar.new backend-0.0.1-SNAPSHOT.jar
ls -la backend-0.0.1-SNAPSHOT.jar*

# ---------------------------------------------------------------- 3. 백엔드 재기동
step "3. 백엔드 재기동"
cd "$FR/deploy"
docker compose up -d --force-recreate backend
for _ in $(seq 1 40); do
  [ "$(curl -s http://localhost:8081/api/actuator/health || true)" = '{"status":"UP"}' ] && break
  sleep 5
done
curl -s http://localhost:8081/api/actuator/health; echo
docker logs freelancer-api 2>&1 | grep -E 'profile is active' | tail -2
docker logs freelancer-api 2>&1 | grep -q 'The following 1 profile is active: "prod"' \
  || fail 'prod 프로파일이 아니다 — Security 가 비활성이므로 중단'

# ---------------------------------------------------------------- 4. FO 이미지 빌드
# 🔴 DOCKER_BUILDKIT=0 — compose 의 build.network: estsoft 를 BuildKit 이 지원하지 않는다.
#    네트워크가 필요한 이유는 sitemap·rss 가 빌드 시점에 백엔드를 호출하기 때문이다.
step "4. FO 이미지 빌드 (몇 분 걸린다)"
DOCKER_BUILDKIT=0 docker compose build frontend-next

# ---------------------------------------------------------------- 5. BO 정적파일 교체
# uploads 는 컨테이너 마운트 지점이라 지우지 않는다.
step "5. BO 정적파일 교체"
find "$FR/admin" -mindepth 1 -maxdepth 1 ! -name uploads -exec rm -rf {} +
tar xzf /tmp/bo.tgz -C "$FR/admin"
ls -la "$FR/admin"
ls "$FR/admin/assets" | grep -q 'apply-seed' || fail '봇 지원 시드 번들이 없다'

# ---------------------------------------------------------------- 6. 전체 기동
step "6. 전체 기동"
docker compose up -d
sleep 30
docker compose ps

# ---------------------------------------------------------------- 7. 검증
step "7. 검증"
echo -n "backend health : "; curl -s http://localhost:8081/api/actuator/health; echo
curl -s -o /dev/null -w 'FO(8082)  : %{http_code}\n' http://localhost:8082/
curl -s -o /dev/null -w 'BO(8083)  : %{http_code}\n' http://localhost:8083/
echo -n "FO 런타임 env  : "
docker exec freelancer-next node -e 'console.log(process.env.API_INTERNAL_BASE_URL)'
echo "sitemap <loc>  : $(curl -s http://localhost:8082/sitemap.xml | grep -c '<loc>')  (8이면 실패, 100+ 면 정상)"
echo
echo "======== 완료 ========"
echo "외부 검증은 로컬에서 이어서 한다."
