-- V1__initial_schema.sql
-- Initial Flyway migration

-- We can create a dummy table to ensure migrations are running correctly,
-- but a simple comment is enough for flyway to execute and create the schema history table.
-- Let's create a minimal test table to verify it works, or just a comment.
-- I'll create a simple dummy table that can be dropped later if needed.

CREATE TABLE IF NOT EXISTS flyway_test_setup (
    id SERIAL PRIMARY KEY,
    setup_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
