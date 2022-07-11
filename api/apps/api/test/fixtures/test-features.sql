
INSERT INTO features 
(feature_class_name, alias, description, property_name, intersection, creation_status, created_by)
VALUES
('demo_acinonyx_jubatus', 'Acinonyx_jubatus', null, ' name', null, 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('demo_bucorvus_leadbeateri', 'Bucorvus_leadbeateri', null, ' id', null, 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('demo_ceratotherium_simum', 'Ceratotherium_simum', null, ' name', null, 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('demo_civettictis_civetta', 'Civettictis_civetta', null, ' id', null, 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('demo_diceros_bicornis', 'Diceros_bicornis', null, ' name', null, 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('demo_equus_quagga', 'Equus_quagga', null, ' name', null, 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('demo_giraffa_camelopardalis', 'Giraffa_camelopardalis', null, ' name', null, 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('demo_kobus_leche', 'Kobus_leche', null, ' name', null, 'created', (SELECT id FROM users WHERE email = 'aa@example.com')),
('demo_panthera_pardus', 'Panthera_pardus', null, ' name', null, 'created', (SELECT id FROM users WHERE email = 'aa@example.com'));
