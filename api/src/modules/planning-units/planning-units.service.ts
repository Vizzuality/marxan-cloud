import { Logger, Injectable } from '@nestjs/common';

import { Queue, QueueEvents } from 'bullmq';
import * as config from 'config';

import { CreatePlanningUnitsDTO } from './dto/create.planning-units.dto';

/**
 * @see https://docs.bullmq.io/ && https://docs.nestjs.com/techniques/queues
 *
 * @debt Bullmq is expected to be supported soon in the
 * nest.js bull wrapper. In the meanwhile we are using Bullmq
 *
 *
 **/
@Injectable()
export class PlanningUnitsService {
  public readonly queueName: string = 'planning-units';
  private readonly logger: Logger = new Logger(
    `${this.queueName}-queue-publisher`,
  );
  public readonly planningUnitsQueue: Queue = new Queue(this.queueName, {
    ...config.get('redisApi'),
    defaultJobOptions: config.get('jobOptions'),
  });
  private readonly queueEvents: QueueEvents = new QueueEvents(
    this.queueName,
    config.get('redisApi'),
  );
  constructor() {
    this.queueEvents.on('completed', (args) => {
      this.logger.log(
        `this job ${args.jobId} for ${this.queueName} is completed with ${args.returnvalue}`,
      );
    });
    this.queueEvents.on('failed', (args) => {
      this.logger.log(
        `this job ${args.jobId} for ${this.queueName} has failed ${args.failedReason}`,
      );
    });
  }
  /** @description A job should only be triggered when:
   * * An area(extent)/region/custom grid is not supplied -> nothing is triggered
   * * A custom extent (area) is supplied, but not a planning unit area type + grid size or user grid -> nothing is triggered
   * * A planning unit area type + grid size is supplied but not an area(extent)/region/custom grid is provided -> nothing is triggered
   * * An area(extent)/region is provided + a planning unit area type(regular grid hexagon or square or irregular) + grid size -> PU grid generation is triggered.
   * * A custom grid uploaded by the user is provided -> Regular grid creation should not be triggered, but we should upload that grid as a custom one set the PlanningUnitGridShape.fromShapefile and infer the extent and /or admin regions from there. Also, have a way to retrieve that user data as part of the project.
   * **the area extent can be also uploaded by the user but is only a geometry that represents a custom extent.
   * @TODO
   * Validations:
   * * If a user has provided also an admin area / EEZ, this extent must be contained in the adm area provided.
   * * PlanningUnitAreakm2 should be a positive number
   * * This piece will be triggered only if we require to generate a custom regular grid (not user provided PUs)
   * * If a user provides a geometry that represents a custom extent, what will happen with adm fields?
   * * Validation of extent geometry.
   * * Validation of admin codes(this probably should be at project level)
   *
   */

  public async create(creationOptions: CreatePlanningUnitsDTO): Promise<void> {
    await this.planningUnitsQueue.add('create-regular-pu', creationOptions);
  }

  public async onModuleDestroy(): Promise<void> {
    await this.queueEvents.close();
    await this.queueEvents.disconnect();
    await this.planningUnitsQueue.close();
    await this.planningUnitsQueue.disconnect();
  }
}
