import { IEvent } from '@nestjs/cqrs';
import { ImportId } from '../import/import.id';

export class ImportBatchFailed implements IEvent {
  constructor(
    public readonly importId: ImportId,
    public readonly batchNumber: number,
  ) {}
}
