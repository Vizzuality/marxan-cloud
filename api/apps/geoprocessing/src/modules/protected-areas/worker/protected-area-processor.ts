import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Job } from 'bullmq';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { plainToClass } from 'class-transformer';

import { ShapefileExtractorService } from '@marxan/shapefile-converter';
import { JobInput, JobOutput } from '@marxan/protected-areas';

import { WorkerProcessor } from '../../worker';
import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';

@Injectable()
export class ProtectedAreaProcessor
  implements WorkerProcessor<JobInput, JobOutput> {
  constructor(
    private readonly shapefileService: ShapefileExtractorService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async process(job: Job<JobInput, JobOutput>): Promise<JobOutput> {
    const result = await this.shapefileService.toGeoJson(job.data.shapefile);

    if (isLeft(result)) {
      throw new Error(
        `Couldn't convert ${job.data.shapefile.path} for ${
          job.data.scenarioId
        }: ${String(result.left)}`,
      );
    }

    const geo = result.right;

    return this.entityManager.transaction(async (transaction) => {
      const entities: { id: string }[] = await transaction.query(
        `
          INSERT INTO "wdpa"("the_geom", "project_id", "full_name")
          SELECT ST_SetSRID(
                   ST_CollectionExtract(ST_Collect(
                                          ST_GeomFromGeoJSON(features ->> 'geometry')
                                          ), 3), 4326)::geometry,
                 $2,
                 $3
          FROM (
                 SELECT json_array_elements($1::json -> 'features') AS features
               ) AS f
          ON CONFLICT ON CONSTRAINT unique_custom_protected_area_geometries_per_project
          DO UPDATE
            SET full_name = EXCLUDED.full_name
          RETURNING "id";
        `,
        [geo, job.data.projectId, job.data.name || job.data.shapefile.filename],
      );

      await this.shapefileService.cleanup(job.data.shapefile);

      return plainToClass<JobOutput, JobOutput>(JobOutput, {
        protectedAreaId: entities.map((entity) => entity.id),
        projectId: job.data.projectId,
        scenarioId: job.data.scenarioId,
      });
    });
  }
}
