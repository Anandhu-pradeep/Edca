# Exception Handling

The Arcade Backend implements a centralized global exception handling architecture via `@RestControllerAdvice`.

## Why Centralized Handling?
Instead of using `try-catch` blocks in every controller to format error responses, we let exceptions bubble up. The `GlobalExceptionHandler` intercepts these exceptions and guarantees a consistent, predictable JSON response format across all API endpoints. This standard format ensures frontend clients can reliably parse error states.

## Error Response Format
All errors return the following standardized `ErrorResponse` payload:

```json
{
  "timestamp": "2023-10-27T10:00:00.000",
  "status": 404,
  "code": "RESOURCE_NOT_FOUND",
  "message": "User not found with ID 123",
  "path": "/api/v1/users/123"
}
```

## Supported Exceptions
The common infrastructure provides standard runtime exceptions that all feature modules should utilize instead of throwing raw `RuntimeExceptions`.

- `ResourceNotFoundException`: Thrown when looking up a database entity that does not exist. Results in `404 Not Found`.
- `BadRequestException`: Thrown for invalid business logic parameters. Results in `400 Bad Request`.
- `UnauthorizedException`: Thrown for missing or invalid authentication. Results in `401 Unauthorized`.
- `ForbiddenException`: Thrown for insufficient permissions. Results in `403 Forbidden`.

### How to use them
In your services, simply throw the exception:

```java
public User getUserById(Long id) {
    return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
}
```

## Adding Custom Exceptions
If you need a highly specific error code for a domain (e.g., `CourseAlreadyPublishedException`), create it within your feature module's `exception/` package, and consider adding an `@ExceptionHandler` for it either in your feature-specific `@RestControllerAdvice` or by adding it to the `GlobalExceptionHandler` if it's broadly applicable.
