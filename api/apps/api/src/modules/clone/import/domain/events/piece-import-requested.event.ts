import { IEvent } from '@nestjs/cqrs';
import {
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceId,
} from '@marxan/cloning/domain';

export class PieceImportRequested implements IEvent {
  constructor(
    public readonly id: ComponentId,
    public readonly piece: ClonePiece,
    public readonly resourceId: ResourceId,
    public readonly uris: ComponentLocation[],
  ) {}
}
