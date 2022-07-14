export type FeatureAmountPerProjectPlanningUnit = {
  featureId: string;
  amount: number;
  projectPuId: string;
};

export abstract class PuvsprCalculationsRepository {
  abstract areAmountPerPlanningUnitAndFeatureSaved(
    projectId: string,
    featureId: string,
  ): Promise<boolean>;

  abstract getAmountPerPlanningUnitAndFeature(
    projectId: string,
    featureIds: string[],
  ): Promise<FeatureAmountPerProjectPlanningUnit[]>;

  abstract saveAmountPerPlanningUnitAndFeature(
    projectId: string,
    results: FeatureAmountPerProjectPlanningUnit[],
  ): Promise<void>;

  abstract getAmountPerPlanningUnitAndFeatureInProject(
    projectId: string,
  ): Promise<FeatureAmountPerProjectPlanningUnit[]>;
}
