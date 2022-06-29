import { ResourceId } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';
import { LegacyProjectImportComponentId } from '../domain/legacy-project-import/legacy-project-import-component.id';

export class ScheduleLegacyProjectImportPiece extends Command<void> {
  constructor(
    public readonly projectId: ResourceId,
    public readonly componentId: LegacyProjectImportComponentId,
  ) {
    super();
  }
}
