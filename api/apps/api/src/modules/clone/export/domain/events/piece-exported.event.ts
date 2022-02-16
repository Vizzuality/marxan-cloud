import { IEvent } from '@nestjs/cqrs';
import { ComponentId, ComponentLocation } from '@marxan/cloning/domain';
import { ExportId } from '../export/export.id';

export class PieceExported implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly componentId: ComponentId,
    public readonly location: ComponentLocation[],
  ) {}
}
