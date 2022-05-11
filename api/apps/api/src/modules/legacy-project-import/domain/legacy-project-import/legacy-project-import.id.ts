import { v4 } from 'uuid';

export class LegacyProjectImportId {
  private readonly _token = 'legacy-project-import-id';
  constructor(public readonly value: string) {}

  static create(): LegacyProjectImportId {
    return new LegacyProjectImportId(v4());
  }

  equals(other: LegacyProjectImportId): boolean {
    return this.value === other.value;
  }
}
