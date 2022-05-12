import { IEvent } from '@nestjs/cqrs';
import { LegacyProjectImportComponentId } from '../legacy-project-import/legacy-project-import-component.id';
import { LegacyProjectImportId } from '../legacy-project-import/legacy-project-import.id';

export class LegacyProjectImportPieceImported implements IEvent {
  constructor(
    public readonly legacyProjectImportId: LegacyProjectImportId,
    public readonly componentId: LegacyProjectImportComponentId,
  ) {}
}
