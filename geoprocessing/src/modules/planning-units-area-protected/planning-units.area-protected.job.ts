import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { geoprocessingConnections } from 'src/ormconfig';
import { createConnection } from 'typeorm';
import { validate } from 'class-validator';

import { AreaProtectedForPlanningUnitsJob } from './dto/calculate.planning-units.area-protected.dto';
import { plainToClass } from 'class-transformer';

const logger = new Logger('planning-units-job-processor');

/**
 * @description This function will take care of calculating the area protected within each PU
 *
 *
 * @TODO
 *if:
 * * iucn_cat or wdpaids are seted
 * * And threshold is defined by user.
 * Calculate and update the area protected within each pu.
 */
const calculatePlanningUnitAreaProtectedJobSpec = async (
  job: Pick<Job<AreaProtectedForPlanningUnitsJob>, 'data' | 'id' | 'name'>,
) => {
  logger.debug(`Start planning-units processing for ${job.id}...`);
  /**
   * @description
   * we are validating the data before anything is triggered
   */
  const jobData = plainToClass(AreaProtectedForPlanningUnitsJob, job.data);
  const errors = await validate(jobData);
  if (errors.length > 0) {
    logger.error(`Validation failed: ${JSON.stringify(errors)}`);
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }

  if (job.name === 'create-regular-pu') {
    const connection = await createConnection(geoprocessingConnections.default);
    try {
      /**
       * @todo
       * Need to trigger the calcs for area protection if:
       * * iucn_cat or wdpaids are seted
       * * And threshold is defined by user.
       */
      return 0;
    } catch (err) {
      logger.error(err);
      throw err;
    } finally {
      await connection.close();
    }
  }
};

export default calculatePlanningUnitAreaProtectedJobSpec;
