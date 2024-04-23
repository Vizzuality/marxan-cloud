import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { FeatureAmountsPerPlanningUnitEntity } from '../feature-amounts-per-planning-unit.geo.entity';
import { geoEntityManagerToken } from '../feature-amounts-per-planning-units.service';
import {
  FeatureAmountPerProjectPlanningUnit,
  FeatureAmountsPerPlanningUnitRepository,
} from './feature-amounts-per-planning-unit.repository';

@Injectable()
export class TypeormFeatureAmountsPerPlanningUnitRepository
  implements FeatureAmountsPerPlanningUnitRepository
{
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
      .from(FeatureAmountsPerPlanningUnitEntity, 'fappu')
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
      .from(FeatureAmountsPerPlanningUnitEntity, 'fappu')
      .where('project_id = :projectId', { projectId })
      .andWhere('feature_id IN (:...featureIds)', { featureIds })
      /** The Marxan solver will show unexpected behaviour when seeing
       * puvspr.dat rows with amount = 0 */
      .andWhere('amount > 0')
      .execute();
  }

  public async saveAmountPerPlanningUnitAndFeature(
    projectId: string,
    results: FeatureAmountPerProjectPlanningUnit[],
  ) {
    const repo = this.geoEntityManager.getRepository(
      FeatureAmountsPerPlanningUnitEntity,
    );
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
