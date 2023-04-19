import { DataSource } from 'typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

export const geoMigrationDataSource: DataSource = new DataSource(
  geoprocessingConnections.default,
);
