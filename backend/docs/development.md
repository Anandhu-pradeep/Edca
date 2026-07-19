# Development Guide

This document outlines the workflow and practices for developing features in the Arcade Backend.

## Local Development Workflow

1. **Pull Latest Changes**: Always ensure you are working against the latest `main` branch.
2. **Database Setup**: Ensure your local PostgreSQL is running and your `dev` profile configuration matches your local credentials.
3. **Run Application**:
   ```bash
   ./mvnw spring-boot:run
   ```
   Flyway will automatically apply any new migrations to your local database upon startup.

## Branch Workflow
We use a standard feature branch workflow:
- `main`: The stable production-ready branch.
- Feature branches: `feature/<module-name>-<short-description>` (e.g., `feature/users-registration-api`).
- Bugfix branches: `bugfix/<issue-id>-<short-description>`.

All work must be merged into `main` via Pull Requests. Ensure your code builds locally before opening a PR.

## Common Commands

**Build without running tests:**
```bash
./mvnw clean install -DskipTests
```

**Run all tests:**
```bash
./mvnw test
```

**Run the application:**
```bash
./mvnw spring-boot:run
```

**Apply code formatting (Spotless):**
```bash
./mvnw spotless:apply
```

## API Versioning & Documentation
- All new controllers must map their routes starting with `/api/v1` (e.g., `@RequestMapping("/api/v1/auth")`).
- SpringDoc OpenAPI will automatically document your endpoints. Visit `/swagger-ui/index.html` locally to view them.

## Logging Strategy (Placeholder)
*(A centralized logging strategy using SLF4J/Logback with structured JSON logs for production will be documented here in the future.)*

## Testing Workflow
- **Unit Tests**: Write unit tests for your Services and Mappers using JUnit 5 and Mockito. Keep them fast.
- **Integration Tests**: Write integration tests for Repositories and Controllers using `@SpringBootTest` and `@DataJpaTest`.
- Ensure new features have adequate test coverage before submitting a Pull Request.
