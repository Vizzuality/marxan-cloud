import { DataSource } from 'typeorm';
import { apiConnections } from '@marxan-api/ormconfig';

export const newApiMigrationDataSource: DataSource = new DataSource({
  ...apiConnections.default,
  name: 'PostgresUtils',
});
