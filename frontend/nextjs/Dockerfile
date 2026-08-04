# ---------- deps ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- build ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 🔴 NEXT_PUBLIC_* 은 빌드 타임에 번들로 인라인되고, next.config.ts 의 rewrites 도
#    빌드 시점 값으로 고정된다(standalone 은 런타임에 config 를 다시 읽지 않는다).
#    따라서 이 값들은 런타임 env 가 아니라 반드시 빌드 ARG 로 들어와야 한다.
ARG API_INTERNAL_BASE_URL=http://freelancer-api-server:8081/api
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_NAVER_SITE_VERIFICATION
ARG NEXT_PUBLIC_GA_ID
ENV API_INTERNAL_BASE_URL=$API_INTERNAL_BASE_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_NAVER_SITE_VERIFICATION=$NEXT_PUBLIC_NAVER_SITE_VERIFICATION \
    NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=4096

RUN npm run build

# ---------- runtime ----------
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache tzdata curl \
 && cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime \
 && echo "Asia/Seoul" > /etc/timezone
ENV TZ=Asia/Seoul \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# standalone 산출물은 server.js + 최소 node_modules 만 담고 있다(전체 복사 대비 수백 MB 절약).
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
