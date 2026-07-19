# Arcade Backend Structure

This document outlines the folder structure for the Arcade Backend, built using Spring Boot.

## Core Structure
- `src/main/java/com/arcade/backend`: Root package for Java source code.
- `src/main/resources`: Contains configuration files (`application.yml`), database scripts (`db/`), and static assets (`static/`).
- `src/test`: Root directory for tests.
- `doc`: Documentation related to the project.

## Feature-Based Packaging
The application is structured around specific domains or features. Each feature package contains the following sub-packages to separate concerns:

- `controller/`: REST APIs and web layer.
- `service/`: Business logic and service interfaces.
- `repository/`: Data access layer (e.g., Spring Data JPA repositories).
- `entity/`: JPA entities and database models.
- `dto/`: Data Transfer Objects used for API requests and responses.
- `mapper/`: MapStruct or manual mappers for converting between Entities and DTOs.
- `exception/`: Feature-specific exceptions and error handling.

### Features
- `admin/`
- `assessment/`
- `auth/`
- `certificates/`
- `common/`
- `config/`
- `content/`
- `learning/`
- `organizations/`
- `users/`
