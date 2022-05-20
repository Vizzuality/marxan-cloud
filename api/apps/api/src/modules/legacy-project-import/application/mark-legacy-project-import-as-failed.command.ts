import { ResourceId } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';

export class MarkLegacyProjectImportAsFailed extends Command<void> {
  constructor(
    public readonly projectId: ResourceId,
    public readonly reason: string,
  ) {
    super();
  }
}
