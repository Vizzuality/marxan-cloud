import { IEvent } from '@nestjs/cqrs';
import { SpecificationId } from '../specification.id';

export class SpecificationActivated implements IEvent {
  constructor(public readonly specificationId: SpecificationId) {}
}
