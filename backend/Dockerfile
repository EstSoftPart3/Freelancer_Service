# 빌드 환경 세팅
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# 빌드 캐시를 위해 필요한 파일들 먼저 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src

# gradlew 실행 권한 부여 및 프로젝트 빌드 (테스트 제외)
RUN chmod +x ./gradlew
RUN ./gradlew bootJar -x test

# 실제 실행 환경
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 1단계에서 빌드된 jar 파일만 쏙 빼서 가져오기
COPY --from=builder /app/build/libs/*.jar app.jar

# 서버 포트 개방 (필요 시 8080 변경 가능)
EXPOSE 8080

# 스프링 부트 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
