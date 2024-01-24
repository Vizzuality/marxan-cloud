import { Injectable } from '@nestjs/common';
import {
  FeatureAmountPerProjectPlanningUnit,
  FeatureAmountsPerPlanningUnitRepository,
} from './feature-amounts-per-planning-unit.repository';

@Injectable()
export class MemoryFeatureAmountsPerPlanningUnitRepository
  implements FeatureAmountsPerPlanningUnitRepository
{
  public memory: Record<string, FeatureAmountPerProjectPlanningUnit[]> = {};
  async areAmountPerPlanningUnitAndFeatureSaved(
    projectId: string,
    featureId: string,
  ): Promise<boolean> {
    const amountPerPlanningUnitOfFeature =
      await this.getAmountPerPlanningUnitAndFeature(projectId, [featureId]);

    return Boolean(amountPerPlanningUnitOfFeature.length);
  }
  async getAmountPerPlanningUnitAndFeature(
    projectId: string,
    featureIds: string[],
  ): Promise<FeatureAmountPerProjectPlanningUnit[]> {
    const featureAmountsPerPlanningUnit = this.memory[projectId];

    if (!featureAmountsPerPlanningUnit) return [];

    return featureAmountsPerPlanningUnit.filter(({ featureId }) =>
      featureIds.includes(featureId),
    );
  }
  async saveAmountPerPlanningUnitAndFeature(
    projectId: string,
    results: FeatureAmountPerProjectPlanningUnit[],
  ): Promise<void> {
    this.memory[projectId] = results;
  }
  async getAmountPerPlanningUnitAndFeatureInProject(
    projectId: string,
  ): Promise<FeatureAmountPerProjectPlanningUnit[]> {
    return this.memory[projectId];
  }
}
