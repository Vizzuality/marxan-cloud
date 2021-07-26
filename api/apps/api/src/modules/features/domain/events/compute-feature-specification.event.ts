import { IEvent } from '@nestjs/cqrs';
import { FeatureSpecificationId } from '../feature-specification.id';
import { FeatureSpecificationRevision } from '../feature-specification-revision';

export class ComputeFeatureSpecificationEvent implements IEvent {
  constructor(
    public readonly featureSpecificationId: FeatureSpecificationId,
    public readonly revision: FeatureSpecificationRevision,
  ) {}
}
