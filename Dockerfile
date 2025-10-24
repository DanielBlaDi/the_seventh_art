# ---------- build ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copia solo el proyecto Maven, no todo el repo
COPY Project/pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

COPY Project/src ./src
RUN mvn -q -DskipTests package && \
    cp target/*.jar target/app.jar

# ---------- run ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-Dspring.profiles.active=docker","-jar","/app/app.jar"]

