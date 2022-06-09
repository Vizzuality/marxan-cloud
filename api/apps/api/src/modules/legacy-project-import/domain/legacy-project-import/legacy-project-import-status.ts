export enum LegacyProjectImportStatuses {
  AceptingFiles = 'accepting',
  Running = 'running',
  Canceled = 'canceled',
  Completed = 'completed',
  Failed = 'failed',
}

export class LegacyProjectImportStatus {
  static create(): LegacyProjectImportStatus {
    return new LegacyProjectImportStatus(
      LegacyProjectImportStatuses.AceptingFiles,
    );
  }

  constructor(private readonly status: LegacyProjectImportStatuses) {}

  markAsRunning(): LegacyProjectImportStatus {
    if (
      this.status === LegacyProjectImportStatuses.Failed ||
      this.status === LegacyProjectImportStatuses.Completed
    )
      throw new Error('Import process already done once ');
    return new LegacyProjectImportStatus(LegacyProjectImportStatuses.Running);
  }

  markAsCompleted(): LegacyProjectImportStatus {
    if (this.status === LegacyProjectImportStatuses.Failed)
      throw new Error('Import process has already failed');

    return new LegacyProjectImportStatus(LegacyProjectImportStatuses.Completed);
  }

  markAsFailed(): LegacyProjectImportStatus {
    if (this.status === LegacyProjectImportStatuses.Completed)
      throw new Error('Import process has already been completed');

    return new LegacyProjectImportStatus(LegacyProjectImportStatuses.Failed);
  }

  markAsCanceled(): LegacyProjectImportStatus {
    return new LegacyProjectImportStatus(LegacyProjectImportStatuses.Canceled);
  }

  isAcceptingFiles() {
    return this.status === LegacyProjectImportStatuses.AceptingFiles;
  }

  isRunning() {
    return this.status === LegacyProjectImportStatuses.Running;
  }

  hasCompleted() {
    return this.status === LegacyProjectImportStatuses.Completed;
  }

  hasFailed() {
    return this.status === LegacyProjectImportStatuses.Failed;
  }

  toSnapshot(): LegacyProjectImportStatuses {
    return this.status;
  }
}
