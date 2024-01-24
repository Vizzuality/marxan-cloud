INSERT INTO organizations (name, created_by)
VALUES
  ('Example Org 1', (SELECT id FROM users WHERE email = 'aa@example.com')),
  ('Example Org 2', (SELECT id FROM users WHERE email = 'aa@example.com'));

INSERT INTO projects
(name, organization_id, created_by, description, bbox)
VALUES
('Example Project 1 Org 1', (SELECT id FROM organizations WHERE name = 'Example Org 1'), (SELECT id FROM users WHERE email = 'aa@example.com'), 'Lorem Ipsum', '[23.719482421875, 21.654052734375, -18.802318121688117, -20.756113874762068]'::jsonb),
('Example Project 2 Org 1', (SELECT id FROM organizations WHERE name = 'Example Org 1'), (SELECT id FROM users WHERE email = 'aa@example.com'), 'Lorem Ipsum', '[23.719482421875, 21.654052734375, -18.802318121688117, -20.756113874762068]'::jsonb),
('Example Project 1 Org 2', (SELECT id FROM organizations WHERE name = 'Example Org 1'), (SELECT id FROM users WHERE email = 'aa@example.com'), 'Lorem Ipsum', '[23.719482421875, 21.654052734375, -18.802318121688117, -20.756113874762068]'::jsonb),
('Example Project 2 Org 2', (SELECT id FROM organizations WHERE name = 'Example Org 1'), (SELECT id FROM users WHERE email = 'aa@example.com'), 'Lorem Ipsum', '[23.719482421875, 21.654052734375, -18.802318121688117, -20.756113874762068]'::jsonb);

INSERT INTO cost_surfaces
(name, project_id, is_default, min, max)
VALUES
('Example Project 1 Org 1 Default Cost Surface', (SELECT id FROM projects WHERE name = 'Example Project 1 Org 1'), true, 0, 0),
('Example Project 2 Org 1 Default Cost Surface', (SELECT id FROM projects WHERE name = 'Example Project 2 Org 1'), true, 0, 0),
('Example Project 1 Org 2 Default Cost Surface', (SELECT id FROM projects WHERE name = 'Example Project 1 Org 2'), true, 0, 0),
('Example Project 2 Org 2 Default Cost Surface', (SELECT id FROM projects WHERE name = 'Example Project 2 Org 2'), true, 0, 0);

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
((SELECT id FROM users WHERE lower(email) = 'bb@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 1 Org 1'), 'project_contributor'),
((SELECT id FROM users WHERE lower(email) = 'cc@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 1 Org 1'), 'project_viewer'),
((SELECT id FROM users WHERE lower(email) = 'dd@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 1 Org 1'), 'project_owner'),
((SELECT id FROM users WHERE lower(email) = 'aa@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 2 Org 2'), 'project_owner'),
((SELECT id FROM users WHERE lower(email) = 'bb@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 2 Org 2'), 'project_contributor'),
((SELECT id FROM users WHERE lower(email) = 'cc@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 2 Org 2'), 'project_viewer'),
((SELECT id FROM users WHERE lower(email) = 'dd@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 2 Org 2'), 'project_owner');

INSERT INTO scenarios
(name, project_id, cost_surface_id, type, wdpa_threshold, number_of_runs, blm, created_by)
VALUES
('Example scenario 1 Project 1 Org 1', (select id from projects where name = 'Example Project 1 Org 1'), (select id from cost_surfaces where name = 'Example Project 1 Org 1 Default Cost Surface'), 'marxan', 30, 100, 1, (SELECT id FROM users WHERE email = 'aa@example.com') ),
('Example scenario 2 Project 1 Org 1', (select id from projects where name = 'Example Project 1 Org 1'), (select id from cost_surfaces where name = 'Example Project 1 Org 1 Default Cost Surface'), 'marxan', 50, 100, 1, (SELECT id FROM users WHERE email = 'aa@example.com') ),
('Example scenario 1 Project 2 Org 2', (select id from projects where name = 'Example Project 2 Org 2'), (select id from cost_surfaces where name = 'Example Project 2 Org 2 Default Cost Surface'), 'marxan', 30, 100, 1, (SELECT id FROM users WHERE email = 'aa@example.com') ),
('Example scenario 2 Project 2 Org 2', (select id from projects where name = 'Example Project 2 Org 2'), (select id from cost_surfaces where name = 'Example Project 2 Org 2 Default Cost Surface'), 'marxan', 50, 100, 1, (SELECT id FROM users WHERE email = 'aa@example.com') );

INSERT INTO platform_admins
(user_id)
VALUES
((SELECT id FROM users WHERE lower(email) = 'dd@example.com'));
