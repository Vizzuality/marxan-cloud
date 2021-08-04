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