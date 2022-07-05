import { Injectable } from '@nestjs/common';
import {
  FeatureAmountPerPlanningUnit,
  PuvsprCalculationsRepository,
} from './puvspr-calculations.repository';

@Injectable()
export class MemoryPuvsprCalculationsRepository
  implements PuvsprCalculationsRepository {
  public memory: Record<string, FeatureAmountPerPlanningUnit[]> = {};
  async areAmountPerPlanningUnitAndFeatureSaved(
    projectId: string,
    featureId: string,
  ): Promise<boolean> {
    const amountPerPlanningUnitOfFeature = await this.getAmountPerPlanningUnitAndFeature(
      projectId,
      [featureId],
    );

    return Boolean(amountPerPlanningUnitOfFeature.length);
  }
  async getAmountPerPlanningUnitAndFeature(
    projectId: string,
    featureIds: string[],
  ): Promise<FeatureAmountPerPlanningUnit[]> {
    const featureAmountsPerPlanningUnit = this.memory[projectId];

    if (!featureAmountsPerPlanningUnit) return [];

    return featureAmountsPerPlanningUnit.filter(({ featureId }) =>
      featureIds.includes(featureId),
    );
  }
  async saveAmountPerPlanningUnitAndFeature(
    projectId: string,
    results: FeatureAmountPerPlanningUnit[],
  ): Promise<void> {
    this.memory[projectId] = results;
  }
  async getAmountPerPlanningUnitAndFeatureInProject(
    projectId: string,
  ): Promise<FeatureAmountPerPlanningUnit[]> {
    return this.memory[projectId];
  }
}
