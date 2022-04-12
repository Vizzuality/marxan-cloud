import { Command } from '@nestjs-architects/typed-cqrs';
import { ResourceId } from '@marxan/cloning/domain';
import { ExportId } from '../domain';
import { UserId } from '@marxan/domain-ids';

export type ExportScenarioCommandResult = {
  exportId: ExportId;
  importResourceId: ResourceId;
};

export class ExportScenario extends Command<ExportScenarioCommandResult> {
  constructor(
    public readonly projectId: ResourceId,
    public readonly scenarioId: ResourceId,
    public readonly ownerId: UserId,
  ) {
    super();
  }
}
