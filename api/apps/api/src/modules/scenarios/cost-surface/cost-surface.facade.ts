import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '@marxan-api/modules/queue/queue.service';
import {
  CostSurfaceEventsPort,
  CostSurfaceState,
} from './cost-surface-events.port';
import { CostSurfaceJobInput } from './job-input';

@Injectable()
export class CostSurfaceFacade {
  constructor(
    private readonly events: CostSurfaceEventsPort,
    private readonly queueService: QueueService<CostSurfaceJobInput>,
    private readonly logger: Logger = new Logger(CostSurfaceFacade.name),
  ) {}

  async convert(scenarioId: string, file: Express.Multer.File): Promise<void> {
    try {
      await this.queueService.queue.add(`cost-surface-for-${scenarioId}`, {
        scenarioId,
        shapefile: file,
      });
      await this.events.event(scenarioId, CostSurfaceState.Submitted);
    } catch (error) {
      await this.markAsFailedSubmission(scenarioId, error);
      throw error;
    }
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
