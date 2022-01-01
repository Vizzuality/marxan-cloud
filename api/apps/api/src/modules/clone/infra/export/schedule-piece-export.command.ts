import { Command } from '@nestjs-architects/typed-cqrs';
import {
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ExportId } from '@marxan-api/modules/clone/export/domain';

export class SchedulePieceExport extends Command<void> {
  constructor(
    public readonly exportId: ExportId,
    public readonly componentId: ComponentId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
    public readonly piece: ClonePiece,
    public readonly allPieces: ClonePiece[],
  ) {
    super();
  }
}
