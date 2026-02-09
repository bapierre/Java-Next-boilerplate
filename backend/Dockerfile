# Use Maven with JDK 21 for building
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Use JDK 21 for runtime
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy the built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Set correct ownership
RUN chown appuser:appgroup app.jar

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Set JVM options
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseZGC -Djava.security.egd=file:/dev/./urandom"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
