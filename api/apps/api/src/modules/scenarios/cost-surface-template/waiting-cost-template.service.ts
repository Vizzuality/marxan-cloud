import * as stream from 'stream';
import { Injectable, Logger } from '@nestjs/common';
import { QueuedCostTemplateService } from './queued-cost-template.service';
import {
  ScenarioCostSurfaceTemplateService,
  FileNotFound,
  FileNotReady,
  FilePiped,
} from './scenario-cost-surface-template.service';

@Injectable()
export class WaitingCostTemplateService
  implements ScenarioCostSurfaceTemplateService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly templateService: QueuedCostTemplateService) {}

  async getTemplateShapefile(
    scenarioId: string,
    stream: stream.Writable,
  ): Promise<typeof FileNotReady | typeof FilePiped> {
    let result = await this.templateService.getTemplateShapefile(
      scenarioId,
      stream,
    );
    if (result === FileNotFound) {
      await this.templateService.scheduleTemplateShapefileCreation(scenarioId);
    }
    if (result === FilePiped) {
      return FilePiped;
    }
    const retryDelay = 200;
    const retries = 150;
    for await (const attemptNumber of this.retry(retries, retryDelay)) {
      result = await this.templateService.getTemplateShapefile(
        scenarioId,
        stream,
      );
      if (result === FilePiped) {
        this.logger.debug(
          `a template got available after ${
            (attemptNumber * retryDelay) / 1000
          }s`,
        );
        return FilePiped;
      }
      if (result === FileNotReady) {
        continue;
      }
    }
    return FileNotReady;
  }

  private retry(retries: number, timeout: number) {
    return {
      [Symbol.asyncIterator]: async function* () {
        for (let index = 0; index < retries; index++) {
          yield index;
          await new Promise((resolve) => setTimeout(resolve, timeout));
        }
      },
    };
  }
}
