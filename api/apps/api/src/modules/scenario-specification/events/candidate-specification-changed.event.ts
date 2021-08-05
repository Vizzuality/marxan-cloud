import { IEvent } from '@nestjs/cqrs';
import { SpecificationId } from '../specification.id';

export class CandidateSpecificationChanged implements IEvent {
  constructor(public readonly specificationId: SpecificationId) {}
}
