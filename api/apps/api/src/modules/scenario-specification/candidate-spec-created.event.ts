import { IEvent } from '@nestjs/cqrs';
import { SpecificationOperation } from './specification-operation';

/**
 * configuration is formally valid, process can start assigning/creating required features
 */
export class CandidateSpecCreated implements IEvent {
  constructor(
    public readonly specificationId: string,
    public readonly spec: {
      operation: SpecificationOperation;
      baseFeatureId: string;
      againstFeatureId?: string;
    }[],
  ) {}
}
