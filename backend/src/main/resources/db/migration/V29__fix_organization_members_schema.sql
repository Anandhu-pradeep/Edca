-- Fix organization_members table that was created without BaseEntity columns
-- The table existed before V22 and was not updated due to IF NOT EXISTS

-- Add missing id column as primary key
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS id UUID;
-- Generate UUIDs for existing rows
UPDATE organization_members SET id = gen_random_uuid() WHERE id IS NULL;
-- Make id NOT NULL and PRIMARY KEY
ALTER TABLE organization_members ALTER COLUMN id SET NOT NULL;
-- Drop old primary key if it exists on (organization_id, user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'organization_members'
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE organization_members ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Add missing is_active column
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add missing created_at column (rename joined_at if exists, otherwise add new)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organization_members' AND column_name = 'joined_at'
    ) THEN
        ALTER TABLE organization_members RENAME COLUMN joined_at TO created_at;
    ELSE
        ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Add missing updated_at column
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Ensure unique constraint on (organization_id, user_id) exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'organization_members'
        AND constraint_name = 'uk_org_user'
    ) THEN
        ALTER TABLE organization_members ADD CONSTRAINT uk_org_user UNIQUE (organization_id, user_id);
    END IF;
END $$;
