export enum ImportComponentStatuses {
  Submitted = 'submitted',
  Completed = 'completed',
  Failed = 'failed',
}

export class ImportComponentStatus {
  static create(): ImportComponentStatus {
    return new ImportComponentStatus(ImportComponentStatuses.Submitted);
  }

  #status: ImportComponentStatuses;

  constructor(status: ImportComponentStatuses) {
    this.#status = status;
  }

  get value(): ImportComponentStatuses {
    return this.#status;
  }

  markAsCompleted(): void {
    if (this.value === ImportComponentStatuses.Failed)
      throw new Error('Import component has already failed');

    this.#status = ImportComponentStatuses.Completed;
  }

  markAsFailed(): void {
    if (this.value === ImportComponentStatuses.Completed)
      throw new Error('Import component has already been completed');

    this.#status = ImportComponentStatuses.Failed;
  }
}
