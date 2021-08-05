import { Command } from '@nestjs-architects/typed-cqrs';
import { FeatureConfigInput, FeatureState } from '../feature-config';

export type DeterminedFeatures = FeatureConfigInput & {
  features: FeatureState[];
};

export class DetermineFeaturesForSpecification extends Command<void> {
  constructor(
    public readonly specificationId: string,
    public readonly featuresConfig: DeterminedFeatures,
  ) {
    super();
  }
}
