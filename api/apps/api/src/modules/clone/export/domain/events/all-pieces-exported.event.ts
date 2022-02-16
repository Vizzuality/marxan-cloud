import { IEvent } from '@nestjs/cqrs';
import { ExportId } from '../export/export.id';

export class AllPiecesExported implements IEvent {
  constructor(public readonly exportId: ExportId) {}
}
