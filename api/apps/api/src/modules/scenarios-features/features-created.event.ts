import { FeatureConfigInput } from './create-features.command';

export class FeaturesCreated {
  constructor(
    public readonly scenarioId: string,
    public readonly input: FeatureConfigInput & {
      features: {
        id: string;
        calculated: boolean;
      }[];
    },
  ) {}
}
