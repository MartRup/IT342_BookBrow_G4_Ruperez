# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache Maven dependencies separately from source code
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw
RUN mvn -B dependency:go-offline -q

# Build the application (skip tests — tests run in CI, not in Docker build)
COPY src src
RUN mvn -B clean package -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Tune JVM for low-memory environments (Render free tier = 512 MB RAM)
ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
ENV PORT=8080

EXPOSE 8080

# Health check — waits up to 2 min for the app to start
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/v1/auth/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
