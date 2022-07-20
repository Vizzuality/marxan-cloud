import { FeatureSubSet, SpecificationOperation } from '@marxan/specification';

export type SingleConfigFeatureValue = SingleSplitConfigFeatureValue;

export type SingleSplitConfigFeatureValue = {
  operation: SpecificationOperation.Split;
  splitByProperty: string;
  baseFeatureId: string;
  subset?: FeatureSubSet;
};
