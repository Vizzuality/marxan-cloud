import { DataSource, MigrationExecutor } from 'typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing//ormconfig';

let apiConnection: DataSource;
let geoConnection: DataSource;

beforeAll(async () => {
  apiConnection = new DataSource({
    ...geoprocessingConnections.apiDB,
    name: 'geoTestDatasourceAPI',
  });
  geoConnection = new DataSource({
    ...geoprocessingConnections.default,
    name: 'geoTestDatasourceGEO',
  });

  apiConnection = await apiConnection.initialize();
  geoConnection = await geoConnection.initialize();

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
