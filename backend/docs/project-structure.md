# Project Structure

This document explains the purpose of the top-level directories and critical files in the Arcade Backend repository.

```
arcade-backend/
├── src/
│   ├── main/
│   │   ├── java/com/arcade/backend/
│   │   │   └── The root package for all Java source code. It contains the main application class and all feature-based modules (e.g., auth, users, content).
│   │   │
│   │   └── resources/
│   │       ├── application.yml        # Global/shared configuration and profile activation.
│   │       ├── application-dev.yml    # Configuration specific to local development.
│   │       ├── application-prod.yml   # Configuration specific to the production environment.
│   │       ├── db/migration/          # Directory containing all Flyway SQL migration scripts.
│   │       └── static/                # Static assets (if any are served by the backend).
│   │
│   └── test/
│       └── java/com/arcade/backend/   # Root directory for all unit and integration tests, mirroring the main package structure.
│
├── docs/                              # Project documentation including setup, architecture, and database guides.
│
├── pom.xml                            # Maven build configuration, dependency management, and build plugins.
│
└── README.md                          # High-level overview of the project.
```

## Key Concept: Feature Modules
The `src/main/java/com/arcade/backend` directory is organized by feature, not by layer. This means you will find folders like `users`, `auth`, and `learning` at the root. This structure helps isolate business domains and makes the codebase easier to navigate for multiple development teams.
