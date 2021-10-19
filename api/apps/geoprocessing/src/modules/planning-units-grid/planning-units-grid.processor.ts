import { Injectable, Logger } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { isLeft } from 'fp-ts/Either';
import { BBox } from 'geojson';

import { JobInput, JobOutput, queueName } from '@marxan/planning-units-grid';
import { ShapefileService } from '@marxan/shapefile-converter';
import {
  WorkerBuilder,
  WorkerProcessor,
} from '@marxan-geoprocessing/modules/worker';

import { ShapeType } from '@marxan-jobs/planning-unit-geometry';
import { GridGeoJsonValidator } from './grid-geojson-validator';

@Injectable()
export class PlanningUnitsGridProcessor
  implements WorkerProcessor<JobInput, JobOutput> {
  private readonly worker: Worker;
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly shapefileConverter: ShapefileService,
    private readonly gridGeoJsonValidator: GridGeoJsonValidator,
    workerBuilder: WorkerBuilder,
  ) {
    this.worker = workerBuilder.build(queueName, this);
  }

  // replace this to be a common service which consumes proxied shapefile
  async process({
    data: { shapefile },
  }: Job<JobInput, JobOutput>): Promise<JobOutput> {
    const { data: geoJson } = await this.shapefileConverter.transformToGeoJson(
      shapefile,
    );

    const result = this.gridGeoJsonValidator.validate(geoJson);
    if (isLeft(result)) {
      const error = new Error(result.left.toString());
      this.logger.error(error);
      throw error;
    }

    const { puGeometriesIds, planningAreaId, bbox } = await this.entityManager
      .transaction(async (manager) => {
        // now, either use request-id as a fake project id to connect PU to
        // planning area later
        // or create some table to keep the relation between those

        // await manager.query(
        //   `
        //     DELETE
        //     FROM "planning_units_geom"
        //     where "project_id" = $1
        //   `,
        //   [projectId],
        // );
        const puGeometriesIds: { id: string }[] = await manager.query(
          `
            INSERT INTO "planning_units_geom"("the_geom", "type", "project_id")
            SELECT ST_SetSRID(
                     ST_GeomFromGeoJSON(features ->> 'geometry'),
                     4326)::geometry,
                   $2::shape_type,
                   $3
            FROM (
                   SELECT json_array_elements($1::json -> 'features') AS features
                 ) AS f
            ON CONFLICT ON CONSTRAINT planning_units_geom_the_geom_type_key DO UPDATE SET type = 'from_shapefile'::shape_type
            RETURNING "id"
          `,
          [result.right, ShapeType.FromShapefile],
        );

        await manager.query(
          `DELETE
           FROM planning_areas
           where project_id = $1`,
          [projectId],
        );

        const planningArea: {
          id: string;
          bbox: BBox;
        }[] = await manager.query(
          `
            INSERT
            INTO "planning_areas"("project_id", "the_geom")
            VALUES ($1,
                    (SELECT ST_MULTI(ST_UNION(the_geom))
                     from "planning_units_geom"
                     where project_id = $1))
            RETURNING "id", "bbox"
          `,
          [projectId],
        );

        return {
          puGeometriesIds,
          planningAreaId: planningArea[0]?.id,
          bbox: planningArea[0]?.bbox,
        };
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });

    const output = plainToClass<JobOutput, JobOutput>(JobOutput, {
      geometryIds: puGeometriesIds.map((row) => row.id),
      projectId,
      planningAreaId,
      bbox,
      geoJson,
    });

    const errors = validateSync(output);

    if (errors.length > 0) {
      const errorMessage = errors.map((e) => e.toString()).join('. ');
      this.logger.warn(`Invalid job output: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    return output;
  }
}
