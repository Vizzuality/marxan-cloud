import { DataSource } from 'typeorm';
import { apiConnections } from '@marxan-api/ormconfig';

export const apiMigrationDataSource: DataSource = new DataSource(
  apiConnections.default,
);
