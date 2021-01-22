INSERT INTO users
(email, fname, lname, password_hash)
VALUES
('aa@example.com', 'a', 'a', crypt('aauserpassword', gen_salt('bf'))),
('bb@example.com', 'b', 'b', crypt('bbuserpassword', gen_salt('bf'))),
('cc@example.com', 'c', 'c', crypt('ccuserpassword', gen_salt('bf')));

INSERT INTO roles
VALUES
('organization_owner'),
('project_owner'),
('organization_admin'),
('project_admin'),
('organization_user'),
('project_user');

INSERT INTO organizations (name)
VALUES
('Example Org 1'),
('Example Org 2');

INSERT INTO projects
(name, organization_id)
VALUES
('Example Project 1 Org 1', (SELECT id FROM organizations WHERE name = 'Example Org 1')),
('Example Project 2 Org 1', (SELECT id FROM organizations WHERE name = 'Example Org 1')),
('Example Project 1 Org 2', (SELECT id FROM organizations WHERE name = 'Example Org 1')),
('Example Project 2 Org 2', (SELECT id FROM organizations WHERE name = 'Example Org 1'));

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
