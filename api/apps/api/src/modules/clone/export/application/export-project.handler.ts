import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';

import { ResourceKind } from '@marxan/cloning/domain';
import { Export, ExportId } from '../domain';

import {
  ExportProject,
  ExportProjectCommandResult,
} from './export-project.command';
import { ExportResourcePieces } from './export-resource-pieces.port';
import { ExportRepository } from './export-repository.port';

@CommandHandler(ExportProject)
export class ExportProjectHandler
  implements IInferredCommandHandler<ExportProject> {
  constructor(
    private readonly resourcePieces: ExportResourcePieces,
    private readonly exportRepository: ExportRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    id,
    scenarioIds,
    ownerId,
    clonning,
  }: ExportProject): Promise<ExportProjectCommandResult> {
    const kind = ResourceKind.Project;
    const pieces = await this.resourcePieces.resolveForProject(id, scenarioIds);
    const exportRequest = this.eventPublisher.mergeObjectContext(
      Export.newOne(id, kind, ownerId, pieces, clonning),
    );
    await this.exportRepository.save(exportRequest);

    exportRequest.commit();

    return {
      exportId: exportRequest.id,
      importResourceId: exportRequest.importResourceId,
    };
  }
}
