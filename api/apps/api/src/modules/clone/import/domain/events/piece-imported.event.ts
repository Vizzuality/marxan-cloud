import { IEvent } from '@nestjs/cqrs';
import { ComponentId, ClonePiece, ResourceId } from '@marxan/cloning/domain';

export class PieceImported implements IEvent {
  constructor(
    public readonly id: ComponentId,
    public readonly piece: ClonePiece,
    public readonly resourceId: ResourceId,
    public readonly uri: string,
  ) {}
}
