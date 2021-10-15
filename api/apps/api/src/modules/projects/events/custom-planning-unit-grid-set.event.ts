import { IEvent } from '@nestjs/cqrs';
import { BBox } from 'geojson';

export class CustomPlanningUnitGridSet implements IEvent {
  constructor(
    public readonly projectId: string,
    public readonly planningAreaId: string,
    public readonly bbox: BBox,
  ) {}
}
