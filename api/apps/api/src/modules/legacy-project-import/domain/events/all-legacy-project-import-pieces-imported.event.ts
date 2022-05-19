import { ResourceId } from '@marxan/cloning/domain';
import { IEvent } from '@nestjs/cqrs';

export class AllLegacyProjectImportPiecesImported implements IEvent {
  constructor(public readonly projectId: ResourceId) {}
}
