import { ImportId } from '@marxan-api/modules/clone/import/domain';
import { Command } from '@nestjs-architects/typed-cqrs';

export class ScheduleDbCleanupForFailedImport extends Command<void> {
  constructor(public readonly importId: ImportId) {
    super();
  }
}
