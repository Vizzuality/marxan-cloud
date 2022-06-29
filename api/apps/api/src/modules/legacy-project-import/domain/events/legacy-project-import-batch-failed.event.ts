import { ResourceId } from '@marxan/cloning/domain';
import { IEvent } from '@nestjs/cqrs';

export class LegacyProjectImportBatchFailed implements IEvent {
  constructor(
    public readonly projectId: ResourceId,
    public readonly batchNumber: number,
  ) {}
}
