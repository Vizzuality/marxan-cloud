import { ResourceId } from '@marxan/cloning/domain';
import { IEvent } from '@nestjs/cqrs';
import { LegacyProjectImportComponentId } from '../legacy-project-import/legacy-project-import-component.id';

export class LegacyProjectImportPieceRequested implements IEvent {
  constructor(
    public readonly projectId: ResourceId,
    public readonly componentId: LegacyProjectImportComponentId,
  ) {}
}
