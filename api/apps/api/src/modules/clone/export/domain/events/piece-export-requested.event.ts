import { ComponentId } from '@marxan/cloning/domain';
import { IEvent } from '@nestjs/cqrs';
import { ExportId } from '../export/export.id';

export class PieceExportRequested implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly componentId: ComponentId,
  ) {}
}
