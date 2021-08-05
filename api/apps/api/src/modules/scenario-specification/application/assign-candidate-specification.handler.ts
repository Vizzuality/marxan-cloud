import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { AssignCandidateSpecification } from '../command/assign-candidate-specification.command';
import { SpecificationId } from '../specification.id';
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
    await this.scenarioSpecificationRepo.save(scenarioSpecification);
    scenarioSpecification.commit();
    return void 0;
  }
}
