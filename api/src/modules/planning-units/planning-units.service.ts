import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CreatePlanningUnitsDTO } from './dto/create.planning-units.dto';
import { UpdatePlanningUnitsDTO } from './dto/update.planning-units.dto';

@Injectable()
export class PlanningUnitsService {
  constructor(
    @InjectQueue('planning-units') private readonly planningUnitsQueue: Queue,
  ) {}

  public async create(creationOptions: CreatePlanningUnitsDTO) {
    await this.planningUnitsQueue.add('transcode', creationOptions,
    {
      attempts: 3,
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
