import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { SpecificationRepository } from './specification.repository';

import { CalculateFeaturesForSpecification } from '../../commands/calculate-features-for-specification.command';

@CommandHandler(CalculateFeaturesForSpecification)
export class CalculateFeaturesForSpecificationHandler
  implements IInferredCommandHandler<CalculateFeaturesForSpecification> {
  private readonly logger: Logger = new Logger(
    CalculateFeaturesForSpecificationHandler.name,
  );

  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly specificationRepository: SpecificationRepository,
  ) {}

  async execute({
    featureIds,
    specificationId,
  }: CalculateFeaturesForSpecification): Promise<void> {
    let specification = await this.specificationRepository.getById(
      specificationId,
    );
    if (!specification) {
      this.logger.warn(`Couldn't find specification: ${specificationId}`);
      return;
    }
    specification = this.eventPublisher.mergeObjectContext(specification);

    specification.markAsCalculated(featureIds);
    await this.specificationRepository.save(specification);
    specification.commit();
  }
}
