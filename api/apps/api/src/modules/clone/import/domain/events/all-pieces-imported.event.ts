import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { IEvent } from '@nestjs/cqrs';
import { ImportId } from '../import/import.id';

export class AllPiecesImported implements IEvent {
  constructor(
    public readonly importId: ImportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
    public readonly isCloning: boolean,
  ) {}
}
