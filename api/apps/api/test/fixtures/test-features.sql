
INSERT INTO features
(feature_class_name, alias, description, property_name, intersection, tag, creation_status, created_by)
VALUES
('iucn_acinonyxjubatus', null, null, 'binomial', null, 'species', 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('iucn_anomalurusderbianus', null, null, 'binomial', null, 'species', 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('iucn_antidorcasmarsupialis', null, null, 'binomial', null, 'species', 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('iucn_aonyxcapensis', null, null, 'binomial', null, 'species', 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('iucn_crocidurahirta', null, null, 'binomial', null, 'species', 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('iucn_dendrohyraxarboreus', null, null, 'binomial', null, 'species', 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('iucn_epomophoruswahlbergi', null, null, 'binomial', null, 'species', 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('iucn_otolemurcrassicaudatus', null, null, 'binomial', null, 'species', 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('iucn_pantherapardus', null, null, 'binomial', null, 'species', 'created', (SELECT id FROM users WHERE email = 'aa@example.com'));
