import {
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { IEvent } from '@nestjs/cqrs';
import { ImportId } from '../import/import.id';

export class PieceImportRequested implements IEvent {
  constructor(
    public readonly importId: ImportId,
    public readonly componentId: ComponentId,
    public readonly piece: ClonePiece,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
    public readonly uris: ComponentLocation[],
  ) {}
}
