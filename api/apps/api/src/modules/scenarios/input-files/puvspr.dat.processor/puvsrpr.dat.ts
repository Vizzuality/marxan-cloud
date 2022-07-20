export type FeatureAmountPerPlanningUnitId = {
  featureId: string;
  amount: number;
  puId: number;
};

export abstract class PuvsprDat {
  abstract getAmountPerPlanningUnitAndFeature(
    projectId: string,
    scenarioId: string,
    featureIds: string[],
  ): Promise<FeatureAmountPerPlanningUnitId[]>;
}
