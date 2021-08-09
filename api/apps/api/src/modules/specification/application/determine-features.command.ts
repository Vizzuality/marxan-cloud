import { Command } from '@nestjs-architects/typed-cqrs';
import { DetermineFeaturesInput } from '../domain';

export class DetermineFeatures extends Command<void> {
  constructor(public readonly featuresConfig: DetermineFeaturesInput) {
    super();
  }
}
