export enum LegacyProjectImportComponentStatuses {
  Submitted = 'submitted',
  Completed = 'completed',
  Failed = 'failed',
}

export class LegacyProjectImportComponentStatus {
  static create(): LegacyProjectImportComponentStatus {
    return new LegacyProjectImportComponentStatus(
      LegacyProjectImportComponentStatuses.Submitted,
    );
  }

  constructor(private readonly status: LegacyProjectImportComponentStatuses) {}

  markAsCompleted(): LegacyProjectImportComponentStatus {
    if (this.status === LegacyProjectImportComponentStatuses.Failed)
      throw new Error('Import component has already failed');

    return new LegacyProjectImportComponentStatus(
      LegacyProjectImportComponentStatuses.Completed,
    );
  }

  markAsFailed(): LegacyProjectImportComponentStatus {
    if (this.status === LegacyProjectImportComponentStatuses.Completed)
      throw new Error('Import component has already been completed');

    return new LegacyProjectImportComponentStatus(
      LegacyProjectImportComponentStatuses.Failed,
    );
  }

  isReady() {
    return this.status === LegacyProjectImportComponentStatuses.Completed;
  }

  hasFailed() {
    return this.status === LegacyProjectImportComponentStatuses.Failed;
  }

  toSnapshot(): LegacyProjectImportComponentStatuses {
    return this.status;
  }
}
