import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';

import { SpecificationRepository } from './specification.repository';
import { DetermineFeatures } from './determine-features.command';
import { SpecificationNotFound } from './specification-action-errors';

@CommandHandler(DetermineFeatures)
export class DetermineFeaturesHandler
  implements IInferredCommandHandler<DetermineFeatures> {
  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly specificationRepository: SpecificationRepository,
  ) {}

  async execute({ featuresConfig }: DetermineFeatures): Promise<void> {
    const specifications = await this.specificationRepository.transaction(
      async (repo) => {
        const specifications = await repo.findAllRelatedToFeatureConfig(
          featuresConfig,
        );

        for (const spec of specifications) {
          spec.determineFeatures([featuresConfig]);
          await repo.save(spec);
        }
        return specifications;
      },
    );

    specifications.forEach((specification) =>
      this.eventPublisher.mergeObjectContext(specification).commit(),
    );
  }
}
