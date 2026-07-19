-- V6__add_oauth_provider.sql

-- Add auth provider tracking columns
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN auth_provider_id VARCHAR(255);

-- Allow password to be null for OAuth2 users
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
