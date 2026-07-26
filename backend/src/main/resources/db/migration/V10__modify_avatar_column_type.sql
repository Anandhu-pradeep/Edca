-- V10__modify_avatar_column_type.sql
-- Change avatar column type to TEXT to allow large Base64 encoded images or long URLs

ALTER TABLE users ALTER COLUMN avatar TYPE TEXT;
