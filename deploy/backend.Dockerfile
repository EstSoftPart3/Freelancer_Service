FROM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY . .
RUN sh gradlew --no-daemon bootJar -x test

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /src/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar
CMD ["java", "-XX:MaxRAMPercentage=70.0", "-jar", "app.jar"]
