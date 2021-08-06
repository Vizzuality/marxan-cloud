import { Command } from '@nestjs-architects/typed-cqrs';

export class AssignCandidateSpecification extends Command<void> {
  constructor(
    public readonly scenarioId: string,
    public readonly specificationId: string,
  ) {
    super();
  }
}
