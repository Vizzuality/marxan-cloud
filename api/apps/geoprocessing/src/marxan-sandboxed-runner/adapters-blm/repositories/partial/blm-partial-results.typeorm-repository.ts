import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExecutionResult } from '@marxan/marxan-output';
import { BlmPartialResultsRepository } from './blm-partial-results.repository';
import { BlmPartialResultEntity } from '@marxan/blm-calibration/blm-partial-results.geo.entity';

@Injectable()
export class BlmPartialResultsTypeormRepository
  implements BlmPartialResultsRepository {
  constructor(
    @InjectRepository(BlmPartialResultEntity)
    private readonly repository: Repository<BlmPartialResultEntity>,
  ) {}

  async save(
    results: ExecutionResult,
    scenarioId: string,
    blmValue: number,
  ): Promise<void> {
    await this.repository.save(
      results.map((r) => ({
        blmValue,
        scenarioId,
        score: r.score,
        boundaryLength: r.connectivity,
      })),
    );
  }
}
