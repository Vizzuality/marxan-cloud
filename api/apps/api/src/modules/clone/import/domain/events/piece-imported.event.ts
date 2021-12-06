import { IEvent } from '@nestjs/cqrs';
import { ComponentId } from '@marxan-api/modules/clone/shared-kernel/component.id';
import { ClonePiece } from '@marxan-api/modules/clone/shared-kernel/clone-piece';

export class PieceImported implements IEvent {
  constructor(
    public readonly id: ComponentId,
    public readonly piece: ClonePiece,
    public readonly resourceId: string,
    public readonly uri: string,
  ) {}
}
