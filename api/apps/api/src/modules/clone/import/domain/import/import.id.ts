import { v4 } from 'uuid';

export class ImportId {
  private readonly _token = 'import-id';
  constructor(public readonly value: string) {}

  static create() {
    return new ImportId(v4());
  }
}
