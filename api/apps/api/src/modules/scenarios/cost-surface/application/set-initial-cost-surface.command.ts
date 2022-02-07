import { Command } from '@nestjs-architects/typed-cqrs';

export class SetInitialCostSurface extends Command<void> {
  constructor(
    public readonly scenarioId: string,
    public readonly projectId: string,
  ) {
    super();
  }
}
