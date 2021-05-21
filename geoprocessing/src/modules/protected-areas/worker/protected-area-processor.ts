import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { WorkerProcessor } from '../../worker';
import { ProtectedAreasJobInput } from './worker-input';
import { ShapefileService } from '../../shapefiles/shapefiles.service';

@Injectable()
export class ProtectedAreaProcessor
  implements WorkerProcessor<ProtectedAreasJobInput, void> {
  constructor(private readonly shapefileService: ShapefileService) {}

  async process(job: Job<ProtectedAreasJobInput, void>): Promise<void> {
    console.log(
      `[ProtectedAreaProcessor] processing....`,
      job.data.projectId,
      job.data.file.filename,
    );
  }
}
