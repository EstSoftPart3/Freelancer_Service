# Java 21 JDK 기준 (프로젝트 자바 버전에 맞춰 변경 가능)
FROM eclipse-temurin:21-jdk-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일 복사
ARG JAR_FILE=build/libs/*.jar

COPY ${JAR_FILE} app.jar

# Spring Boot 포트 노출
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]