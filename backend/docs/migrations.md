# Database Migrations (Flyway)

We use **Flyway** for database migrations to ensure reliable schema version control across all environments.

## Strategy
- **Hibernate `ddl-auto` is strictly disabled.** Spring Boot will NOT auto-generate or modify schemas. All schema changes must go through Flyway.
- Migrations are applied automatically when the Spring Boot application starts.

## Migration Files Location
All migration scripts reside in:
`src/main/resources/db/migration/`

## Naming Convention
Flyway strictly enforces naming conventions. Migrations must follow this pattern:
`V<Version>__<Description>.sql`
*(Note the double underscore `__` separating the version and description)*

**Examples:**
- `V1__initial_schema.sql`
- `V1.1__add_user_roles.sql`
- `V2__create_courses_table.sql`

## Best Practices
1. **Never edit an applied migration**: Once a migration has been merged into the `main` branch or applied to a shared database, **never** modify its contents. Doing so will cause Flyway checksum validation to fail on deployment.
2. **Always write forward-only migrations**: If you make a mistake in `V2__xxx.sql`, do not edit `V2`. Create `V3__fix_xxx.sql` to correct the mistake.
3. **Keep migrations small**: Each migration should represent a logical, atomic change. Do not bundle massive schema overhauls into a single file unless absolutely necessary.
4. **Test locally**: Always start the application locally to verify your migration runs successfully before committing.

## Creating a New Migration
1. Navigate to `src/main/resources/db/migration/`.
2. Look at the latest version number.
3. Create a new file incrementing the version (e.g., if `V4__...` exists, create `V5__...`).
4. Add your standard PostgreSQL DDL/DML statements.
