# Bean Validation

The Arcade Backend uses **Jakarta Bean Validation** (Hibernate Validator implementation) to validate incoming request payloads before they reach the business logic layer.

## How to Use Validation
When defining a DTO (Data Transfer Object) for a request payload, apply standard validation annotations to its fields.

```java
public record CreateUserRequest(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    String username,

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email format")
    String email,

    @NotNull
    @Positive
    Integer age
) {}
```

### Triggering Validation in Controllers
To tell Spring to validate the payload, you **must** use the `@Valid` annotation on the `@RequestBody` parameter in your controller method.

```java
@PostMapping
public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
    // If we reach here, the request is valid!
    return ResponseEntity.ok(userService.createUser(request));
}
```

If validation fails, Spring throws a `MethodArgumentNotValidException`, which is automatically intercepted by our `GlobalExceptionHandler` and translated into a standard `400 Bad Request` JSON error response detailing the failed fields.
