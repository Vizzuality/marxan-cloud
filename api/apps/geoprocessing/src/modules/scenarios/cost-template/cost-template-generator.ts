import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';
import * as archiver from 'archiver';
import { runCommandsXL } from 'mapshaper';
import {
  ArtifactType,
  ScenarioCostSurfaceRepository,
} from '@marxan/scenario-cost-surface';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import { FeatureCollectionWrapper } from './feature-collection-wrapper';
import { assertDefined } from '@marxan/utils';

@Injectable()
export class CostTemplateGenerator {
  constructor(
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly entityManager: EntityManager,
    private readonly repository: ScenarioCostSurfaceRepository,
  ) {}

  async createTemplateShapefile(scenarioId: string) {
    const storagePath = AppConfig.get<string>(
      'storage.sharedFileStorage.localPath',
    );
    assertDefined(storagePath);
    const transformationDirectory = path.join(
      storagePath,
      'cost-templates',
      uuid.v4(),
    );
    await fs.promises.mkdir(transformationDirectory, { recursive: true });
    const resultFilePrefix = 'result';

    await this.extractGeoJsonCostTemplate(
      scenarioId,
      path.join(transformationDirectory, resultFilePrefix + '.json'),
    );

    const shapefileDirectory = path.join(transformationDirectory, `shp`);
    await runCommandsXL(
      [
        `'${path.join(transformationDirectory, resultFilePrefix + `.json`)}'`,
        '-o',
        `'${path.join(shapefileDirectory, resultFilePrefix + `.shp`)}'`,
      ].join(' '),
    );
    await this.saveShapefileToDatabaseAsZip(
      scenarioId,
      path.join(shapefileDirectory),
    );

    await fs.promises.rm(transformationDirectory, { recursive: true });
  }

  private async extractGeoJsonCostTemplate(
    scenarioId: string,
    destinationPath: string,
  ) {
    await this.entityManager.transaction(
      async (transactionalEntityManager) =>
        new Promise(async (resolve, reject) => {
          const queryRunner = transactionalEntityManager.queryRunner;
          if (!queryRunner) throw new Error('query runner not available!');

          const featureStream = (
            await queryRunner.stream(
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
                          pug.id AS uid,
                          1 AS cost
                      ) properties_attributes
                  ) AS "properties"
                FROM
                  scenarios_pu_data spd
                    INNER JOIN planning_units_geom pug ON pug.id = spd.pu_geom_id
                WHERE
                  spd.scenario_id = $1`,
              [scenarioId],
            )
          ).on('error', reject);
          const queryResultFile = fs
            .createWriteStream(destinationPath)
            .on('error', reject);
          const wrapper = new FeatureCollectionWrapper();
          featureStream.pipe(wrapper).pipe(queryResultFile);
          queryResultFile.on('finish', resolve).on('error', reject);
        }),
    );
  }

  private async saveShapefileToDatabaseAsZip(
    scenarioId: string,
    shapefileDirectory: string,
  ) {
    const shapefileArchive = archiver(`zip`);
    const savePromise = this.repository.create(
      {
        contentType: `application/zip`,
        scenarioId,
        artifactType: ArtifactType.CostTemplate,
      },
      shapefileArchive,
    );
    shapefileArchive.directory(shapefileDirectory, false);
    await shapefileArchive.finalize();
    await savePromise;
  }
}
