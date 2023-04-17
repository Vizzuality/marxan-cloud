import { FailedLegacyProjectImportDbCleanupJobInput } from '@marxan/legacy-project-import';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { failedLegacyProjectImportDbCleanupQueueToken } from './failed-legacy-project-import-db-cleanup-queue.provider';
import { ScheduleDbCleanupForFailedLegacyProjectImport } from './schedule-db-cleanup-for-failed-legacy-project-import.command';

@CommandHandler(ScheduleDbCleanupForFailedLegacyProjectImport)
export class ScheduleDbCleanupForFailedLegacyProjectImportHandler
  implements
    IInferredCommandHandler<ScheduleDbCleanupForFailedLegacyProjectImport> {
  private readonly logger: Logger = new Logger(
    ScheduleDbCleanupForFailedLegacyProjectImportHandler.name,
  );

  constructor(
    @Inject(failedLegacyProjectImportDbCleanupQueueToken)
    private readonly queue: Queue<FailedLegacyProjectImportDbCleanupJobInput>,
  ) {}

  async execute({
    projectId,
  }: ScheduleDbCleanupForFailedLegacyProjectImport): Promise<void> {
    const job = await this.queue.add(
      `failed-legacy-project-import-db-cleanup`,
      {
        projectId: projectId.value,
      },
    );

    if (!job) {
      this.logger.error(
        `failed-legacy-project-import-db-cleanup job couldn't be added to queue`,
      );
      return;
    }
  }
}
