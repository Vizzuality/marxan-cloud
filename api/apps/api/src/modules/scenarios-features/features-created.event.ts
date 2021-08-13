import { FeatureConfigInput } from '@marxan-api/modules/specification/domain';

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
