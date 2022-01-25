import { Command } from '@nestjs-architects/typed-cqrs';
import { ComponentId, ResourceKind } from '@marxan/cloning/domain';
import { ExportId, ResourceId } from '../../export';

export class MarkExportPiecesAsFailed extends Command<void> {
  constructor(
    public readonly exportId: ExportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
    public readonly componentsId: ComponentId[],
  ) {
    super();
  }
}
