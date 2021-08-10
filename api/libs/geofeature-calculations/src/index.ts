export const splitQueueName = 'geofeatures-split';
export const copyQueueName = 'geofeatures-copy';
export const stratificationQueueName = 'geofeatures-stratification';

export interface FeaturesJobData {
  featureId: string;
  scenarioId: string;
}

export type CopyJobData = FeaturesJobData;
export type SplitJobData = FeaturesJobData;
export type StratificationJobData = FeaturesJobData;
