import { getConnection } from 'typeorm';
import { DbConnections } from '../../src/ormconfig.connections';

export const tearDown = async () => {
  const connections = Object.values(DbConnections).map((name) =>
    getConnection(name),
  );
  console.log(
    `--- teardown, closing connections:`,
    connections.map((c) => `${c.name} is Connected? ${c.isConnected}`),
  );
  await Promise.all(connections.map((conn) => conn.close()));
};
