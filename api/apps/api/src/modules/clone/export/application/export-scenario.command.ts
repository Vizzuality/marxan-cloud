import { Command } from '@nestjs-architects/typed-cqrs';
import { ResourceId } from '@marxan/cloning/domain';
import { ExportId } from '../domain';

export class ExportScenario extends Command<ExportId> {
  constructor(
    public readonly projectId: ResourceId,
    public readonly scenarioId: ResourceId,
  ) {
    super();
  }
}
