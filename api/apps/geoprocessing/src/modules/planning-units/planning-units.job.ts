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
import { EntityManager } from 'typeorm';

type CustomPlanningAreaJob = Required<
  Omit<
    PlanningUnitsJob,
    'countryId' | 'adminRegionId' | 'adminAreaLevel1Id' | 'adminAreaLevel2Id'
  >
>;
type RegularPlanningAreaJob = Omit<PlanningUnitsJob, 'planningAreaId'>;

function isCustomPlanningAreaJob(
  job: PlanningUnitsJob,
): job is CustomPlanningAreaJob {
  return job.planningAreaId !== undefined;
}

@Injectable()
export class PlanningUnitsJobProcessor {
  private logger = new Logger('planning-units-job-processor');

  private gridShapeFnMapping: { [value in PlanningUnitGridShape]?: string } = {
    [PlanningUnitGridShape.Hexagon]: 'ST_HexagonGrid',
    [PlanningUnitGridShape.Square]: 'ST_SquareGrid',
  };

  constructor(
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
    const gridFn = this.gridShapeFnMapping[data.planningUnitGridShape];
    const size = Math.sqrt(data.planningUnitAreakm2) * 1000;

    return `
      WITH region AS (
        SELECT ST_Transform(the_geom, 3410) as geom
        FROM planning_areas
        WHERE id = '${data.planningAreaId}'
      ), grid AS (
        SELECT (${gridFn}(${size}, geom)).*
        FROM region
      )
      SELECT grid.geom
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
    const gridFn = this.gridShapeFnMapping[planningUnitGridShape];
    const size = Math.sqrt(planningUnitAreakm2) * 1000;

    return `
      WITH region AS (
        SELECT ST_Transform(the_geom, 3410) as geom
        FROM admin_regions
        WHERE ${whereConditions.join(' AND ')}
      ), grid AS (
        SELECT (${gridFn}(${size}, geom)).*
        FROM region
      )
      SELECT grid.geom
      FROM grid, region
      WHERE ST_Intersects(grid.geom, region.geom)
    `;
  }

  private getGridSubquery(data: PlanningUnitsJob): string {
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
  async process(job: Job<PlanningUnitsJob>): Promise<void> {
    this.logger.debug(`Start planning-units processing for ${job.id}...`);

    await this.ensureJobDataIsValid(job);

    try {
      const subquery = this.getGridSubquery(job.data);

      await this.entityManager.transaction(async (em) => {
        const geometries: { id: string }[] = await em.query(
          `
            INSERT INTO planning_units_geom (the_geom, type, size)
            SELECT st_transform(geom, 4326) AS the_geom, $1::planning_unit_grid_shape AS type, $2 AS size 
            FROM (${subquery}) grid
            ON CONFLICT (the_geom_hash, type) DO UPDATE SET type = $1::planning_unit_grid_shape
            RETURNING id
          `,
          [job.data.planningUnitGridShape, job.data.planningUnitAreakm2],
        );
        const geometryIds = geometries.map((geom) => geom.id);
        const projectsPuRepo = em.getRepository(ProjectsPuEntity);
        await projectsPuRepo.save(
          geometryIds.map((id, index) => ({
            geomId: id,
            geomType: job.data.planningUnitGridShape,
            puid: index + 1,
            projectId: job.data.projectId,
          })),
        );

        return geometries;
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
