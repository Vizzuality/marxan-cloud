import { IEvent } from '@nestjs/cqrs';

export class CustomPlanningUnitGridSet implements IEvent {
  constructor(
    public readonly projectId: string,
    public readonly planningAreaId: string,
    public readonly bbox: number[],
  ) {}
}
