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
  apiFeature: { isCustom: boolean; featureClassName: string };
  featureDataFeature: { isCustom: boolean; featureClassName: string };
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
  amountFromLegacyProject?: number | null;
  outputFeaturesData: OutputFeatureDataElement[];
};

export type ScenarioFeaturesDataContent = {
  featuresData: FeatureDataElement[];
};
