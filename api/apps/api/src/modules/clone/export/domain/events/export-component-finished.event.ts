import { IEvent } from '@nestjs/cqrs';
import { ExportId } from '../export/export.id';

export class ExportComponentFinished implements IEvent {
  constructor(public readonly exportId: ExportId) {}
}
