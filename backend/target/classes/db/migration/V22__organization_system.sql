CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    org_type VARCHAR(100),
    description TEXT,
    official_email VARCHAR(255),
    email_domain VARCHAR(255),
    contact_info TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_requests (
    id UUID PRIMARY KEY,
    org_name VARCHAR(255) NOT NULL,
    org_type VARCHAR(100),
    description TEXT,
    official_email VARCHAR(255),
    email_domain VARCHAR(255),
    expected_students INTEGER,
    contact_info TEXT,
    reason TEXT,
    supporting_info TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    requester_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_org_user UNIQUE (organization_id, user_id)
);
