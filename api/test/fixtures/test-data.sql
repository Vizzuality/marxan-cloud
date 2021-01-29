INSERT INTO users
(email, fname, lname, display_name, is_active, is_deleted, password_hash)
VALUES
('aa@example.com', 'a', 'a', 'User A A', true, false, crypt('aauserpassword', gen_salt('bf'))),
('bb@example.com', 'b', 'b', 'User B B', true, false, crypt('bbuserpassword', gen_salt('bf'))),
('cc@example.com', 'c', 'c', 'User C C', true, false, crypt('ccuserpassword', gen_salt('bf')));

INSERT INTO roles
VALUES
('organization_owner'),
('project_owner'),
('organization_admin'),
('project_admin'),
('organization_user'),
('project_user');

INSERT INTO organizations (name, created_by)
VALUES
('Example Org 1', (SELECT id FROM users WHERE email = 'aa@example.com')),
('Example Org 2', (SELECT id FROM users WHERE email = 'aa@example.com'));

INSERT INTO projects
(name, organization_id, created_by)
VALUES
('Example Project 1 Org 1', (SELECT id FROM organizations WHERE name = 'Example Org 1'), (SELECT id FROM users WHERE email = 'aa@example.com')),
('Example Project 2 Org 1', (SELECT id FROM organizations WHERE name = 'Example Org 1'), (SELECT id FROM users WHERE email = 'aa@example.com')),
('Example Project 1 Org 2', (SELECT id FROM organizations WHERE name = 'Example Org 1'), (SELECT id FROM users WHERE email = 'aa@example.com')),
('Example Project 2 Org 2', (SELECT id FROM organizations WHERE name = 'Example Org 1'), (SELECT id FROM users WHERE email = 'aa@example.com'));

INSERT INTO users_organizations
(user_id, organization_id, role_id)
VALUES
((SELECT id FROM users WHERE lower(email) = 'aa@example.com'), (SELECT id FROM organizations WHERE name = 'Example Org 1'), 'organization_owner'),
((SELECT id FROM users WHERE lower(email) = 'bb@example.com'), (SELECT id FROM organizations WHERE name = 'Example Org 1'), 'organization_admin'),
((SELECT id FROM users WHERE lower(email) = 'cc@example.com'), (SELECT id FROM organizations WHERE name = 'Example Org 1'), 'organization_user'),
((SELECT id FROM users WHERE lower(email) = 'aa@example.com'), (SELECT id FROM organizations WHERE name = 'Example Org 2'), 'organization_owner'),
((SELECT id FROM users WHERE lower(email) = 'bb@example.com'), (SELECT id FROM organizations WHERE name = 'Example Org 2'), 'organization_admin'),
((SELECT id FROM users WHERE lower(email) = 'cc@example.com'), (SELECT id FROM organizations WHERE name = 'Example Org 2'), 'organization_user');

INSERT INTO users_projects
(user_id, project_id, role_id)
VALUES
((SELECT id FROM users WHERE lower(email) = 'aa@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 1 Org 1'), 'project_owner'),
((SELECT id FROM users WHERE lower(email) = 'bb@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 1 Org 1'), 'project_admin'),
((SELECT id FROM users WHERE lower(email) = 'cc@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 1 Org 1'), 'project_user'),
((SELECT id FROM users WHERE lower(email) = 'aa@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 2 Org 2'), 'project_owner'),
((SELECT id FROM users WHERE lower(email) = 'bb@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 2 Org 2'), 'project_admin'),
((SELECT id FROM users WHERE lower(email) = 'cc@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 2 Org 2'), 'project_user');
