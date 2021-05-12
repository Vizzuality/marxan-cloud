import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DbConnections } from './ormconfig.connections';
export declare const apiConnections: Record<DbConnections, PostgresConnectionOptions>;
