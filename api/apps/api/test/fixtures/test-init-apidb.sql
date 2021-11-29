INSERT INTO users
(email, fname, lname, display_name, is_active, is_deleted, password_hash)
VALUES
('aa@example.com', 'a', 'a', 'User A A', true, false, crypt('aauserpassword', gen_salt('bf'))),
('bb@example.com', 'b', 'b', 'User B B', true, false, crypt('bbuserpassword', gen_salt('bf'))),
('cc@example.com', 'c', 'c', 'User C C', true, false, crypt('ccuserpassword', gen_salt('bf'))),
('dd@example.com', 'd', 'd', 'User D D', true, false, crypt('dduserpassword', gen_salt('bf')));

INSERT INTO organizations (name, created_by)
VALUES
('Example Org 1', (SELECT id FROM users WHERE email = 'aa@example.com')),
('Example Org 2', (SELECT id FROM users WHERE email = 'aa@example.com'));
