import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '../ports/workspace';
import { BlmBestRunService } from './blm-best-run.service';
import { BlmPartialResultEntity } from './blm-partial-results.geo.entity';

@Injectable()
export class BlmPartialResultsRepository {
  constructor(
    @InjectRepository(BlmPartialResultEntity)
    private readonly repository: Repository<BlmPartialResultEntity>,
    private readonly blmBestRunService: BlmBestRunService,
  ) {}

  cancel(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async savePartialResult(
    workspace: Workspace,
    scenarioId: string,
    calibrationId: string,
    blmValue: number,
  ): Promise<void> {
    const bestRun = await this.blmBestRunService.getBlmCalibrationBestRun(
      workspace,
      calibrationId,
      blmValue,
    );

    await this.repository.save({
      blmValue,
      boundaryLength: bestRun.connectivity,
      scenarioId,
      calibrationId,
      score: bestRun.score,
    });
  }
}
