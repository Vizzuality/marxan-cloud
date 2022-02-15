import { Command } from '@nestjs-architects/typed-cqrs';
import {
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ImportId } from '@marxan-api/modules/clone/import/domain';

export class SchedulePieceImport extends Command<void> {
  constructor(
    public readonly importId: ImportId,
    public readonly componentId: ComponentId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
    public readonly piece: ClonePiece,
    public readonly uris: ComponentLocation[],
  ) {
    super();
  }
}
