import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';

import { ResourceKind } from '@marxan/cloning/domain';
import { Export, ExportId } from '../domain';

import {
  ExportScenario,
  ExportScenarioCommandResult,
} from './export-scenario.command';
import { ExportResourcePieces } from './export-resource-pieces.port';
import { ExportRepository } from './export-repository.port';

@CommandHandler(ExportScenario)
export class ExportScenarioHandler
  implements IInferredCommandHandler<ExportScenario> {
  constructor(
    private readonly resourcePieces: ExportResourcePieces,
    private readonly exportRepository: ExportRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

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

    return {
      exportId: exportRequest.id,
      importResourceId: exportRequest.importResourceId!,
    };
  }
}
