import { Command } from '@nestjs-architects/typed-cqrs';
import { FeatureConfigInput } from '@marxan-api/modules/specification/domain';

export class CreateFeaturesCommand extends Command<void> {
  constructor(
    public readonly scenarioId: string,
    public readonly input: FeatureConfigInput,
  ) {
    super();
  }
}
