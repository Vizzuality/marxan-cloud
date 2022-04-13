import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';

export class MarkCloneAsSubmitted extends Command<void> {
  constructor(
    public readonly importResourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
  ) {
    super();
  }
}
