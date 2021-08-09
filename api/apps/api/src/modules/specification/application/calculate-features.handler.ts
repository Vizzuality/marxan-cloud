import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';

import { SpecificationRepository } from './specification.repository';
import { CalculateFeatures } from './calculate-features.command';

@CommandHandler(CalculateFeatures)
export class CalculateFeaturesHandler
  implements IInferredCommandHandler<CalculateFeatures> {
  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly specificationRepository: SpecificationRepository,
  ) {}

  async execute({ featureIds }: CalculateFeatures): Promise<void> {
    const specifications = await this.specificationRepository.transaction(
      async (repo) => {
        const specifications = await repo.findAllRelatedToFeatures(featureIds);

        for (const spec of specifications) {
          spec.markAsCalculated(featureIds);
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
