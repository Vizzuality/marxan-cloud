import { Connection, createConnection } from 'typeorm';
import { apiConnections } from '@marxan-api/ormconfig';
import { TestClientApi } from '../test-client-api';

let apiConnection: Connection;
let geoConnection: Connection;

beforeAll(async () => {
  apiConnection = await createConnection(apiConnections.default);
  geoConnection = await createConnection(apiConnections.geoprocessingDB);
});

beforeEach(async () => {
  await clearTables(apiConnection, ['roles', 'api_event_kinds']);
  await clearTables(geoConnection);
});

afterEach(async () => {
  await TestClientApi.teardownApps();
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
