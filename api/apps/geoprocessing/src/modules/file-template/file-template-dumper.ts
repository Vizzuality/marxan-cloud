import { InjectEntityManager } from '@nestjs/typeorm';
import * as fs from 'fs';
import { EntityManager } from 'typeorm';
import { assertDefined } from '@marxan/utils';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { FeatureCollectionWrapper } from './feature-collection-wrapper';

// sometimes is not imported by TypeORM in tests
require(`pg-query-stream`);

export class FileTemplateDumper {
  constructor(
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly entityManager: EntityManager,
  ) {}

  async dumpGeoJson(projectId: string, destinationPath: string): Promise<void> {
    await this.entityManager.transaction(
      async (transactionalEntityManager) =>
        new Promise(async (resolve, reject) => {
          const queryRunner = transactionalEntityManager.queryRunner;
          assertDefined(queryRunner);

          const featureStream = await queryRunner.stream(
            `
                SELECT
                  'Feature' AS "type",
                  ST_AsGeoJSON(the_geom):: json AS "geometry",
                  (
                    SELECT
                      row_to_json(properties_attributes)
                    FROM
                      (
                        SELECT
                          ppu.puid AS puid,
                          1 AS cost
                      ) properties_attributes
                  ) AS "properties"
                FROM
                  projects_pu ppu
                    INNER JOIN planning_units_geom pug ON pug.id = ppu.geom_id
                WHERE
                  ppu.project_id = $1`,
            [projectId],
            undefined,
            reject,
          );

          const queryResultFile = fs
            .createWriteStream(destinationPath)
            .on('error', reject);
          const wrapper = new FeatureCollectionWrapper();
          featureStream.pipe(wrapper).pipe(queryResultFile);
          queryResultFile.on('finish', resolve);
        }),
    );
  }
}
