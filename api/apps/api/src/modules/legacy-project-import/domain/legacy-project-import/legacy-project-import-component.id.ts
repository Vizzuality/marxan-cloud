import { v4 } from 'uuid';

export class LegacyProjectImportComponentId {
  private readonly _token = 'legacy-project-import-component-id';
  constructor(public readonly value: string) {}

  static create(): LegacyProjectImportComponentId {
    return new LegacyProjectImportComponentId(v4());
  }

  equals(other: LegacyProjectImportComponentId): boolean {
    return this.value === other.value;
  }
}
