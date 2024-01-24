import {
  PlanningUnitsJob,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { chunk } from 'lodash';
import { EntityManager } from 'typeorm';
import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import { ProjectCostSurfacePersistencePort } from '@marxan-geoprocessing/modules/cost-surface/ports/persistence/project-cost-surface-persistence.port';

type CustomPlanningAreaJob = Required<
  Omit<
    PlanningUnitsJob,
    'countryId' | 'adminRegionId' | 'adminAreaLevel1Id' | 'adminAreaLevel2Id'
  >
> & { planningUnitGridShape: RegularPlanningUnitGridShape };

export type RegularPlanningAreaJob = Omit<
  PlanningUnitsJob,
  'planningAreaId'
> & {
  planningUnitGridShape: RegularPlanningUnitGridShape;
};

export type RegularPlanningUnitGridShape =
  | PlanningUnitGridShape.Hexagon
  | PlanningUnitGridShape.Square;

function isCustomPlanningAreaJob(
  job: PlanningUnitsJob,
): job is CustomPlanningAreaJob {
  return job.planningAreaId !== undefined;
}

export const calculateGridSize: {
  [value in RegularPlanningUnitGridShape]: (areaKm2: number) => number;
} = {
  [PlanningUnitGridShape.Square]: (areaKm2) => Math.sqrt(areaKm2) * 1000,
  [PlanningUnitGridShape.Hexagon]: (areaKm2) =>
    Math.sqrt((2 * areaKm2) / (3 * Math.sqrt(3))) * 1000,
};

export const gridShapeFnMapping: {
  [value in RegularPlanningUnitGridShape]: string;
} = {
  [PlanningUnitGridShape.Hexagon]: 'ST_HexagonGrid',
  [PlanningUnitGridShape.Square]: 'ST_SquareGrid',
};

@Injectable()
export class PlanningUnitsJobProcessor {
  private logger = new Logger('planning-units-job-processor');

  constructor(
    private readonly repo: ProjectCostSurfacePersistencePort,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  private async ensureJobDataIsValid(
    job: Job<PlanningUnitsJob>,
  ): Promise<void> {
    /**
     * @description
     * we are validating the data before anything is triggered
     */
    const jobData = plainToClass(PlanningUnitsJob, job.data);
    const errors = await validate(jobData);
    if (errors.length > 0) {
      const errorMessage = `Validation failed: ${JSON.stringify(errors)}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (job.name !== 'create-regular-pu') {
      const errorMessage = `Unknown job type: ${job.name}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const customPlanningArea = Boolean(job.data.planningAreaId);
    const regularPlanningArea = Boolean(
      job.data.countryId ||
        job.data.adminAreaLevel1Id ||
        job.data.adminAreaLevel2Id,
    );

    if (!customPlanningArea && !regularPlanningArea) {
      throw new Error(
        'Without valid administrative level or a custom planning Area a regular pu area cannot be created',
      );
    }

    const puGridShape = job.data.planningUnitGridShape;
    if (
      puGridShape !== PlanningUnitGridShape.Hexagon &&
      puGridShape !== PlanningUnitGridShape.Square
    ) {
      throw new Error(`Invalid planning unit grid shape: ${puGridShape}`);
    }
  }

  private getCustomPlanningAreaGridSubquery(
    data: CustomPlanningAreaJob,
  ): string {
    const gridFn = gridShapeFnMapping[data.planningUnitGridShape];
    const size = calculateGridSize[data.planningUnitGridShape](
      data.planningUnitAreakm2,
    );

    return `
      WITH region AS (
        SELECT ST_Transform(the_geom, 3410) as geom
        FROM planning_areas
        WHERE id = '${data.planningAreaId}'
      ),
      bboxes as (select * from (values (st_transform(ST_MakeEnvelope(-180, -90, 0, 90, 4326), 3410), 'west'),
      (st_transform(ST_MakeEnvelope(0, -90, 180, 90, 4326),3410), 'east')) as t(geom, pos)),
      grid AS (
      SELECT ST_ClipByBox2D((${gridFn}(${size}, st_intersection(region.geom, bboxes.geom))).geom,
      st_transform(ST_MakeEnvelope(-180, -90, 180, 90, 4326), 3410)) as geom
      FROM region, bboxes
      )
SELECT distinct
grid.geom
      FROM grid, region
      WHERE ST_Intersects(grid.geom, region.geom)
    `;
  }

  private getRegularPlanningAreaGridSubquery({
    countryId,
    adminAreaLevel1Id,
    adminAreaLevel2Id,
    planningUnitAreakm2,
    planningUnitGridShape,
  }: RegularPlanningAreaJob): string {
    const whereConditions: string[] = [
      countryId ? `gid_0 = '${countryId}'` : 'gid_0 is null',
      adminAreaLevel1Id ? `gid_1 = '${adminAreaLevel1Id}'` : 'gid_1 is null',
      adminAreaLevel2Id ? `gid_2 = '${adminAreaLevel2Id}'` : 'gid_2 is null',
    ];
    const gridFn = gridShapeFnMapping[planningUnitGridShape];
    const size = calculateGridSize[planningUnitGridShape]!(planningUnitAreakm2);

    return `
      WITH region AS (
        SELECT ST_Transform(the_geom, 3410) as geom
        FROM admin_regions
        WHERE ${whereConditions.join(' AND ')}
      ),
      bboxes as (select * from (values (st_transform(ST_MakeEnvelope(-180, -90, 0, 90, 4326), 3410), 'west'),
									 (st_transform(ST_MakeEnvelope(0, -90, 180, 90, 4326),3410), 'east')) as t(geom, pos)),
      grid AS (
        SELECT ST_ClipByBox2D((${gridFn}(${size}, st_intersection(region.geom, bboxes.geom))).geom,
        st_transform(ST_MakeEnvelope(-180, -90, 180, 90, 4326), 3410)) as geom
        FROM region, bboxes
      )
      SELECT distinct
      		grid.geom
      FROM grid, region
      WHERE ST_Intersects(grid.geom, region.geom)
    `;
  }

  private getGridSubquery(
    data: RegularPlanningAreaJob | CustomPlanningAreaJob,
  ): string {
    return isCustomPlanningAreaJob(data)
      ? this.getCustomPlanningAreaGridSubquery(data)
      : this.getRegularPlanningAreaGridSubquery(data);
  }

  /**
   * @description This function will take care of generating the regular-pu-grids in the area
   *
   * @TODO
   * We need to validate that:
   * * An admin area provided is valid and within the db.
   * * If a user has provided also an admin area / EEZ, this extent must be contained in the adm area provided.
   * * PlanningUnitAreakm2 should be a positive number
   * * This piece will be triggered only if we require to generate a custom regular grid (not user provided PUs)
   * * Better handle the validation, plus check why Polygon validation is not working
   * make sure we avoid at all costs unescaped user input
   */
  async process(
    job: Job<RegularPlanningAreaJob | CustomPlanningAreaJob>,
  ): Promise<void> {
    this.logger.debug(`Start planning-units processing for ${job.id}...`);

    await this.ensureJobDataIsValid(job);

    try {
      const subquery = this.getGridSubquery(job.data);

      await this.entityManager.transaction(async (em) => {
        // since size column is of type integer we have to apply Math.round
        const size = Math.round(
          calculateGridSize[job.data.planningUnitGridShape](
            job.data.planningUnitAreakm2,
          ),
        );

        const geometries: { id: string }[] = await em.query(
          `
            INSERT INTO planning_units_geom (the_geom, type, size)
            SELECT ST_MakeValid(st_transform(geom, 4326)) AS the_geom, $1::planning_unit_grid_shape AS type, $2 AS size
            FROM (${subquery}) grid
            ON CONFLICT (the_geom_hash, type) DO UPDATE SET type = $1::planning_unit_grid_shape
            RETURNING id
          `,
          [job.data.planningUnitGridShape, size],
        );
        const geometryIds = geometries.map((geom) => geom.id);

        const projectsPuRepo = em.getRepository(ProjectsPuEntity);
        await Promise.all(
          chunk(geometryIds, CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS).map(
            async (ids, chunkIndex) => {
              await projectsPuRepo.insert(
                ids.map((id, index) => ({
                  geomId: id,
                  geomType: job.data.planningUnitGridShape,
                  puid:
                    chunkIndex * CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS +
                    (index + 1),
                  projectId: job.data.projectId,
                  planningAreaId: isCustomPlanningAreaJob(job.data)
                    ? job.data.planningAreaId
                    : undefined,
                })),
              );
            },
          ),
        );

        /**
         * @note: Await for all the previous inserts to finish to avoid race conditions
         * @todo: Could this be a bulk update? (single query vs array of queries)
         */
        await Promise.all(
          chunk(geometryIds, CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS).map(
            async (ids) => {
              ids.map((geometryId: string) => {
                return em.query(
                  `
                 INSERT INTO cost_surface_pu_data (projects_pu_id, cost, cost_surface_id)
                 SELECT ppu.id, round(pug.area / 1000000) as area, $1
                    FROM projects_pu ppu
                 INNER JOIN planning_units_geom pug ON pug.id = ppu.geom_id
                 WHERE ppu.geom_id = $2 AND ppu.project_id = $3
                `,
                  [job.data.costSurfaceId, geometryId, job.data.projectId],
                );
              });
            },
          ),
        );

        return geometries;
      });

      await this.repo.updateCostSurfaceRange(job.data.costSurfaceId!);
      this.logger.debug(`Finished planning-units processing for ${job.id}`);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
