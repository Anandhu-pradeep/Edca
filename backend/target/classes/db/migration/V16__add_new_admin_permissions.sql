-- V16__add_new_admin_permissions.sql
-- Add specific permissions requested by the user for custom PBAC policies

INSERT INTO permissions (name, description) VALUES
('user_read', 'Can view all users, organizations, and admins in the Audience section.'),
('user_delete', 'Can delete user accounts (cannot delete Super Admins or Admins).'),
('org_manage', 'Can approve or reject organization requests.'),
('redeemcode_manage', 'Can generate redeem codes.'),
('role_manage', 'Can assign existing policies to other users.');

-- Map the new permissions to ROLE_SUPER_ADMIN (id=3)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions 
WHERE name IN ('user_read', 'user_delete', 'org_manage', 'redeemcode_manage', 'role_manage');
