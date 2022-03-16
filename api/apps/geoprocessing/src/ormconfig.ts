import * as path from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import { LoggerOptions } from 'typeorm';

/**
 * @see https://typeorm.io/#/using-ormconfig/using-ormconfigjs
 *
 * If needing to set any of these parameters depending on environment, with
 * fallback for any other environment, we could use something like:
 *
 * ['staging', 'production'].includes(config.util.getEnv('NODE_ENV')) ? true : false
 */

// Somehow, without type annotations here, the type checker complains about
// this data structure not matching that of `AuroraDataApiConnectionOptions`.
export const geoprocessingConnections: {
  default: PostgresConnectionOptions;
  apiDB: PostgresConnectionOptions;
} = {
  default: {
    name: 'default',
    synchronize: false,
    type: 'postgres',
    username: AppConfig.get('postgresGeoApi.username'),
    password: AppConfig.get('postgresGeoApi.password'),
    port: AppConfig.get('postgresGeoApi.port'),
    host: AppConfig.get('postgresGeoApi.host'),
    database: AppConfig.get('postgresGeoApi.database'),
    ssl: false,
    entities: [
      path.join(__dirname, '/modules/**/*.geo.entity.{ts,js}'),
      path.join(__dirname, '/marxan-sandboxed-runner/**/*.geo.entity.{ts,js}'),
      path.join(__dirname, '../../../libs/**/*.geo.entity.{ts,js}'),
    ],
    // Logging may be: ['query', 'error', 'schema', 'warn', 'info', 'log'] Use
    // 'query' if needing to see the actual generated SQL statements (this should
    // be limited to `NODE_ENV=development`). Use 'error' for least verbose
    // logging.
    logging: `${AppConfig.get('postgresGeoApi.logging')}`.split(
      ',',
    ) as LoggerOptions,
    cache: false,
    migrations: [__dirname + '/migrations/geoprocessing/**/*.ts'],
    migrationsRun:
      `${AppConfig.get<string>(
        'postgresGeoApi.runMigrationsOnStartup',
      )}`.toLowerCase() !== 'false',
    cli: {
      migrationsDir: 'apps/geoprocessing/src/migrations/geoprocessing',
    },
  },
  apiDB: {
    name: 'apiDB',
    synchronize: false,
    type: 'postgres',
    username: AppConfig.get('postgresApi.username'),
    password: AppConfig.get('postgresApi.password'),
    port: AppConfig.get('postgresApi.port'),
    host: AppConfig.get('postgresApi.host'),
    database: AppConfig.get('postgresApi.database'),
    ssl: false,
    entities: [
      __dirname + '/modules/**/*.api.entity.{ts,js}',
      path.join(__dirname, '../../../libs/**/*.api.entity.{ts,js}'),
    ],
    // Logging may be: ['query', 'error', 'schema', 'warn', 'info', 'log'] Use
    // 'query' if needing to see the actual generated SQL statements (this should
    // be limited to `NODE_ENV=development`). Use 'error' for least verbose
    // logging.
    logging: `${AppConfig.get('postgresApi.logging')}`.split(
      ',',
    ) as LoggerOptions,
    cache: false,
  },
};
