import { getConnection } from 'typeorm';
import { DbConnections } from '../../src/ormconfig.connections';

export const tearDown = async () => {
  const connections = Object.values(DbConnections).map((name) =>
    getConnection(name),
  );
  await Promise.all(connections.map((conn) => conn.close()));
};
