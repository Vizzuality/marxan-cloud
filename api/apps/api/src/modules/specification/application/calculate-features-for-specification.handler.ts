import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';

import { SpecificationRepository } from './specification.repository';
import { SpecificationNotFound } from './specification-action-errors';
import { CalculateFeaturesForSpecification } from './calculate-features-for-specification.command';

@CommandHandler(CalculateFeaturesForSpecification)
export class CalculateFeaturesForSpecificationHandler
  implements IInferredCommandHandler<CalculateFeaturesForSpecification> {
  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly specificationRepository: SpecificationRepository,
  ) {}

  async execute({
    featureIds,
    specificationId,
  }: CalculateFeaturesForSpecification): Promise<
    Either<typeof SpecificationNotFound, void>
  > {
    let specification = await this.specificationRepository.getById(
      specificationId,
    );
    if (!specification) {
      return left(SpecificationNotFound);
    }
    specification = this.eventPublisher.mergeObjectContext(specification);

    specification.markAsCalculated(featureIds);
    await this.specificationRepository.save(specification);
    specification.commit();
    return right(undefined);
  }
}
