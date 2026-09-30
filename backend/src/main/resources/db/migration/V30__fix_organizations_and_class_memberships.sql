-- V30: Comprehensive schema fix for tables created before proper Flyway migrations
-- Fixes organizations, class_memberships tables and any other missing columns

-- ============================================================
-- Fix: organizations table (missing columns from V22)
-- ============================================================
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS org_type VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS official_email VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email_domain VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);

-- ============================================================
-- Fix: class_memberships table (may not exist at all - created by V24)
-- ============================================================
CREATE TABLE IF NOT EXISTS class_memberships (
    id UUID PRIMARY KEY,
    org_class_id UUID NOT NULL REFERENCES org_classes(id),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_class_user UNIQUE (org_class_id, user_id)
);

-- ============================================================
-- Fix: user_themes table (missing created_at, updated_at if BaseEntity expected)
-- ============================================================
ALTER TABLE user_themes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE user_themes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;
