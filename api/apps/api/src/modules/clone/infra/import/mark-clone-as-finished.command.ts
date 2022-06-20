import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';
import { ExportId } from '../../export';

export class MarkCloneAsFinished extends Command<void> {
  constructor(
    public readonly exportId: ExportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
  ) {
    super();
  }
}
