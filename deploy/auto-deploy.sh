#!/bin/sh
# 서버가 체크아웃한 브랜치에 새 커밋이 있으면 받아서 다시 빌드·배포한다. cron 으로 주기 실행한다.
# 새 이미지 빌드가 끝난 뒤 컨테이너를 교체하므로 빌드가 실패하면 기존 컨테이너가 그대로 돈다.
# shortcut: 빌드 실패 시 재시도하지 않는다(서버 부하 방지), 다음 push 또는 수동 실행으로 다시 배포한다.
set -eu
cd "$(dirname "$0")/.."

BRANCH=$(git symbolic-ref --short HEAD)
git fetch -q origin "$BRANCH"
git merge-base --is-ancestor "origin/$BRANCH" HEAD && exit 0

# 배포 전용 폴더라 추적 파일을 원격 브랜치에 그대로 맞춘다(.env 는 추적하지 않아 남는다)
git reset -q --hard "origin/$BRANCH"
echo "$(date '+%F %T') 배포 시작 $(git rev-parse --short HEAD)"
docker compose -f deploy/docker-compose.yml up -d --build
echo "$(date '+%F %T') 배포 완료"
