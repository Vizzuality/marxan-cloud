import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Connection } from 'typeorm';
import { validate } from 'class-validator';
import { InjectConnection } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';

import {
  PlanningUnitsJob,
  PlanningUnitGridShape,
} from '@marxan-jobs/planning-unit-geometry';

const logger = new Logger('planning-units-job-processor');

@Injectable()
export class PlanningUnitsJobProcessor {
  constructor(
    @InjectConnection()
    private readonly geoConnection: Connection,
  ) {}

  async process(job: Pick<Job<PlanningUnitsJob>, 'data' | 'id' | 'name'>) {
    await createPlanningUnitGridFromJobSpec(job, this.geoConnection);
  }
}

/**
 * @deprecated Workers and jobs should be move to the new functionality
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
const createPlanningUnitGridFromJobSpec = async (
  job: Pick<Job<PlanningUnitsJob>, 'data' | 'id' | 'name'>,
  connection: Connection,
) => {
  logger.debug(`Start planning-units processing for ${job.id}...`);
  /**
   * @description
   * we are validating the data before anything is triggered
   */
  const jobData = plainToClass(PlanningUnitsJob, job.data);
  const errors = await validate(jobData);
  if (errors.length > 0) {
    logger.error(`Validation failed: ${JSON.stringify(errors)}`);
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }

  if (job.name === 'create-regular-pu') {
    try {
      let subquery: string;
      const gridShape: { [value in PlanningUnitGridShape]?: string } = {
        square: 'ST_SquareGrid',
        hexagon: 'ST_HexagonGrid',
      };
      if (job.data.planningAreaId) {
        subquery = `SELECT (${gridShape[job.data.planningUnitGridShape]}(${
          Math.sqrt(job.data.planningUnitAreakm2) * 1000
        }, ST_Transform(a.the_geom, 3410))).*
                    FROM planning_areas a
                    WHERE id = '${job.data.planningAreaId}'`;
      } else if (
        job.data.countryId ||
        job.data.adminAreaLevel1Id ||
        job.data.adminAreaLevel2Id
      ) {
        const filterSQL: string[] = [];
        if (job.data.countryId?.length) {
          filterSQL.push(`gid_0 = '${job.data.countryId}'`);
        } else {
          filterSQL.push(`gid_0 is null`);
        }
        if (job.data.adminAreaLevel1Id?.length) {
          filterSQL.push(`gid_1 = '${job.data.adminAreaLevel1Id}'`);
        } else {
          filterSQL.push(`gid_1 is null`);
        }
        if (job.data.adminAreaLevel2Id?.length) {
          filterSQL.push(`gid_2 = '${job.data.adminAreaLevel2Id}'`);
        } else {
          filterSQL.push(`gid_2 is null`);
        }
        subquery = `SELECT (${gridShape[job.data.planningUnitGridShape]}(${
          Math.sqrt(job.data.planningUnitAreakm2) * 1000
        },
                            ST_Transform(a.the_geom, 3410))).*
                    FROM admin_regions a
                    WHERE ${filterSQL.join(' AND ')}`;
      } else {
        throw new Error(
          'Without valid administrative level or a custom planning Area a regular pu area cannot be created',
        );
      }

      const queryResult = await connection.query(`INSERT INTO planning_units_geom (the_geom, type, size)
                        select st_transform(geom, 4326) as the_geom,
                        '${job.data.planningUnitGridShape}' as type,
                        ${job.data.planningUnitAreakm2} as size from (${subquery}) grid
                        ON CONFLICT (the_geom, type, COALESCE(project_id, '00000000-0000-0000-0000-000000000000')) DO NOTHING;`);
      return queryResult;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
};

export default createPlanningUnitGridFromJobSpec;
