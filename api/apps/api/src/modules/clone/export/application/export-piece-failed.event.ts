import { ComponentId, ComponentLocation } from '@marxan/cloning/domain';
import { ExportId } from '@marxan-api/modules/clone';
import { IEvent } from '@nestjs/cqrs';

export class ExportPieceFailed implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly componentId: ComponentId,
    public readonly location?: ComponentLocation[],
  ) {}
}
