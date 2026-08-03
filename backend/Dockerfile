# ⚠️ 현재 운영 배포 경로에서는 런타임 스테이지를 쓰지 않는다.
#    서버의 백엔드는 eclipse-temurin:21-jdk 컨테이너(freelancer-api-server)가
#    /DATA/freelancer_project/backend 를 /app 으로 마운트해 `java -jar` 하는 방식이라,
#    배포가 jar 교체 + 컨테이너 재시작으로 끝난다.
#    다만 **jar 을 만들 때 build 스테이지는 유용하다**(서버에 JDK 가 없어도 빌드된다):
#      docker build --target build -t fl-backend-build . \
#        && docker create --name t fl-backend-build && docker cp t:/workspace/build/libs ./out && docker rm t
#    자세한 절차는 docs/배포-가이드.md 참조.
#
# ---------- build ----------
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# 의존성 레이어를 소스와 분리해 캐시한다 — src 만 바뀌면 재다운로드하지 않는다.
COPY gradle gradle
COPY gradlew build.gradle settings.gradle ./
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies > /dev/null 2>&1 || true

COPY src src
# 테스트는 로컬 DB·Redis 를 요구하므로 이미지 빌드에서는 제외한다.
RUN ./gradlew --no-daemon clean bootJar -x test

# ---------- runtime ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 🔴 컨테이너 기본 시간대는 UTC 다. 모집 마감 판정(CURDATE)·시드 작성일시 분산 등
#    날짜 기준 로직이 9시간 어긋나므로 반드시 KST 로 맞춘다.
RUN apk add --no-cache tzdata curl \
 && cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime \
 && echo "Asia/Seoul" > /etc/timezone
ENV TZ=Asia/Seoul

RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/build/libs/*.jar app.jar

# 업로드 파일 저장 경로(볼륨 마운트 지점). 마운트를 빠뜨리면 재배포 때 첨부가 사라진다.
RUN mkdir -p /app/uploads && chown -R app:app /app
USER app

EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
