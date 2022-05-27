import { v4 } from 'uuid';

export class LegacyProjectImportFileId {
  private readonly _token = 'legacy-project-import-file-id';
  constructor(public readonly value: string) {}

  static create(): LegacyProjectImportFileId {
    return new LegacyProjectImportFileId(v4());
  }

  equals(other: LegacyProjectImportFileId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
