import { IEvent } from '@nestjs/cqrs';
import { SpecificationOperation } from './specification-operation';

export type FeatureFoundSpecification = {
  operation: SpecificationOperation;
  baseFeatureId: string;
  againstFeatureId?: string;
  features: {
    id: string;
    calculated: boolean;
  }[];
};

/**
 * Once features were assigned/created one shall update the Specification
 */
export class FeaturesFound implements IEvent {
  constructor(
    public readonly specificationId: string,
    public readonly spec: FeatureFoundSpecification[],
  ) {}
}
