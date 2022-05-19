import { ResourceId } from '@marxan/cloning/domain';
import { IEvent } from '@nestjs/cqrs';

export class LegacyProjectImportRequested implements IEvent {
  constructor(public readonly projectId: ResourceId) {}
}
