import { FeatureConfigInput, FeatureState } from './feature-config';

export type DetermineFeaturesInput = FeatureConfigInput & {
  features: FeatureState[];
};
