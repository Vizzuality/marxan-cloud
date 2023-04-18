import { Connection, createConnection, MigrationExecutor } from 'typeorm';
import { apiConnections } from '@marxan-api/ormconfig';
import { TestClientApi } from './test-client/test-client-api';
import { insertAdminRegions } from './test-client/seed/admin-regions';

let apiConnection: Connection;
let geoConnection: Connection;

// TODO: Move this to lib to be shared by both microservices. It is not a trivial as it might seem

beforeAll(async () => {
  apiConnection = await createConnection(apiConnections.default);
  geoConnection = await createConnection(apiConnections.geoprocessingDB);

  await ensureThereAreNotPendingMigrations(apiConnection, 'API');
  await ensureThereAreNotPendingMigrations(geoConnection, 'Geoprocessing');
});

beforeEach(async () => {
  // TODO: This approach is not fully functional as it only clears tables that are defined within each microservice.
  //       We need to find a way to clear all tables for both dbs, plus insert admin-regions just once.
  await clearTables(apiConnection, ['roles', 'api_event_kinds', 'users']);
  await clearTables(geoConnection);
  await insertAdminRegions(geoConnection);
});

afterAll(async () => {
  await TestClientApi.teardownApps();
  await apiConnection.close();
  await geoConnection.close();
});

const clearTables = async (
  connection: Connection,
  tablesToSkip: string[] = [],
) => {
  const tables = connection.entityMetadatas.filter(
    (entity) =>
      entity.tableType !== 'view' && !tablesToSkip.includes(entity.tableName),
  );

  for (const table of tables) {
    const repository = await connection.getRepository(table.tableName);
    await repository.query(
      `TRUNCATE ${table.tableName} RESTART IDENTITY CASCADE;`,
    );
  }
};

const ensureThereAreNotPendingMigrations = async (
  connection: Connection,
  connectionName: string,
) => {
  const pendingMigrations = await new MigrationExecutor(
    connection,
    connection.createQueryRunner('master'),
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
