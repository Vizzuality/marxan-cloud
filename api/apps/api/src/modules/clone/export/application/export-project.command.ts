import { Command } from '@nestjs-architects/typed-cqrs';
import { ResourceId } from '@marxan/cloning/domain';
import { ExportId } from '../domain';
import { UserId } from '@marxan/domain-ids';

export type ExportProjectCommandResult = {
  exportId: ExportId;
  importResourceId?: ResourceId;
};

export class ExportProject extends Command<ExportProjectCommandResult> {
  constructor(
    public readonly id: ResourceId,
    public readonly scenarioIds: string[],
    public readonly ownerId: UserId,
    public readonly clonning: boolean,
  ) {
    super();
  }
}
