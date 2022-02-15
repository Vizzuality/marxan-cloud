import { Command } from '@nestjs-architects/typed-cqrs';
import { ExportId } from '@marxan-api/modules/clone';
import { ResourceId, ResourceKind } from '@marxan/cloning/domain';

export class MarkExportAsFinished extends Command<void> {
  constructor(
    public readonly exportId: ExportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
  ) {
    super();
  }
}
