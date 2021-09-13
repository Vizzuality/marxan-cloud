import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Job } from 'bullmq';
import { InjectEntityManager } from '@nestjs/typeorm';

import { ShapefileService } from '@marxan/shapefile-converter';

import { WorkerProcessor } from '../../worker';
import { ProtectedAreasJobInput } from './worker-input';
import { ProtectedArea } from '@marxan/protected-areas';

@Injectable()
export class ProtectedAreaProcessor
  implements WorkerProcessor<ProtectedAreasJobInput, void> {
  constructor(
    private readonly shapefileService: ShapefileService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async process(job: Job<ProtectedAreasJobInput, void>): Promise<void> {
    const { data: geo } = await this.shapefileService.transformToGeoJson(
      job.data.file,
    );

    return this.entityManager.transaction(async (transaction) => {
      await transaction.delete(ProtectedArea, {
        projectId: job.data.projectId,
      });

      await transaction.query(
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
        `,
        [geo, job.data.projectId, job.data.file.filename],
      );
    });
  }
}
