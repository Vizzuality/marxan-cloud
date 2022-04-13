import { ResourceKind } from '@marxan/cloning/domain';
import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from '../../../scenarios/scenario.api.entity';
import { Export } from '../domain';
import { ExportRepository } from './export-repository.port';
import { ExportResourcePieces } from './export-resource-pieces.port';
import {
  ExportScenario,
  ExportScenarioCommandResult,
} from './export-scenario.command';

@CommandHandler(ExportScenario)
export class ExportScenarioHandler
  implements IInferredCommandHandler<ExportScenario> {
  constructor(
    private readonly resourcePieces: ExportResourcePieces,
    private readonly exportRepository: ExportRepository,
    private readonly eventPublisher: EventPublisher,
    @InjectRepository(Scenario)
    private readonly scenarioRepo: Repository<Scenario>,
  ) {}

  private async createScenarioShell(
    existingScenarioId: string,
    newScenarioId: string,
  ) {
    const scenario = await this.scenarioRepo.findOneOrFail(existingScenarioId);
    await this.scenarioRepo.save({
      id: newScenarioId,
      name: '',
      projectId: scenario.projectId,
    });
  }

  async execute({
    scenarioId,
    projectId,
    ownerId,
  }: ExportScenario): Promise<ExportScenarioCommandResult> {
    const kind = ResourceKind.Scenario;
    const cloning = true;
    const pieces = this.resourcePieces.resolveForScenario(scenarioId, kind);

    const exportRequest = this.eventPublisher.mergeObjectContext(
      Export.newOne(projectId, kind, ownerId, pieces, cloning),
    );
    await this.exportRepository.save(exportRequest);

    exportRequest.commit();

    await this.createScenarioShell(
      scenarioId.value,
      exportRequest.importResourceId!.value,
    );

    return {
      exportId: exportRequest.id,
      importResourceId: exportRequest.importResourceId!,
    };
  }
}
