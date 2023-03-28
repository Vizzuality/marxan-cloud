import { Connection, getConnection } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 } from 'uuid';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

export async function seedFeatures(dirPath?: string) {
  const queryRunner = await getConnection(
    geoprocessingConnections.default.name,
  ).createQueryRunner();
  const featureId = v4();

  const sqlFiles = fs
    .readdirSync(dirPath ?? path.join(__dirname, 'features'))
    .filter((file) => file.endsWith('.sql'));

  for (const sqlFile of sqlFiles) {
    try {
      const filePath = path.join(
        dirPath ?? path.join(__dirname, 'features'),
        sqlFile,
      );

      let sql = fs.readFileSync(filePath, 'utf8');

      sql = sql.replace(/\$feature_id/g, featureId);

      await queryRunner.startTransaction();

      await queryRunner.query(sql);

      await queryRunner.commitTransaction();
      console.log('SEED COMPLETED: ', sqlFile);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  await queryRunner.release();
}
