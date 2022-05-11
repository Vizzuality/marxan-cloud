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

  #status: LegacyProjectImportComponentStatuses;

  constructor(status: LegacyProjectImportComponentStatuses) {
    this.#status = status;
  }

  get value(): LegacyProjectImportComponentStatuses {
    return this.#status;
  }

  markAsCompleted(): void {
    if (this.value === LegacyProjectImportComponentStatuses.Failed)
      throw new Error('Import component has already failed');

    this.#status = LegacyProjectImportComponentStatuses.Completed;
  }

  markAsFailed(): void {
    if (this.value === LegacyProjectImportComponentStatuses.Completed)
      throw new Error('Import component has already been completed');

    this.#status = LegacyProjectImportComponentStatuses.Failed;
  }
}
