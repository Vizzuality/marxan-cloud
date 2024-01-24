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
  implements IInferredCommandHandler<ExportScenario>
{
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
    const scenario = await this.scenarioRepo.findOneOrFail({
      where: { id: existingScenarioId },
    });
    await this.scenarioRepo.save({
      id: newScenarioId,
      name: scenario.name + ' - copy',
      projectId: scenario.projectId,
      metadata: scenario.metadata,
      costSurfaceId: scenario.costSurfaceId,
    });
    // No need to inform projectScenarioId, because it will be generated automatically by the trigger
  }

  async execute({
    scenarioId,
    projectId,
    ownerId,
  }: ExportScenario): Promise<ExportScenarioCommandResult> {
    const kind = ResourceKind.Scenario;
    const pieces = this.resourcePieces.resolveForScenario(scenarioId, kind);
    const cloning = true;
    const foreignExport = false;

    const exportRequest = this.eventPublisher.mergeObjectContext(
      Export.newOne(projectId, kind, ownerId, pieces, cloning, foreignExport),
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
