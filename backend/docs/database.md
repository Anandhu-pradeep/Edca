# Database Configuration

This project uses **PostgreSQL** as its primary relational database.

## Why PostgreSQL?
PostgreSQL was chosen for its enterprise-level stability, compliance with SQL standards, extensive feature set (like JSONB support for semi-structured data), and ability to scale securely in the cloud. It perfectly suits our multi-tenant and scalable architecture requirements.

## Configuration Details

We use Spring Profiles to separate configuration across environments.

### Local Development (`application-dev.yml`)
- The `dev` profile is active by default.
- It connects to `jdbc:postgresql://localhost:5432/arcade` with default credentials (`postgres`/`postgres`).
- Flyway is enabled to apply migrations automatically.
- Hibernate `show-sql` is enabled to facilitate debugging.

### Production (`application-prod.yml`)
- All database credentials must be injected via Environment Variables. No secrets are hardcoded.
- Hibernate SQL logging is disabled.

## Scalability Considerations
- The current setup utilizes synchronous JDBC (Spring Data JPA).
- As traffic scales, connection pooling (HikariCP, standard with Spring Boot) should be tuned based on the load.
- Avoid placing extensive business logic in database triggers or stored procedures to keep the application logic unified in the Java layer and easily scalable.
