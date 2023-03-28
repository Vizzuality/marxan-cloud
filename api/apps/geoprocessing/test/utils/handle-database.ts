import { Connection, createConnection, MigrationExecutor } from 'typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing//ormconfig';

let apiConnection: Connection;
let geoConnection: Connection;

beforeAll(async () => {
  apiConnection = await createConnection(geoprocessingConnections.apiDB);
  geoConnection = await createConnection(geoprocessingConnections.default);

  await ensureThereAreNotPendingMigrations(apiConnection, 'API');
  await ensureThereAreNotPendingMigrations(geoConnection, 'Geoprocessing');
});

beforeEach(async () => {
  await clearTables(geoConnection);
});

afterEach(async () => {
  // TODO: Create a `TestClientGeo` as it is done for API e2e tests
  //await TestClientGeo.teardownApps();
});

afterAll(async () => {
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
