import { Command } from '@nestjs-architects/typed-cqrs';

export class IntersectWithPlanningUnits extends Command<void> {
  constructor(
    public readonly specificationId: string,
    public readonly scenarioId: string,
  ) {
    super();
  }
}
