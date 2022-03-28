import { Connection, createConnection, MigrationExecutor } from 'typeorm';
import { apiConnections } from '@marxan-api/ormconfig';
import { TestClientApi } from './test-client/test-client-api';
import { insertAdminRegions } from './test-client/seed/admin-regions';

let apiConnection: Connection;
let geoConnection: Connection;

beforeAll(async () => {
  console.log('BEFORE ALL');
  apiConnection = await createConnection(apiConnections.default);
  geoConnection = await createConnection(apiConnections.geoprocessingDB);

  if (!apiConnection.isConnected)
    throw new Error('Could not connect to API DB');
  if (!geoConnection.isConnected)
    throw new Error('Could not connect to Geo DB');
  console.log('HERE');
  console.log(apiConnection.isConnected, geoConnection.isConnected);
  await ensureThereAreNotPendingMigrations(apiConnection, 'API');
  await ensureThereAreNotPendingMigrations(geoConnection, 'Geoprocessing');
});

beforeEach(async () => {
  console.log('BEFORE EACH');
  await clearTables(apiConnection, ['roles', 'api_event_kinds']);
  await clearTables(geoConnection);
  await insertAdminRegions(geoConnection);
});
afterEach(async () => {
  console.log('AFTER EACH');
  await TestClientApi.teardownApps();
});
afterAll(async () => {
  console.log('AFTER ALL');
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
