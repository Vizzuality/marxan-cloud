import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';
import { Specification } from '../domain';

import {
  internalError,
  SubmitSpecification,
  SubmitSpecificationError,
} from './submit-specification.command';
import { SpecificationRepository } from './specification.repository';

@CommandHandler(SubmitSpecification)
export class SubmitSpecificationHandler
  implements IInferredCommandHandler<SubmitSpecification> {
  constructor(
    private readonly specificationRepository: SpecificationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    payload,
  }: SubmitSpecification): Promise<Either<SubmitSpecificationError, string>> {
    const specification = this.eventPublisher.mergeObjectContext(
      Specification.new(
        payload.scenarioId,
        payload.features,
        payload.draft,
        payload.raw,
        payload.doNotCalculateAreas,
      ),
    );

    try {
      await this.specificationRepository.save(specification);
    } catch {
      return left(internalError);
    }

    specification.commit();
    return right(specification.id);
  }
}
