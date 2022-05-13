import { ResourceId } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';
import { LegacyProjectImportComponentId } from '../domain/legacy-project-import/legacy-project-import-component.id';

export class CompleteLegacyProjectImportPiece extends Command<void> {
  constructor(
    public readonly projectId: ResourceId,
    public readonly legacyProjectImportComponentId: LegacyProjectImportComponentId,
    public readonly warnings: string[] = [],
  ) {
    super();
  }
}
