import { v4 } from 'uuid';

export class LegacyProjectImportPieceId {
  private readonly _token = 'legacy-project-import-piece-id';
  constructor(public readonly value: string) {}

  static create(): LegacyProjectImportPieceId {
    return new LegacyProjectImportPieceId(v4());
  }

  equals(other: LegacyProjectImportPieceId): boolean {
    return this.value === other.value;
  }
}
