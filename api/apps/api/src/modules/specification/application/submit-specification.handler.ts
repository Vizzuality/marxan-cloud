import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Specification } from '../domain';

import { SubmitSpecification } from './submit-specification.command';
import { SpecificationRepository } from './specification.repository';

@CommandHandler(SubmitSpecification)
export class SubmitSpecificationHandler
  implements IInferredCommandHandler<SubmitSpecification> {
  constructor(
    private readonly specificationRepository: SpecificationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ payload }: SubmitSpecification): Promise<string> {
    const specification = this.eventPublisher.mergeObjectContext(
      Specification.new(
        payload.scenarioId,
        payload.features,
        payload.draft,
        payload.raw,
      ),
    );

    await this.specificationRepository.save(specification);

    specification.commit();
    return specification.id;
  }
}
