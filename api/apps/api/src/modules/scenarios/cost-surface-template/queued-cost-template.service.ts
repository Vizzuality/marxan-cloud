import {
  ScenarioCostSurfaceTemplateService,
  FileNotFound,
  FileNotReady,
  FilePiped,
} from './scenario-cost-surface-template.service';
import * as stream from 'stream';
import { Injectable } from '@nestjs/common';
import { Queue } from './queue';
import { Storage } from './storage';

@Injectable()
export class QueuedCostTemplateService extends ScenarioCostSurfaceTemplateService {
  constructor(
    private readonly queue: Queue,
    private readonly storage: Storage,
  ) {
    super();
  }

  async getTemplateShapefile(
    scenarioId: string,
    writable: stream.Writable,
  ): Promise<typeof FileNotFound | typeof FileNotReady | typeof FilePiped> {
    const filestream = this.storage.getStream(scenarioId);
    if (filestream) {
      return new Promise((resolve) => {
        filestream.pipe(writable);
        filestream.on('end', () => {
          resolve(FilePiped);
        });
      });
    }
    const isPending = await this.queue.isPending(scenarioId);
    if (isPending) {
      return FileNotReady;
    } else {
      return FileNotFound;
    }
  }

  scheduleTemplateShapefileCreation(scenarioId: string): void {
    this.queue.startProcessing(scenarioId);
  }
}
