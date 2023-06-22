import {
  FileNotFound,
  FileNotReady,
  FilePiped,
} from './scenario-cost-surface-template.service';
import * as stream from 'stream';
import { Injectable } from '@nestjs/common';
import { Queue } from './queue';
import { Storage } from './storage';

@Injectable()
export class QueuedCostTemplateService {
  constructor(
    private readonly queue: Queue,
    private readonly storage: Storage,
  ) {}

  async getTemplateShapefile(
    projectId: string,
    writable: stream.Writable,
  ): Promise<typeof FileNotFound | typeof FileNotReady | typeof FilePiped> {
    const filestream = await this.storage.getStream(projectId);
    if (filestream) {
      return new Promise((resolve, reject) => {
        filestream.pipe(writable).on(`error`, reject);
        writable.on(`finish`, () => {
          resolve(FilePiped);
        });
      });
    }
    const isPending = await this.queue.isPending(projectId);
    if (isPending) {
      return FileNotReady;
    } else {
      return FileNotFound;
    }
  }

  scheduleTemplateShapefileCreation(projectId: string): void {
    this.queue.startProcessing(projectId);
  }
}
