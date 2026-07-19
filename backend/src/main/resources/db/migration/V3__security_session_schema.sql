-- V3__security_session_schema.sql
-- Security, Sessions, and Audit Logs Tables

-- Refresh Tokens
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    family_id UUID NOT NULL, -- Used for token reuse detection and revoking entire family
    is_revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_token_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_refresh_token_family ON refresh_tokens(family_id);
CREATE INDEX idx_refresh_token_user ON refresh_tokens(user_id);

-- Sessions (Active devices/logins)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    refresh_token_family_id UUID NOT NULL, -- Link session to a token family
    ip_address VARCHAR(45),
    device VARCHAR(255),
    browser VARCHAR(255),
    operating_system VARCHAR(100),
    country VARCHAR(100),
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    websocket_connection_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_session_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_session_user ON sessions(user_id);

-- Login History (Historical log)
CREATE TABLE login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_id UUID,
    ip_address VARCHAR(45),
    device VARCHAR(255),
    browser VARCHAR(255),
    operating_system VARCHAR(100),
    country VARCHAR(100),
    status VARCHAR(50) NOT NULL, -- SUCCESS, FAILED
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_login_hist_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_login_history_user ON login_history(user_id);

-- Audit Logs (All security events)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Nullable for failed logins of unknown users
    action VARCHAR(100) NOT NULL, -- LOGIN, LOGOUT, PASSWORD_CHANGE, ROLE_UPDATE, etc.
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
