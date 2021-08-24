import { IEvent } from '@nestjs/cqrs';
import { FeatureConfigInput } from '../feature-config';

export class SpecificationCandidateCreated implements IEvent {
  constructor(
    public readonly scenarioId: string,
    public readonly specificationId: string,
    public readonly input: FeatureConfigInput[],
    public readonly draft: boolean,
  ) {}
}
