export type FeatureAmountPerPlanningUnit = {
  featureId: string;
  amount: number;
  puid: number;
};

export abstract class PuvsprCalculationsRepository {
  abstract areAmountPerPlanningUnitAndFeatureSaved(
    projectId: string,
    featureId: string,
  ): Promise<boolean>;

  abstract getAmountPerPlanningUnitAndFeature(
    projectId: string,
    featureIds: string[],
  ): Promise<FeatureAmountPerPlanningUnit[]>;

  abstract saveAmountPerPlanningUnitAndFeature(
    projectId: string,
    results: FeatureAmountPerPlanningUnit[],
  ): Promise<void>;

  abstract getAmountPerPlanningUnitAndFeatureInProject(
    projectId: string,
  ): Promise<FeatureAmountPerPlanningUnit[]>;
}
