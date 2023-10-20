import { SingleSplitConfigFeatureValueStripped } from '@marxan/features-hash';

export type FeatureAmountPerPlanningUnit = {
  featureName: string;
  isCustom: boolean;
  amount: number;
  puid: number;
};

export type GeoOperation = Omit<
  SingleSplitConfigFeatureValueStripped,
  'baseFeatureId'
> & { baseFeatureName: string; baseFeatureIsCustom: boolean };

export type ProjectFeatureGeoOperation = {
  featureName: string;
  geoOperation: GeoOperation;
};

export type ProjectFeatureAmountsPerPlanningUnitContent = {
  featureAmountsPerPlanningUnit: FeatureAmountPerPlanningUnit[];
  projectFeaturesGeoOperations: ProjectFeatureGeoOperation[];
};

export const projectFeatureAmountsPerPlanningUnitRelativePath =
  'project-feature-amounts-per-planning-unit.json';
