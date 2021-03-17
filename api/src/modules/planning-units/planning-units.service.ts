import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CreatePlanningUnitsDTO } from './dto/create.planning-units.dto';

/**
 * @see https://docs.nestjs.com/techniques/queues
 *
 * @debt Bullmq is expected to be supported soon in the
 * nest.js bull wrapper. In the meanwhile we are using Bullmq
 * in the worker
 * and bull in the Queue and job publication
 *
 * For some reason delayed jobs are not seen by the
 * geoprocessing service
 *
 **/
@Injectable()
export class PlanningUnitsService {
  constructor(
    @InjectQueue('planning-units') private readonly planningUnitsQueue: Queue,
  ) {}

  public async create(creationOptions: CreatePlanningUnitsDTO) {
    await this.planningUnitsQueue.add('transcode', creationOptions,
    {
      attempts: 3,
      // delay: 3000, // For some reason delayed does not properly work
      timeout: 10000
    });
  }

  public async isReady() {
    await this.planningUnitsQueue.on('completed', (job, result) => {
      console.log(`Job with id ${job.id} is completed with result ${result}`);
  })
}
public async hasFail() {
  await this.planningUnitsQueue.on('failed', (job, err) => {
    console.log(`Failed job ${job.id} with ${err}`);
})
}
}
