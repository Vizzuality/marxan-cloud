import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { AppConfig } from 'utils/config.utils';

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
export const apiConnections: {
  default: PostgresConnectionOptions;
  geoprocessingDB: PostgresConnectionOptions;
} = {
  default: {
    // Could be named differently for it to be more descriptive, but keeping
    // this as `default` allows to avoid explicitly specifying the connection in
    // `TypeOrmModule.forFeature()`
    name: 'default',
    synchronize: false,
    type: 'postgres',
    url: AppConfig.get('postgresApi.url'),
    ssl: false,
    entities: [__dirname + '/modules/**/*.api.entity.ts'],
    // Logging may be: ['query', 'error', 'schema', 'warn', 'info', 'log'] Use
    // 'query' if needing to see the actual generated SQL statements (this should
    // be limited to `NODE_ENV=development`). Use 'error' for least verbose
    // logging.
    logging: ['error'],
    cache: false,
    migrations: [__dirname + '/migrations/api/**/*.ts'],
    /** Migrations will run automatically on startup, unless the
     * `API_RUN_MIGRATIONS_ON_STARTUP` or `GEOPROCESSING_RUN_MIGRATIONS_ON_STARTUP`
     * environment variables are set and their value matches, case-insensitively,
     * the string `false`.
     *
     * @debt I think this should be way more resilient to user input.
     */
    migrationsRun:
      AppConfig.get<string>(
        'postgresApi.runMigrationsOnStartup',
      )?.toLowerCase() !== 'false'
        ? true
        : false,
    cli: {
      migrationsDir: 'migrations/api',
    },
  },
  geoprocessingDB: {
    name: 'geoprocessingDB',
    synchronize: false,
    type: 'postgres',
    url: AppConfig.get('postgresGeoApi.url'),
    ssl: false,
    entities: [__dirname + '/modules/**/*.geo.entity.ts'],
    logging: ['error'],
    cache: false,
    // Migrations for this db/data source are handled in the geoprocessing
    // service
  },
};
