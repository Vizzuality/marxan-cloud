import { FailedImportDbCleanupJobInput } from '@marxan/cloning/job-input';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { ImportRepository } from '../../import/application/import.repository.port';
import { failedImportDbCleanupQueueToken } from './failed-import-db-cleanup-queue.provider';
import { ScheduleDbCleanupForFailedImport } from './schedule-db-cleanup-for-failed-import.command';

@CommandHandler(ScheduleDbCleanupForFailedImport)
export class ScheduleDbCleanupForFailedImportHandler
  implements IInferredCommandHandler<ScheduleDbCleanupForFailedImport> {
  constructor(
    @Inject(failedImportDbCleanupQueueToken)
    private readonly queue: Queue<FailedImportDbCleanupJobInput>,
    private readonly importRepository: ImportRepository,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScheduleDbCleanupForFailedImportHandler.name);
  }

  async execute({ importId }: ScheduleDbCleanupForFailedImport): Promise<void> {
    const importInstance = await this.importRepository.find(importId);

    if (!importInstance) {
      this.logger.error(
        `Import with ID ${importId.value} not found. Database cleanup job cannot be scheduled`,
      );
      return;
    }

    const { resourceId, resourceKind } = importInstance.toSnapshot();

    const job = await this.queue.add(`failed-import-db-cleanup`, {
      importId: importId.value,
      resourceId,
      resourceKind,
    });

    if (!job) {
      this.logger.error(
        `failed-import-db-cleanup job couldn't be added to queue`,
      );
      return;
    }
  }
}
