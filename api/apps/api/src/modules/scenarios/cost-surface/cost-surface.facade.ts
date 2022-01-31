import { QueueService } from '@marxan-api/modules/queue/queue.service';
import { JobInput } from '@marxan/scenarios-planning-unit';
import { Injectable, Logger } from '@nestjs/common';
import {
  CostSurfaceEventsPort,
  CostSurfaceState,
} from './cost-surface-events.port';

@Injectable()
export class CostSurfaceFacade {
  constructor(
    private readonly events: CostSurfaceEventsPort,
    private readonly queueService: QueueService<JobInput>,
    private readonly logger: Logger = new Logger(CostSurfaceFacade.name),
  ) {}

  convert(scenarioId: string, file: Express.Multer.File): void {
    this.queueService.queue
      .add(`cost-surface-for-${scenarioId}`, {
        scenarioId,
        shapefile: file,
      })
      .then(() => this.events.event(scenarioId, CostSurfaceState.Submitted))
      .catch(async (error) => {
        await this.markAsFailedSubmission(scenarioId, error);
        throw error;
      });
  }

  private markAsFailedSubmission = async (
    scenarioId: string,
    error: unknown,
  ) => {
    this.logger.error(
      `Failed submitting job to queue for ${scenarioId}`,
      String(error),
    );
    await this.events.event(scenarioId, CostSurfaceState.Submitted);
    await this.events.event(scenarioId, CostSurfaceState.CostUpdateFailed, {
      error,
    });
  };
}
