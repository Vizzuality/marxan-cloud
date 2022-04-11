export const scenarioFeaturesDataRelativePath = `scenario-features-data.json`;

export type OutputFeatureDataElement = {
  runId: number;
  amount?: number;
  totalArea?: number;
  occurrences?: number;
  separation?: number;
  target?: boolean;
  mpm?: number;
};

export type FeatureDataElement = {
  featureClassName: string;
  featureDataHash: string;
  totalArea: number;
  currentArea: number;
  fpf?: number;
  target?: number;
  prop?: number;
  target2?: number;
  targetocc?: number;
  sepNum?: number;
  metadata?: Record<'sepdistance', number | string>;
  featureId: number;
  specificationId?: string;
  outputFeaturesData: OutputFeatureDataElement[];
};

export type ScenarioFeaturesDataContent = {
  customFeaturesData: FeatureDataElement[];
  platformFeaturesData: FeatureDataElement[];
};
