import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { left, right } from 'fp-ts/lib/Either';
import { Repository } from 'typeorm';
import { ScenarioDeleted } from '../events/scenario-deleted.event';
import { Scenario } from '../scenario.api.entity';
import {
  DeleteScenario,
  deleteScenarioFailed,
  DeleteScenarioResponse,
} from './delete-scenario.command';

@CommandHandler(DeleteScenario)
export class DeleteScenarioHandler
  implements IInferredCommandHandler<DeleteScenario> {
  constructor(
    @InjectRepository(Scenario)
    private readonly scenarioRepo: Repository<Scenario>,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    scenarioId,
  }: DeleteScenario): Promise<DeleteScenarioResponse> {
    try {
      await this.scenarioRepo.delete(scenarioId);

      this.eventBus.publish(new ScenarioDeleted(scenarioId));

      return right(true);
    } catch (error) {
      return left(deleteScenarioFailed);
    }
  }
}
