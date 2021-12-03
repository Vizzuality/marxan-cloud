import { Command } from '@nestjs-architects/typed-cqrs';

export class UpdatePlanningUnitsCommand extends Command<void> {
  constructor(
    public readonly scenarioId: string,
    public readonly threshold: number,
    public readonly protectedAreasIds: string[],
  ) {
    super();
  }
}
