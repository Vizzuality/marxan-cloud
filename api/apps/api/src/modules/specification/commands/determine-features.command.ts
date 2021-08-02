import { ICommand } from '@nestjs/cqrs';
import { FeatureConfigInput, FeatureState } from '../feature-config';

export type DeterminedFeatures = FeatureConfigInput & {
  features: FeatureState[];
};

export class DetermineFeatures implements ICommand {
  constructor(public readonly featuresConfig: DeterminedFeatures) {}
}
