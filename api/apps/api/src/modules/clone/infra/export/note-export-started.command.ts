import { Command } from '@nestjs-architects/typed-cqrs';
import { ResourceKind } from '@marxan/cloning/domain';
import { ExportId, ResourceId } from '../../export';

export class NoteExportStarted extends Command<void> {
  constructor(
    public readonly exportId: ExportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
  ) {
    super();
  }
}
