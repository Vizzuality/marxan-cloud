const config = require('config');

/**
 * @see https://typeorm.io/#/using-ormconfig/using-ormconfigjs
 * 
 * If needing to set any of these parameters depending on environment, with
 * fallback for any other environment, we could use something like:
 * 
 * ['staging', 'production'].includes(config.util.getEnv('NODE_ENV')) ? true : false
 */
module.exports = {
  synchronize: false,
  type: 'postgres',
  url: config.get('postgres.url'),
  ssl: false,
  entities: ['src/modules/**/*.entity.ts'],
  // Logging may be: ['query', 'error', 'schema', 'warn', 'info', 'log'] Use
  // 'query' if needing to see the actual generated SQL statements (this should
  // be limited to `NODE_ENV=development`). Use 'error' for least verbose
  // logging.
  logging: ['error'],
  cache: false,
  migrations: ['src/migrations/**/*.ts'],
  migrationsRun: true,
  cli: {
    migrationsDir: "src/migrations",
    migrationsTableName: "migrations",
  }
};
