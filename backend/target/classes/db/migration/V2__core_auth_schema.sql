-- V2__core_auth_schema.sql
-- Core Identity and Access Management (IAM) Tables

-- UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    lock_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- e.g., ROLE_USER, ROLE_ADMIN, ROLE_SUPER_ADMIN
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., users.read, users.write
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permissions Mapping
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_permission FOREIGN KEY(permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- User-Roles Mapping
CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_role FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Insert Default Roles
INSERT INTO roles (name, description) VALUES 
('ROLE_USER', 'Standard user role'),
('ROLE_ADMIN', 'Administrator role'),
('ROLE_SUPER_ADMIN', 'Super administrator with all permissions');

-- Insert Default Permissions
INSERT INTO permissions (name, description) VALUES
('users.read', 'Read users'),
('users.write', 'Create or update users'),
('users.delete', 'Delete users'),
('roles.manage', 'Manage roles and permissions'),
('reports.read', 'Read reports'),
('sessions.manage', 'Manage sessions'),
('payments.manage', 'Manage payments'),
('organizations.manage', 'Manage organizations');

-- Map standard permissions to ROLE_SUPER_ADMIN (id=3)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions;
