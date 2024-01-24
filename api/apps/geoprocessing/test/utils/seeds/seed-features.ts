import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 } from 'uuid';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { INestApplicationContext } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';

export async function seedFeatures(
  app: INestApplicationContext,
  dirPath?: string,
) {
  const dataSource = app.get<DataSource>(
    getDataSourceToken(geoprocessingConnections.default.name),
  );
  const queryRunner = dataSource.createQueryRunner();
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  await queryRunner.release();
}
