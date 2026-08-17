-- V14__add_new_permissions.sql

INSERT INTO permissions (name, description) VALUES
('audience.read', 'Can view all users in Audience'),
('policies.manage', 'Can assign users to existing policies'),
('org_requests.manage', 'Can approve or reject organization requests'),
('credits.manage', 'Can generate redeem codes for free credits');

-- Map these new permissions to ROLE_SUPER_ADMIN (id=3)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE name IN ('audience.read', 'policies.manage', 'org_requests.manage', 'credits.manage');
