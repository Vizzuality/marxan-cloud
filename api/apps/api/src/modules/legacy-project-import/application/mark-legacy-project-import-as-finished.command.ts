import { ResourceId } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';

export class MarkLegacyProjectImportAsFinished extends Command<void> {
  constructor(public readonly projectId: ResourceId) {
    super();
  }
}
