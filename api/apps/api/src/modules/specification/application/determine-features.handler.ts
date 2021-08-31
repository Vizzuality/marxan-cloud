import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';

import { SpecificationRepository } from './specification.repository';
import { DetermineFeatures } from './determine-features.command';

@CommandHandler(DetermineFeatures)
export class DetermineFeaturesHandler
  implements IInferredCommandHandler<DetermineFeatures> {
  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly specificationRepository: SpecificationRepository,
  ) {}

  async execute({
    featuresConfig,
    specificationId,
  }: DetermineFeatures): Promise<void> {
    const specification = await this.specificationRepository.transaction(
      async (repo) => {
        const specification = await repo.getById(specificationId);
        if (!specification) return;

        specification.determineFeatures([featuresConfig]);
        await repo.save(specification);
        return specification;
      },
    );

    if (!specification) return;
    this.eventPublisher.mergeObjectContext(specification).commit();
  }
}
