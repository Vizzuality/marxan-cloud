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

  async findOneByScenarioId(scenarioId: string): Promise<BlmFinalResultEntity> {
    const result = await this.entityManager.findOneOrFail(
      BlmFinalResultEntity,
      {
        where: { scenarioId },
      },
    );
    return result;
  }

  /**
   * clear previous results, move the new ones to target
   * table - everything within transaction
   */
  async saveFinalResults(
    scenarioId: string,
    calibrationId: string,
  ): Promise<void> {
    await this.entityManager.transaction(async (txManager) => {
      await txManager.delete(BlmFinalResultEntity, {
        scenarioId,
      });

      const query = `
        insert into blm_final_results (scenario_id, blm_value, cost, boundary_length, protected_pu_ids)
        select scenario_id, blm_value, cost, boundary_length, protected_pu_ids from blm_partial_results
        where blm_partial_results.scenario_id = $1 and blm_partial_results.calibration_id = $2
      `;

      await txManager.query(query, [scenarioId, calibrationId]);
      await txManager.delete(BlmPartialResultEntity, { scenarioId });
    });

    return Promise.resolve(undefined);
  }

  async updatePngDataOnFinalResults(
    scenarioId: string,
    pngData: string,
  ): Promise<void> {
    await this.entityManager.transaction(async (txManager) => {
      const query = `
        update blm_final_results
        set protected_pu_ids NULL
        where blm_final_results.scenario_id = $1`;
      await txManager.query(query, [scenarioId]);

      const pngDataParsedBuffer = Buffer.from(
        '\\x' + Buffer.from(pngData, 'base64').toString('hex'),
      );
      await txManager.update(
        BlmFinalResultEntity,
        { scenarioId },
        { pngData: pngDataParsedBuffer },
      );
    });
  }
}
