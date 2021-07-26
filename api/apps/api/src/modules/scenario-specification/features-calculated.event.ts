import { IEvent } from '@nestjs/cqrs';

/**
 * Once features geometries were calculated, Specification can be updated
 */
export class FeaturesCalculated implements IEvent {
  constructor(
    public readonly specificationId: string,
    public readonly features: string[],
  ) {}
}
