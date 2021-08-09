import { Command } from '@nestjs-architects/typed-cqrs';

export class CalculateFeatures extends Command<void> {
  constructor(public readonly featureIds: string[]) {
    super();
  }
}
