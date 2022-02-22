import { Command } from '@nestjs-architects/typed-cqrs';
import { ResourceKind, ResourceId } from '@marxan/cloning/domain';
import { ExportId } from '../../export';

export class MarkExportAsSubmitted extends Command<void> {
  constructor(
    public readonly exportId: ExportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
  ) {
    super();
  }
}
