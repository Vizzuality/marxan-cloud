import { DataSource, MigrationExecutor } from 'typeorm';
import { apiConnections } from '@marxan-api/ormconfig';
import { TestClientApi } from './test-client/test-client-api';
import { insertAdminRegions } from './test-client/seed/admin-regions';

let apiConnection: DataSource;
let geoConnection: DataSource;

// TODO: Move this to lib to be shared by both microservices. It is not a trivial as it might seem

beforeAll(async () => {
  apiConnection = new DataSource({
    ...apiConnections.default,
    name: 'apiTestDatasourceAPI',
  });
  geoConnection = new DataSource({
    ...apiConnections.geoprocessingDB,
    name: 'apiTestDatasourceGEO',
  });

  apiConnection = await apiConnection.initialize();
  geoConnection = await geoConnection.initialize();

  await ensureThereAreNotPendingMigrations(apiConnection, 'API');
  await ensureThereAreNotPendingMigrations(geoConnection, 'Geoprocessing');
});

beforeEach(async () => {
  // TODO: This approach is not fully functional as it only clears tables that are defined within each microservice.
  //       We need to find a way to clear all tables for both dbs, plus insert admin-regions just once.
  await clearTables(apiConnection, ['roles', 'api_event_kinds']);
  await clearTables(geoConnection);
  await insertAdminRegions(geoConnection);
});

afterEach(async () => {
  await TestClientApi.teardownApps();
});

afterAll(async () => {
  await apiConnection.destroy();
  await geoConnection.destroy();
});

const clearTables = async (
  dataSource: DataSource,
  tablesToSkip: string[] = [],
) => {
  const tables = dataSource.entityMetadatas.filter(
    (entity) =>
      entity.tableType !== 'view' && !tablesToSkip.includes(entity.tableName),
  );

  for (const table of tables) {
    const repository = await dataSource.getRepository(table.tableName);
    await repository.query(
      `TRUNCATE ${table.tableName} RESTART IDENTITY CASCADE;`,
    );
  }
};

const ensureThereAreNotPendingMigrations = async (
  dataSource: DataSource,
  connectionName: string,
) => {
  const pendingMigrations = await new MigrationExecutor(
    dataSource,
    dataSource.createQueryRunner('master'),
  ).getPendingMigrations();

  if (pendingMigrations.length) {
    throw new Error(
      `There are ${
        pendingMigrations.length
      } pending migrations for ${connectionName} database: ${pendingMigrations.reduce(
        (prev, current) => prev + '\n' + current.name,
        '',
      )}`,
    );
  }
};
