import { SingleSplitConfigFeatureValue } from './single-config-feature-value';

export type SingleConfigFeatureValueStripped =
  SingleSplitConfigFeatureValueStripped;

export interface SingleSplitConfigFeatureValueStripped
  extends Omit<SingleSplitConfigFeatureValue, 'subset'> {
  value?: string;
}
