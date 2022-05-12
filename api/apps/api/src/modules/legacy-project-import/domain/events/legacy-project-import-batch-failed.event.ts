import { IEvent } from '@nestjs/cqrs';
import { LegacyProjectImportId } from '../legacy-project-import/legacy-project-import.id';

export class LegacyProjectImportBatchFailed implements IEvent {
  constructor(
    public readonly legacyProjectImportId: LegacyProjectImportId,
    public readonly batchNumber: number,
  ) {}
}
