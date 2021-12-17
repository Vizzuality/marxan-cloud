import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BlmFinalResultEntity } from '@marxan/blm-calibration/blm-final-results.geo.entity';
import { BlmPartialResultEntity } from './blm-partial-results.geo.entity';

@Injectable()
export class BlmFinalResultsRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  cancel(): Promise<void> {
    return Promise.resolve(undefined);
  }

  /**
   * clear previous results, move the new ones to target
   * table - everything within transaction
   */
  async saveFinalResults(scenarioId: string): Promise<void> {
    await this.entityManager.transaction(async (txManager) => {
      await txManager.delete(BlmFinalResultEntity, {
        scenarioId,
      });

      const partialResults = await txManager.find(BlmPartialResultEntity, {
        where: {
          scenarioId,
        },
      });

      await txManager.save(
        BlmFinalResultEntity,
        partialResults.map((partial) => ({
          scenarioId: partial.scenarioId,
          blmValue: partial.blmValue,
          score: partial.score,
          boundaryLength: partial.boundaryLength,
        })),
      );

      await txManager.remove(BlmPartialResultEntity, partialResults);
    });

    return Promise.resolve(undefined);
  }
}
