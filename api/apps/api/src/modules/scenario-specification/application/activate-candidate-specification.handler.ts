import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/Either';

import {
  ActivateCandidateSpecification,
  ActivateError,
  scenarioSpecificationNotFound,
} from './activate-candidate-specification.command';
import { SpecificationId } from '../domain';

import { ScenarioSpecificationRepo } from './scenario-specification.repo';

@CommandHandler(ActivateCandidateSpecification)
export class ActivateCandidateSpecificationHandler
  implements IInferredCommandHandler<ActivateCandidateSpecification>
{
  constructor(
    private readonly scenarioSpecificationRepo: ScenarioSpecificationRepo,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    specificationId,
    scenarioId,
  }: ActivateCandidateSpecification): Promise<Either<ActivateError, void>> {
    const targetSpecification = await this.scenarioSpecificationRepo.find(
      scenarioId,
    );

    if (!targetSpecification) {
      return left(scenarioSpecificationNotFound);
    }
    const scenarioSpecification =
      this.eventPublisher.mergeObjectContext(targetSpecification);
    const result = scenarioSpecification.activateCandidateSpecification(
      new SpecificationId(specificationId),
    );

    if (isLeft(result)) {
      return result;
    }

    await this.scenarioSpecificationRepo.save(scenarioSpecification);
    scenarioSpecification.commit();
    return right(undefined);
  }
}
