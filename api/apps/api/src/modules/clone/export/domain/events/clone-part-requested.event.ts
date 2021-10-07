import { IEvent } from '@nestjs/cqrs';

import { ExportId } from '../export/export.id';
import { PieceId } from '../export/clone-part/piece.id';
import { ResourceId } from '../export/resource.id';
import { ClonePiece } from '../../../shared-kernel/clone-piece';

export class ClonePartRequested implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly pieceId: PieceId,
    public readonly resourceId: ResourceId,
    public readonly piece: ClonePiece,
  ) {}
}
