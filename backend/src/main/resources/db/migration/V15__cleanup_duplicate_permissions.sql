-- V15__cleanup_duplicate_permissions.sql
-- Remove the duplicate permissions added in V14 since they were already manually added by the user as READ_USERS, MANAGE_POLICIES, etc.

DELETE FROM role_permissions 
WHERE permission_id IN (
    SELECT id FROM permissions 
    WHERE name IN ('audience.read', 'policies.manage', 'org_requests.manage', 'credits.manage')
);

DELETE FROM permissions 
WHERE name IN ('audience.read', 'policies.manage', 'org_requests.manage', 'credits.manage');
