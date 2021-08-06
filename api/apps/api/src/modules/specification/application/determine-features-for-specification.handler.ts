import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';

import { SpecificationRepository } from './specification.repository';
import { DetermineFeaturesForSpecification } from './determine-features-for-specification.command';
import { SpecificationNotFound } from './specification-action-errors';

@CommandHandler(DetermineFeaturesForSpecification)
export class DetermineFeaturesForSpecificationHandler
  implements IInferredCommandHandler<DetermineFeaturesForSpecification> {
  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly specificationRepository: SpecificationRepository,
  ) {}

  async execute({
    featuresConfig,
    specificationId,
  }: DetermineFeaturesForSpecification): Promise<
    Either<typeof SpecificationNotFound, void>
  > {
    let specification = await this.specificationRepository.getById(
      specificationId,
    );
    if (!specification) {
      return left(SpecificationNotFound);
    }
    specification = this.eventPublisher.mergeObjectContext(specification);

    specification.determineFeatures([featuresConfig]);
    await this.specificationRepository.save(specification);
    specification.commit();
    return right(undefined);
  }
}
