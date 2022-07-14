import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { PuvsprCalculationsEntity } from '../puvspr-calculations.geo.entity';
import { geoEntityManagerToken } from '../puvspr-calculations.service';
import {
  FeatureAmountPerProjectPlanningUnit,
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
  ): Promise<FeatureAmountPerProjectPlanningUnit[]> {
    return this.geoEntityManager
      .createQueryBuilder()
      .select('amount')
      .addSelect('project_pu_id', 'projectPuId')
      .addSelect('feature_id', 'featureId')
      .from(PuvsprCalculationsEntity, 'puvspr')
      .where('project_id = :projectId', { projectId })
      .execute();
  }

  public async getAmountPerPlanningUnitAndFeature(
    projectId: string,
    featureIds: string[],
  ): Promise<FeatureAmountPerProjectPlanningUnit[]> {
    return this.geoEntityManager
      .createQueryBuilder()
      .select('amount')
      .addSelect('project_pu_id', 'projectPuId')
      .addSelect('feature_id', 'featureId')
      .from(PuvsprCalculationsEntity, 'puvspr')
      .where('project_id = :projectId', { projectId })
      .andWhere('feature_id IN (:...featureIds)', { featureIds })
      .execute();
  }

  public async saveAmountPerPlanningUnitAndFeature(
    projectId: string,
    results: FeatureAmountPerProjectPlanningUnit[],
  ) {
    const repo = this.geoEntityManager.getRepository(PuvsprCalculationsEntity);
    await repo.save(
      results.map(({ amount, projectPuId, featureId }) => ({
        projectId,
        featureId,
        amount,
        projectPuId,
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
