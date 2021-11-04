import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Job } from 'bullmq';
import { InjectEntityManager } from '@nestjs/typeorm';

import { ShapefileService } from '@marxan/shapefile-converter';

import { WorkerProcessor } from '../../worker';
import { ProtectedArea, JobInput, JobOutput } from '@marxan/protected-areas';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ProtectedAreaProcessor
  implements WorkerProcessor<JobInput, JobOutput> {
  constructor(
    private readonly shapefileService: ShapefileService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async process(job: Job<JobInput, JobOutput>): Promise<JobOutput> {
    const { data: geo } = await this.shapefileService.transformToGeoJson(
      job.data.shapefile,
    );

    return this.entityManager.transaction(async (transaction) => {
      await transaction.delete(ProtectedArea, {
        projectId: job.data.projectId,
      });

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
          RETURNING "id"
        `,
        [geo, job.data.projectId, job.data.name || job.data.shapefile.filename],
      );

      return plainToClass<JobOutput, JobOutput>(JobOutput, {
        protectedAreaId: entities.map((entity) => entity.id),
        projectId: job.data.projectId,
        scenarioId: job.data.scenarioId,
      });
    });
  }
}
