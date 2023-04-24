import { apiMigrationDataSource } from '@marxan-api/ormconfig.migration';

/**
 * Utility functions related to lower-level interaction with PostgreSQL servers.
 *
 * @debt This should be moved to a self-standing project library
 */
export class PostgreSQLUtils {
  /**
   * Check if the PostgreSQL server we are connected to is version 13 or higher.
   */
  static async version13Plus(): Promise<boolean> {
    // Here we do not need to initialize DataSource again, because it is happening internally when starting the migration process
    const postgresqlMajorVersion = await apiMigrationDataSource
      .query('show server_version')
      .then((result: [{ server_version: string }]) => {
        return result[0].server_version.split('.')[0];
      })
      .then((majorVersion: string) => Number(majorVersion));
    return postgresqlMajorVersion >= 13;
  }
}
