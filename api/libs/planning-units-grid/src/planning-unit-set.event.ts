import { IEvent } from '@nestjs/cqrs';

/**
 * after determining planning area, once Planning Units are set
 * project is fully set.
 *
 * This event may be used to trigger calculating initial, default discrete
 * BLM values.
 *
 */
export class PlanningUnitSet implements IEvent {
  constructor(public readonly projectId: string) {}
}
