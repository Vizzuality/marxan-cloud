import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { SpecificationId } from '../domain';

import { AssignCandidateSpecification } from './assign-candidate-specification.command';
import { ScenarioSpecificationRepo } from './scenario-specification.repo';

@CommandHandler(AssignCandidateSpecification)
export class AssignCandidateSpecificationHandler
  implements IInferredCommandHandler<AssignCandidateSpecification> {
  constructor(
    private readonly scenarioSpecificationRepo: ScenarioSpecificationRepo,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    specificationId,
    scenarioId,
  }: AssignCandidateSpecification): Promise<void> {
    const scenarioSpecification = this.eventPublisher.mergeObjectContext(
      await this.scenarioSpecificationRepo.findOrCreate(scenarioId),
    );
    scenarioSpecification.assignCandidateSpecification(
      new SpecificationId(specificationId),
    );
    console.log(`---3`);
    await this.scenarioSpecificationRepo.save(scenarioSpecification);
    scenarioSpecification.commit();
  }
}
