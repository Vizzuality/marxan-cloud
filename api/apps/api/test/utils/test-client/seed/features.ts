import { Connection } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';

// TODO: Is this only needed for Project and GeoFeatures tests?
export const insertFeatures = async (
  apiConnection: Connection,
  geoConnection: Connection,
) => {
  const results: {
    feature_class_name: string;
    id: string;
  }[] = await apiConnection.query(`INSERT INTO features
(feature_class_name, alias, description, property_name, intersection, creation_status, created_by)
VALUES
       ('demo_acinonyx_jubatus', 'Acinonyx_jubatus', null, ' name', null, '${JobStatus.created}', (SELECT id FROM users WHERE email = 'aa@example.com')),
       ('demo_bucorvus_leadbeateri', 'Bucorvus_leadbeateri', null, ' id', null, '${JobStatus.created}', (SELECT id FROM users WHERE email = 'aa@example.com')),
       ('demo_ceratotherium_simum', 'Ceratotherium_simum', null, ' name', null, '${JobStatus.created}', (SELECT id FROM users WHERE email = 'aa@example.com')),
       ('demo_civettictis_civetta', 'Civettictis_civetta', null, ' id', null, '${JobStatus.created}', (SELECT id FROM users WHERE email = 'aa@example.com')),
       ('demo_diceros_bicornis', 'Diceros_bicornis', null, ' name', null, '${JobStatus.created}', (SELECT id FROM users WHERE email = 'aa@example.com')),
       ('demo_equus_quagga', 'Equus_quagga', null, ' name', null, '${JobStatus.created}', (SELECT id FROM users WHERE email = 'aa@example.com')),
       ('demo_giraffa_camelopardalis', 'Giraffa_camelopardalis', null, ' name', null, '${JobStatus.created}', (SELECT id FROM users WHERE email = 'aa@example.com')),
       ('demo_kobus_leche', 'Kobus_leche', null, ' name', null, '${JobStatus.created}', (SELECT id FROM users WHERE email = 'aa@example.com')),
       ('demo_panthera_pardus', 'Panthera_pardus', null, ' name', null, '${JobStatus.created}', (SELECT id FROM users WHERE email = 'aa@example.com')),
       ('failed_feature', 'FAILED Feature', null, ' name', null, '${JobStatus.failure}', (SELECT id FROM users WHERE email = 'aa@example.com')),
       ('running_feature', 'RUNNING Feature', null, ' name', null, '${JobStatus.running}', (SELECT id FROM users WHERE email = 'aa@example.com'))
    RETURNING feature_class_name, id;
`);

  const baseDirectory = path.join(__dirname, '../../../fixtures/features');
  const files = await fs.readdir(baseDirectory);

  await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(`${baseDirectory}/${file}`, 'utf-8');
      const featureId = results.find(
        (el) => el.feature_class_name === file.replace('.sql', ''),
      )?.id;

      if (!featureId)
        throw new Error(
          `Could not map feature class name to feature id: ${results}`,
        );

      return geoConnection.query(content.replace(/\$feature_id/g, featureId));
    }),
  );
};
