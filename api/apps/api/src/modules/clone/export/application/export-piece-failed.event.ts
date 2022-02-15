import {
  ComponentId,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ExportId } from '@marxan-api/modules/clone';
import { IEvent } from '@nestjs/cqrs';

export class ExportPieceFailed implements IEvent {
  // TODO Check if all parameters are needed
  constructor(
    public readonly exportId: ExportId,
    public readonly componentId: ComponentId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
    public readonly location?: ComponentLocation[],
  ) {}
}
