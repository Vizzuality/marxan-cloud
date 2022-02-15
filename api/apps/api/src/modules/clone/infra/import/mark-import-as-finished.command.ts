import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';
import { ImportId } from '../../import/domain';

export class MarkImportAsFinished extends Command<void> {
  constructor(
    public readonly importId: ImportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
  ) {
    super();
  }
}
