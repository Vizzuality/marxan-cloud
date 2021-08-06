import { Command } from '@nestjs-architects/typed-cqrs';

export class CalculateFeaturesForSpecification extends Command<void> {
  constructor(
    public readonly specificationId: string,
    public readonly featureIds: string[],
  ) {
    super();
  }
}
