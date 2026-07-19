# API Response Format

To ensure consistency for frontend consumers, the Arcade Backend follows a standardized approach for successful API responses.

## Successful Responses

For successful operations (`2xx` status codes), the API returns the **bare object/data payload directly** without wrapping it in a generic `"success": true` or `"data": { ... }` envelope.

### Rationale
- **Simplicity:** HTTP status codes already dictate the success or failure of a request. Wrapping every response in `{ "data": ... }` adds unnecessary nesting that frontend clients must unwrap.
- **REST Best Practices:** Returning the entity directly aligns closely with standard REST principles.

### Example: Fetching a User
**Endpoint:** `GET /api/v1/users/1`
**Status Code:** `200 OK`

```json
{
  "id": 1,
  "username": "arcade_gamer",
  "email": "gamer@arcade.example.com",
  "age": 25
}
```

### Example: Fetching a List of Users
**Endpoint:** `GET /api/v1/users`
**Status Code:** `200 OK`

```json
[
  {
    "id": 1,
    "username": "arcade_gamer"
  },
  {
    "id": 2,
    "username": "player_two"
  }
]
```

### Implementing in Controllers
Simply return your DTO directly in the `ResponseEntity` (or directly from the controller method if relying on default status codes).

```java
@GetMapping("/{id}")
public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
    UserResponse response = userService.getUserById(id);
    return ResponseEntity.ok(response);
}
```

*Note: For paginated responses, we return standard Spring Data `Page<T>` objects, which naturally provide their own envelope containing `content`, `pageable`, `totalElements`, etc.*
