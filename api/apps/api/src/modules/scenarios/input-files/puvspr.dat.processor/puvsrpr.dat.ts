import { FeatureAmountPerPlanningUnit } from '@marxan/puvspr-calculations';

export abstract class PuvsprDat {
  abstract getAmountPerPlanningUnitAndFeature(
    projectId: string,
    scenarioId: string,
    featureIds: string[],
  ): Promise<FeatureAmountPerPlanningUnit[]>;
}
