-- V8__add_avatar_column.sql
-- Add avatar column to users table for storing profile picture URLs (e.g. Google OAuth2 avatar)

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);
