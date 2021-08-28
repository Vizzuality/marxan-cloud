import { FeatureConfigInput } from '@marxan-api/modules/specification';

export class FeaturesCreated {
  constructor(
    public readonly scenarioId: string,
    public readonly specificationId: string,
    public readonly input: FeatureConfigInput & {
      features: {
        id: string;
        calculated: boolean;
      }[];
    },
  ) {}
}
