# ============================================================
#  Image unique : Angular compilé dans le JAR Spring Boot.
#  Un seul service à héberger, un seul port.
# ============================================================

# ---------- 1. Interface Angular ----------
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
# Le build écrit directement dans les ressources du backend
RUN npx ng build --configuration production --output-path=/app/static

# ---------- 2. API Spring Boot ----------
FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /app
COPY pom.xml ./
RUN mvn -B dependency:go-offline
COPY src/ ./src/
COPY --from=frontend /app/static/ ./src/main/resources/static/
RUN mvn -B -DskipTests package

# ---------- 3. Image finale ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend /app/target/*.jar app.jar
# L'hébergeur fournit PORT ; 8081 sert de repli en local.
ENV PORT=8081
EXPOSE 8081
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
