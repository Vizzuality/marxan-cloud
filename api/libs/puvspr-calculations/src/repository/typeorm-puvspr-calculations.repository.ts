import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { PuvsprCalculationsEntity } from '../puvspr-calculations.geo.entity';
import { geoEntityManagerToken } from '../puvspr-calculations.service';
import {
  FeatureAmountPerPlanningUnit,
  PuvsprCalculationsRepository,
} from './puvspr-calculations.repository';

@Injectable()
export class TypeOrmPuvsprCalculationsRepository
  implements PuvsprCalculationsRepository {
  constructor(
    @Inject(geoEntityManagerToken)
    private readonly geoEntityManager: EntityManager,
  ) {}
  async getAmountPerPlanningUnitAndFeatureInProject(
    projectId: string,
  ): Promise<FeatureAmountPerPlanningUnit[]> {
    return this.geoEntityManager
      .createQueryBuilder()
      .select('amount')
      .addSelect('pu_id', 'puid')
      .addSelect('feature_id', 'featureId')
      .from(PuvsprCalculationsEntity, 'puvspr')
      .where('project_id = :projectId', { projectId })
      .execute();
  }

  public async getAmountPerPlanningUnitAndFeature(
    projectId: string,
    featureIds: string[],
  ): Promise<FeatureAmountPerPlanningUnit[]> {
    return this.geoEntityManager
      .createQueryBuilder()
      .select('amount')
      .addSelect('pu_id', 'puid')
      .addSelect('feature_id', 'featureId')
      .from(PuvsprCalculationsEntity, 'puvspr')
      .where('project_id = :projectId', { projectId })
      .andWhere('feature_id IN (:...featureIds)', { featureIds })
      .execute();
  }

  public async saveAmountPerPlanningUnitAndFeature(
    projectId: string,
    results: FeatureAmountPerPlanningUnit[],
  ) {
    const repo = this.geoEntityManager.getRepository(PuvsprCalculationsEntity);
    console.log('saving');
    await repo.save(
      results.map(({ amount, puid, featureId }) => ({
        projectId,
        featureId,
        amount,
        puid,
      })),
    );
  }

  public async areAmountPerPlanningUnitAndFeatureSaved(
    projectId: string,
    featureId: string,
  ) {
    const result = await this.getAmountPerPlanningUnitAndFeature(projectId, [
      featureId,
    ]);

    return result.length > 0;
  }
}
