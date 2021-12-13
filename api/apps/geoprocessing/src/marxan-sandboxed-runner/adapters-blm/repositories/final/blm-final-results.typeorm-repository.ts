import { Injectable } from '@nestjs/common';
import { BlmFinalResultEntity } from '@marxan/blm-calibration/blm-final-results.geo.entity';
import { EntityManager, Not } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ExecutionResult } from '@marxan/marxan-output';

@Injectable()
export class BlmFinalResultsTypeormRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async saveBest(
    results: ExecutionResult,
    calibrationId: string,
    scenarioId: string,
    blmValue: number,
  ): Promise<void> {
    const best = results.filter((r) => r.best);
    await this.entityManager.transaction(async (txManager) => {
      await txManager.delete(BlmFinalResultEntity, {
        calibrationId: Not(calibrationId),
        scenarioId,
      });

      await txManager.insert(
        BlmFinalResultEntity,
        best.map((el) => ({
          blmValue,
          calibrationId,
          scenarioId,
          score: el.score,
          boundaryLength: el.connectivity,
        })),
      );
    });
  }
}
