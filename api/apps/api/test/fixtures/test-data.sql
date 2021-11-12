INSERT INTO projects
(name, organization_id, created_by, description, bbox)
VALUES
('Example Project 1 Org 1', (SELECT id FROM organizations WHERE name = 'Example Org 1'), (SELECT id FROM users WHERE email = 'aa@example.com'), 'Lorem Ipsum', '[23.719482421875, 21.654052734375, -18.802318121688117, -20.756113874762068]'::jsonb),
('Example Project 2 Org 1', (SELECT id FROM organizations WHERE name = 'Example Org 1'), (SELECT id FROM users WHERE email = 'aa@example.com'), 'Lorem Ipsum', '[23.719482421875, 21.654052734375, -18.802318121688117, -20.756113874762068]'::jsonb),
('Example Project 1 Org 2', (SELECT id FROM organizations WHERE name = 'Example Org 1'), (SELECT id FROM users WHERE email = 'aa@example.com'), 'Lorem Ipsum', '[23.719482421875, 21.654052734375, -18.802318121688117, -20.756113874762068]'::jsonb),
('Example Project 2 Org 2', (SELECT id FROM organizations WHERE name = 'Example Org 1'), (SELECT id FROM users WHERE email = 'aa@example.com'), 'Lorem Ipsum', '[23.719482421875, 21.654052734375, -18.802318121688117, -20.756113874762068]'::jsonb);

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
((SELECT id FROM users WHERE lower(email) = 'aa@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 2 Org 2'), 'project_owner'),
((SELECT id FROM users WHERE lower(email) = 'bb@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 2 Org 2'), 'project_contributor'),
((SELECT id FROM users WHERE lower(email) = 'cc@example.com'), (SELECT id FROM projects WHERE name = 'Example Project 2 Org 2'), 'project_viewer');

INSERT INTO scenarios
(name, project_id, type, wdpa_threshold, number_of_runs, blm, created_by)
VALUES
('Example scenario 1 Project 1 Org 1', (select id from projects where name = 'Example Project 1 Org 1'), 'marxan', 30, 100, 1, (SELECT id FROM users WHERE email = 'aa@example.com') ),
('Example scenario 2 Project 1 Org 1', (select id from projects where name = 'Example Project 1 Org 1'), 'marxan', 50, 100, 1, (SELECT id FROM users WHERE email = 'aa@example.com') ),
('Example scenario 1 Project 2 Org 2', (select id from projects where name = 'Example Project 2 Org 2'), 'marxan', 30, 100, 1, (SELECT id FROM users WHERE email = 'aa@example.com') ),
('Example scenario 2 Project 2 Org 2', (select id from projects where name = 'Example Project 2 Org 2'), 'marxan', 50, 100, 1, (SELECT id FROM users WHERE email = 'aa@example.com') );

-- Fake summary outputs
WITH RECURSIVE nums (n) AS (
    SELECT 1
      UNION ALL
      SELECT n+1 FROM nums WHERE n+1 <= 10
  )
INSERT INTO output_scenarios_summaries
(run_id, scenario_id, score, "cost", planning_units, connectivity, connectivity_total,
mpm, penalty, shortfall, missing_values, best,	distinct_five)
SELECT n as run_id, oss.id	as scenario_id,
round(random()*5359200) score,
round(random()*53592) as "cost",
53000 + round(random()*591) as planning_units,
round(random()*53592000) as connectivity,
53592000 as connectivity_total, 1 as mpm,
round(random()*2000) as penalty,
20449 as shortfall,
round(random()) as missing_values,
false as best,
false as distinct_five
FROM nums, scenarios oss
where oss.id=(select id from scenarios where name = 'Example scenario 1 Project 1 Org 1')
