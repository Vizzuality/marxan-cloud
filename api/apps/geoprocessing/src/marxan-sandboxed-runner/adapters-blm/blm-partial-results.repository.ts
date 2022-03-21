import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Workspace } from '../ports/workspace';
import { BlmBestRunService } from './blm-best-run.service';
import { BlmPuidFromBestRunService } from './blm-output-best-run.service';
import { BlmPartialResultEntity } from './blm-partial-results.geo.entity';

@Injectable()
export class BlmPartialResultsRepository {
  constructor(
    @InjectRepository(BlmPartialResultEntity)
    private readonly repository: Repository<BlmPartialResultEntity>,
    private readonly blmBestRunService: BlmBestRunService,
    private readonly blmPuidsBestService: BlmPuidFromBestRunService,
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

    const puidList = await this.blmPuidsBestService.getPuidFromBestRun(
      workspace,
    );

    const filteredPuidList = puidList
      .filter((puidRow) => puidRow.solution !== 0)
      .map((puidRow) => puidRow.puid);

    await this.repository.save({
      blmValue,
      boundaryLength: bestRun.connectivity,
      scenarioId,
      calibrationId,
      cost: bestRun.cost,
      protected_pu_ids: filteredPuidList,
    });
  }

  async removePreviousPartialResults(
    scenarioId: string,
    currentCalibrationId: string,
  ): Promise<void> {
    await this.repository.delete({
      scenarioId,
      calibrationId: Not(currentCalibrationId),
    });
  }
}
