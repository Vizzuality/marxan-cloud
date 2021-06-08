import { Injectable, Logger } from '@nestjs/common';
import { Express } from 'express';
import { QueueService } from '../../queue/queue.service';
import { ApiEventsService } from '../../api-events/api-events.service';
import { API_EVENT_KINDS } from '@marxan/api-events';

export interface ProtectedAreasJobInput {
  projectId: string;
  file: Express.Multer.File;
}

@Injectable()
export class ProtectedAreasFacade {
  constructor(
    private readonly queueService: QueueService<ProtectedAreasJobInput>,
    private readonly apiEvents: ApiEventsService,
    private readonly logger: Logger = new Logger(ProtectedAreasFacade.name),
  ) {}

  convert(projectId: string, file: Express.Multer.File): void {
    this.queueService.queue
      .add(`protected-areas-for-${projectId}`, {
        projectId,
        file,
      })
      .then(() => {
        return this.apiEvents.create({
          kind: API_EVENT_KINDS.project__protectedAreas__submitted__v1__alpha,
          topic: projectId,
        });
      })
      .catch(async (error) => {
        await this.markAsFailedSubmission(projectId, error);
        throw error;
      });
  }

  private markAsFailedSubmission = async (
    projectId: string,
    error: unknown,
  ) => {
    this.logger.error(
      `Failed submitting job to queue for ${projectId}`,
      String(error),
    );
    await this.apiEvents.create({
      kind: API_EVENT_KINDS.project__protectedAreas__submitted__v1__alpha,
      topic: projectId,
    });
    await this.apiEvents.create({
      kind: API_EVENT_KINDS.project__protectedAreas__failed__v1__alpha,
      topic: projectId,
      data: {
        error: `Failed submission`,
        message: String(error),
      },
    });
  };
}
