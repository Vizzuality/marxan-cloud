import { ExportId } from '@marxan-api/modules/clone';
import { ComponentId } from '@marxan/cloning/domain';
import { IEvent } from '@nestjs/cqrs';

export class ExportPieceFailed implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly componentId: ComponentId,
  ) {}
}
