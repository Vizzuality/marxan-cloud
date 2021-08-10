export const splitQueueName = 'geofeatures-split';
export const copyQueueName = 'geofeatures-copy';
export const stratificationQueueName = 'geofeatures-stratification';

export interface FeaturesJobData {
  featureId: string;
  scenarioId: string;
}

export type FeaturesJobCancelProgress = {
  type: 'canceled';
  canceled: boolean;
} & FeaturesJobData;
export type FeaturesJobProgress =
  | {
      type: 'empty';
    }
  | FeaturesJobCancelProgress;

export type CopyJobData = FeaturesJobData;
export type SplitJobData = FeaturesJobData;
export type StratificationJobData = FeaturesJobData;
