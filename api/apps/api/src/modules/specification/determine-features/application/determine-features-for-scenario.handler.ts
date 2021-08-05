import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { SpecificationRepository } from './specification.repository';
import { DetermineFeaturesForSpecification } from '../../commands/determine-features-for-scenario-specification.command';

@CommandHandler(DetermineFeaturesForSpecification)
export class DetermineFeaturesForScenarioHandler
  implements IInferredCommandHandler<DetermineFeaturesForSpecification> {
  private readonly logger: Logger = new Logger(
    DetermineFeaturesForSpecification.name,
  );

  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly specificationRepository: SpecificationRepository,
  ) {}

  async execute({
    featuresConfig,
    specificationId,
  }: DetermineFeaturesForSpecification): Promise<void> {
    let specification = await this.specificationRepository.getById(
      specificationId,
    );
    if (!specification) {
      this.logger.warn(`Couldn't find specification: ${specificationId}`);
      return;
    }
    specification = this.eventPublisher.mergeObjectContext(specification);

    specification.determineFeatures([featuresConfig]);
    await this.specificationRepository.save(specification);
    specification.commit();
  }
}
