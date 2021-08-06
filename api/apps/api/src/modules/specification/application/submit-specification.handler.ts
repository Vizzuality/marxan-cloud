import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { SubmitSpecification } from '../commands/submit-specification.command';
import { Specification } from '../specification';
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
      Specification.new(payload.scenarioId, payload.features, payload.draft),
    );

    await this.specificationRepository.save(specification);

    specification.commit();
    return specification.id;
  }
}
