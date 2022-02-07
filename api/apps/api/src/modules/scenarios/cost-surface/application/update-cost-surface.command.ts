import { Command } from '@nestjs-architects/typed-cqrs';
import { FromShapefileJobInput } from '@marxan/scenario-cost-surface';

export class UpdateCostSurface extends Command<void> {
  constructor(
    public readonly scenarioId: string,
    public readonly shapefile: FromShapefileJobInput['shapefile'],
  ) {
    super();
  }
}
