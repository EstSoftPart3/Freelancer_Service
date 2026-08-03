# ⚠️ 현재 운영 배포 경로에서는 쓰지 않는다.
#    서버의 BO 는 nginx 컨테이너(freelancer-admin-server)에 정적 파일을 볼륨으로 꽂는 방식이라,
#    배포가 `dist/` 내용을 /DATA/freelancer_project/admin/ 에 덮어쓰는 것으로 끝난다.
#    이 Dockerfile 은 BO 를 독립 컨테이너로 전환할 때를 위한 것이다. — docs/배포-가이드.md 참조
#
# ---------- build ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Vite 는 VITE_* 를 빌드 타임에 인라인한다 — 런타임 env 로는 바꿀 수 없다.
# 기본값 '/api' 는 아래 nginx 가 같은 오리진에서 백엔드로 프록시한다는 전제다(CORS 없음).
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---------- runtime ----------
FROM nginx:1.27-alpine
RUN apk add --no-cache tzdata curl \
 && cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime \
 && echo "Asia/Seoul" > /etc/timezone
ENV TZ=Asia/Seoul

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
