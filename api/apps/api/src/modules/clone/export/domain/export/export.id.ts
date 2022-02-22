import { v4 } from 'uuid';

export class ExportId {
  private readonly _token = 'export-id';
  constructor(public readonly value: string) {}

  static create(): ExportId {
    return new ExportId(v4());
  }
}
