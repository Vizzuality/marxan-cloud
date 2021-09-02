import { Command } from '@nestjs-architects/typed-cqrs';
import { FeatureConfigInput } from '@marxan-api/modules/specification';

export class CreateFeaturesCommand extends Command<void> {
  constructor(
    public readonly scenarioId: string,
    public readonly specificationId: string,
    public readonly input: FeatureConfigInput,
    public readonly doNotCalculateAreas?: boolean,
  ) {
    super();
  }
}
