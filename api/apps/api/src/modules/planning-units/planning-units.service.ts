import { Injectable } from '@nestjs/common';

import { QueueService } from '@marxan-api/modules/queue/queue.service';
import { CreatePlanningUnitsDTO } from './dto/create.planning-units.dto';

@Injectable()
export class PlanningUnitsService {
  constructor(
    private readonly queueService: QueueService<CreatePlanningUnitsDTO>,
  ) {}

  public async create(creationOptions: CreatePlanningUnitsDTO): Promise<void> {
    await this.queueService.queue.add('create-regular-pu', creationOptions);
  }
}
