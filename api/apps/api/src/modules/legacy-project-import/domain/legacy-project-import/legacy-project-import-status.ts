export enum LegacyProjectImportStatuses {
  AcceptingFiles = 'accepting',
  Running = 'running',
  Canceled = 'canceled',
  Completed = 'completed',
  Failed = 'failed',
}

export class LegacyProjectImportStatus {
  static create(): LegacyProjectImportStatus {
    return new LegacyProjectImportStatus(
      LegacyProjectImportStatuses.AcceptingFiles,
    );
  }

  static fromSnapshot(status: LegacyProjectImportStatuses) {
    return new LegacyProjectImportStatus(status);
  }
  private constructor(private readonly status: LegacyProjectImportStatuses) {}

  markAsRunning(): LegacyProjectImportStatus {
    if (this.status !== LegacyProjectImportStatuses.AcceptingFiles)
      throw new Error('invalid transition when mark as running');
    return new LegacyProjectImportStatus(LegacyProjectImportStatuses.Running);
  }

  markAsCompleted(): LegacyProjectImportStatus {
    if (this.status !== LegacyProjectImportStatuses.Running)
      throw new Error('invalid transition when mark as completed');

    return new LegacyProjectImportStatus(LegacyProjectImportStatuses.Completed);
  }

  markAsFailed(): LegacyProjectImportStatus {
    if (this.status !== LegacyProjectImportStatuses.Running)
      throw new Error('invalid transition when mark as running');

    return new LegacyProjectImportStatus(LegacyProjectImportStatuses.Failed);
  }

  markAsCanceled(): LegacyProjectImportStatus {
    if (
      this.status === LegacyProjectImportStatuses.Running ||
      this.status === LegacyProjectImportStatuses.AcceptingFiles
    )
      return new LegacyProjectImportStatus(
        LegacyProjectImportStatuses.Canceled,
      );

    throw new Error('invalid transition when mark as running');
  }

  isAcceptingFiles() {
    return this.status === LegacyProjectImportStatuses.AcceptingFiles;
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
