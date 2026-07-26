-- V9__add_onboarding_profile_fields.sql
-- Add onboarding profile and skill calibration columns to users table

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
ADD COLUMN IF NOT EXISTS location VARCHAR(150),
ADD COLUMN IF NOT EXISTS gender VARCHAR(30),
ADD COLUMN IF NOT EXISTS college VARCHAR(200),
ADD COLUMN IF NOT EXISTS degree VARCHAR(150),
ADD COLUMN IF NOT EXISTS grad_year VARCHAR(20),
ADD COLUMN IF NOT EXISTS target_role VARCHAR(150),
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS resume_name VARCHAR(255);

CREATE TABLE IF NOT EXISTS user_tech_stack (
    user_id UUID NOT NULL,
    skill VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, skill),
    CONSTRAINT fk_user_tech_stack FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
