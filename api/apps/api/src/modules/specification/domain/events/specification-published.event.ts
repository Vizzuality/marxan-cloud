import { IEvent } from '@nestjs/cqrs';

/**
 * if every single feature is determined, specification can be published and
 * relevant geometries can be calculated
 */
export class SpecificationPublished implements IEvent {
  constructor(
    public readonly id: string,
    public readonly nonCalculatedFeatures: string[],
  ) {}
}
