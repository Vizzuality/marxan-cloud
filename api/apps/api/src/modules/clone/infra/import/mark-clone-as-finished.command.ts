import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';

export class MarkCloneAsFinished extends Command<void> {
  constructor(
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
  ) {
    super();
  }
}
