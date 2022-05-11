import { ResourceId } from '@marxan/cloning/domain';
import { IEvent } from '@nestjs/cqrs';
import { LegacyProjectImportId } from '../legacy-project-import/legacy-project-import.id';

export class LegacyProjectImportRequested implements IEvent {
  constructor(
    public readonly legacyProjectImportId: LegacyProjectImportId,
    public readonly projectId: ResourceId,
  ) {}
}
