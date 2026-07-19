# OpenAPI & Swagger Configuration

The Arcade Backend uses **SpringDoc OpenAPI** to automatically generate API documentation for all REST controllers.

## Why it Exists
OpenAPI (formerly Swagger) serves as the live contract between the backend and frontend. It eliminates guesswork about request payloads, response structures, and available endpoints. Frontend developers rely on this to understand how to interact with the API and can even use generators to create TypeScript clients automatically.

## Accessing Swagger UI
When running the application locally (`./mvnw spring-boot:run`), the Swagger UI is available at:

[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

## How to Document Endpoints
SpringDoc automatically reads your `@RestController` classes, mapping annotations (like `@GetMapping`), and `@RequestBody` objects.

You can enhance the documentation using annotations on your controllers and methods:
```java
@Tag(name = "Users", description = "User management APIs")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Operation(summary = "Get a user by ID", description = "Returns user details based on the provided ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) { ... }
}
```

## Global API Versioning
All our APIs are versioned from the start. **Every controller** must map to a route prefixed with `/api/v1`.
Examples:
- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/content`
