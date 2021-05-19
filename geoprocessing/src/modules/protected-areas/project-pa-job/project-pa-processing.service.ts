import { Injectable } from '@nestjs/common';
import { WorkerService } from '../../worker/worker.service';
import { ProtectedAreasJobInput } from './project-pa-job.input';
import { ApiEventsService } from '../../api-events/api-events.service';

@Injectable()
export class ProjectPaProcessingService {
  constructor(
    private readonly workerService: WorkerService<ProtectedAreasJobInput>,
    private readonly apiEvents: ApiEventsService,
  ) {
    workerService.registerEventHandler('completed', (args) => {
      console.log(`job completed:`, args);
    });
    workerService.registerEventHandler('failed', (args) => {
      console.log(`job failed:`, args);
    });
    workerService.registerEventHandler('drained', (args) => {
      console.log(`job drained:`, args);
    });
  }
}
