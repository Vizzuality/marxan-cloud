import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from '../../scenario.api.entity';
import { DeleteScenario } from './delete-scenario.command';

@CommandHandler(DeleteScenario)
export class DeleteScenarioHandler
  implements IInferredCommandHandler<DeleteScenario> {
  constructor(
    @InjectRepository(Scenario)
    protected readonly repository: Repository<Scenario>,
  ) {}

  async execute({ scenarioId }: DeleteScenario): Promise<void> {
    await this.repository.delete(scenarioId);
  }
}
