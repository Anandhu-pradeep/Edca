# Architecture Overview

The Arcade Backend follows a modular monolith architecture. It is designed to be highly maintainable, scalable, and supportive of concurrent development by multiple teams.

## Modular Package Structure
We organize the code by **feature/domain** rather than strictly by technical layer. This means everything related to a specific business capability lives in the same package hierarchy. 

**Root Package:** `com.arcade.backend`

**Feature Modules (Examples):**
- `users/`: User management.
- `auth/`: Authentication and security.
- `learning/`: Course delivery and progress tracking.

*Note: Business modules will be implemented independently by different teams.*

## Internal Layered Architecture
Within each feature module, we apply a strict layered architecture:

- `controller/`: REST APIs and web endpoints. Handles HTTP routing and validation.
- `service/`: Core business logic. Interfaces and their implementations.
- `repository/`: Data access layer (Spring Data JPA interfaces).
- `entity/`: Database domain models (JPA Entities).
- `dto/`: Data Transfer Objects for API requests and responses.
- `mapper/`: Translates between Entities and DTOs.
- `exception/`: Feature-specific error definitions and handlers.

## Guiding Principles
1. **Dependency Inversion**: Services should depend on abstractions (interfaces), not implementations.
2. **Constructor Injection**: Use standard constructor injection for Spring beans (or Lombok's `@RequiredArgsConstructor`). Avoid `@Autowired` on fields.
3. **No Cross-Domain Entity Linking**: Try to minimize hard JPA relationships (e.g., `@OneToMany`) across different top-level domains. Instead, reference entities by ID. This ensures loose coupling and prepares the system for potential future microservice extraction.
4. **Clear Boundaries**: If the `learning` module needs user data, it should interact with a `UserService` interface, not directly query the `UserRepository`.

## Future Scalability
While this is currently a monolith, the strict separation of feature domains ensures that we have well-defined bounded contexts. If the application scales to a point where a domain needs independent deployment or scaling, we can extract that module into a microservice with minimal refactoring.
