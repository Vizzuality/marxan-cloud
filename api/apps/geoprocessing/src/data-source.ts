import { DataSource } from 'typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

export const geoDataSource: DataSource = new DataSource(
  geoprocessingConnections.default,
);
