import { IEvent } from '@nestjs/cqrs';
import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { ImportId } from '../import/import.id';

export class ImportRequested implements IEvent {
  constructor(
    public readonly id: ImportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
  ) {}
}
