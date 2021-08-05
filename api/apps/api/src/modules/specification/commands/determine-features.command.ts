import { Command } from '@nestjs-architects/typed-cqrs';
import { FeatureConfigInput, FeatureState } from '../feature-config';

export type DeterminedFeatures = FeatureConfigInput & {
  features: FeatureState[];
};

export class DetermineFeatures extends Command<void> {
  constructor(public readonly featuresConfig: DeterminedFeatures) {
    super();
  }
}
