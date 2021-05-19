import { Injectable } from '@nestjs/common';
import { WorkerService } from '../worker/worker.service';
import { PlanningUnitsJob } from './dto/create.regular.planning-units.dto';

@Injectable()
export class PlanningUnitsProcessing {
  constructor(
    private readonly workerService: WorkerService<PlanningUnitsJob>,
  ) {}
}
