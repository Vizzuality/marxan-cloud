import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';

import { SpecificationRepository } from './specification.repository';
import { CalculateFeatures } from './calculate-features.command';

@CommandHandler(CalculateFeatures)
export class CalculateFeaturesHandler
  implements IInferredCommandHandler<CalculateFeatures>
{
  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly specificationRepository: SpecificationRepository,
  ) {}

  async execute({
    featureIds,
    specificationId,
  }: CalculateFeatures): Promise<void> {
    const specification = await this.specificationRepository.transaction(
      async (repo) => {
        const specification = await repo.getById(specificationId);
        if (!specification) return;
        specification.markAsCalculated(featureIds);
        await repo.save(specification);
        return specification;
      },
    );

    if (!specification) return;
    this.eventPublisher.mergeObjectContext(specification).commit();
  }
}
