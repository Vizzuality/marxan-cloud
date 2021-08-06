import { Command } from '@nestjs-architects/typed-cqrs';
import { DetermineFeaturesInput } from '../domain';

export class DetermineFeaturesForSpecification extends Command<void> {
  constructor(
    public readonly specificationId: string,
    public readonly featuresConfig: DetermineFeaturesInput,
  ) {
    super();
  }
}
