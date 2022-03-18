import { hasProp } from "@marxan-api/utils/typesafe-has-prop.utils";

export const splitQueueName = 'geofeatures-split';
export const copyQueueName = 'geofeatures-copy';
export const stratificationQueueName = 'geofeatures-stratification';

export interface FeaturesJobData {
  featureId: string;
  scenarioId: string;
  specificationId: string;
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

export function assertIsFeaturesJobProgressData(value: unknown): asserts value is FeaturesJobProgress {
  // @TODO implement this assertion
  if(false) {
    throw new TypeError('Expected \'FeaturesJobProgress\' type, but data does not match this type');
  }
  return;
}
