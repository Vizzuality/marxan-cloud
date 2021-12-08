import { IEvent } from '@nestjs/cqrs';
import { ComponentId, ClonePiece } from '@marxan/cloning/domain';

export class PieceImportRequested implements IEvent {
  constructor(
    public readonly id: ComponentId,
    public readonly piece: ClonePiece,
    public readonly resourceId: string,
  ) {}
}
