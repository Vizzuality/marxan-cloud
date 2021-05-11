import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { geoprocessingConnections } from 'src/ormconfig';
import { createConnection } from 'typeorm';
import { validate } from 'class-validator';

<<<<<<< HEAD
import { PlanningUnitsForScenarioJob } from './dto/attach.planning-units.scenario.dto';
=======
import {
  PlanningUnitsForScenarioJob,
  PlanningUnitGridShape,
} from './dto/attach.planning-units.scenario.dto';
>>>>>>> wip
import { plainToClass } from 'class-transformer';

const logger = new Logger('planning-units-job-processor');

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
const attachPlanningUnitGridToScenarioJobSpec = async (
  job: Pick<Job<PlanningUnitsForScenarioJob>, 'data' | 'id' | 'name'>,
) => {
  logger.debug(`Attaching planning-units to scenario ${job.data.scenarioId}`);
  /**
   * @description
   * we are validating the data before anything is triggered
   */
  const jobData = plainToClass(PlanningUnitsForScenarioJob, job.data);
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
<<<<<<< HEAD
       * From the Project
       * * Get the extent/admin-region used to generate the geometries of the PU
       * * Get the size and type of the pu
       * After that Insert into the table scenarios_pu_data.
       * Need to trigger the calcs for area protection if:
       * * iucn_cat or wdpaids are seted
       * * And threshold is defined by user.
=======
       * TBD this will also need to trigger if is already defined the calcs for area protection
>>>>>>> wip
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

export default attachPlanningUnitGridToScenarioJobSpec;
