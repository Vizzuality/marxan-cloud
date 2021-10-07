import { IEvent } from '@nestjs/cqrs';
import { ExportId } from '../export/export.id';

export class ClonePartsFinished implements IEvent {
  constructor(public readonly exportId: ExportId) {}
}
