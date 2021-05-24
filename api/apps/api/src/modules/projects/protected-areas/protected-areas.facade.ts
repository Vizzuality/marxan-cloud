import { Injectable, Logger } from '@nestjs/common';
import { Express } from 'express';
import { QueueService } from '../../queue/queue.service';

export interface ProtectedAreasJobInput {
  projectId: string;
  file: Express.Multer.File;
}

@Injectable()
export class ProtectedAreasFacade {
  constructor(
    private readonly queueService: QueueService<ProtectedAreasJobInput>,
    private readonly logger: Logger = new Logger(ProtectedAreasFacade.name),
  ) {}

  convert(projectId: string, file: Express.Multer.File): void {
    this.queueService.queue
      .add(`protected-areas-for-${projectId}`, {
        projectId,
        file,
      })
      .then(() => {
        // ok
      })
      .catch((error) => {
        this.logger.error(
          `Failed submitting job to queue for ${projectId}`,
          error,
        );
        throw error; // failed submission
      });
  }
}
