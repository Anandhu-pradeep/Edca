# Arcade Backend - Setup Guide

This guide details the prerequisites and steps to run the Arcade Backend locally.

## Prerequisites

- **Java**: Java 21 or higher.
- **Maven**: Ensure you use the provided Maven wrapper (`./mvnw`).
- **PostgreSQL**: Version 14 or higher running locally (or via Docker).

## PostgreSQL Setup

# 1. Install PostgreSQL

# 2. Create database
createdb arcade

# 3. (Optional) Export environment variables
export DB_URL=jdbc:postgresql://localhost:5432/arcade
export DB_USERNAME=postgres
export DB_PASSWORD=postgres

# 4. Run
./mvnw spring-boot:run

## Running the Project

To run the application using the Maven Wrapper:

```bash
./mvnw spring-boot:run
```

To run with a specific profile (e.g., `prod`):

```bash
export SPRING_PROFILES_ACTIVE=prod
export DB_URL=jdbc:postgresql://<prod-host>:5432/arcade
export DB_USERNAME=<username>
export DB_PASSWORD=<password>
./mvnw spring-boot:run
```

## Next Steps After Starting

Once the application is running, you can access the following foundational endpoints:

- **Swagger UI (API Documentation):** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **Actuator Health Check:** [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- **API Base Path:** All REST APIs are versioned under `/api/v1` (e.g., `/api/v1/users`).

## Common Troubleshooting

- **Connection Refused**: Ensure PostgreSQL is running on port 5432.
- **Flyway Migration Checksum Mismatch**: If you alter a migration file that has already been applied locally, Flyway will fail. You must drop the `flyway_schema_history` table and reset your schema if you need to rewrite history in a local dev environment (though you should avoid altering applied migrations).
- **Missing Dependencies**: Run `./mvnw clean install` to forcefully redownload dependencies.
