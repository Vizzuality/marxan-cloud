import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';

import { ResourceKind } from '@marxan/cloning/domain';
import { Export, ExportId } from '../domain';

import { ExportProject } from './export-project.command';
import { ExportResourcePieces } from './export-resource-pieces.port';
import { ExportRepository } from './export-repository.port';

@CommandHandler(ExportProject)
export class ExportProjectHandler
  implements IInferredCommandHandler<ExportProject>
{
  constructor(
    private readonly resourcePieces: ExportResourcePieces,
    private readonly exportRepository: ExportRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ id }: ExportProject): Promise<ExportId> {
    const kind = ResourceKind.Project;
    const pieces = await this.resourcePieces.resolveFor(id, kind);
    const exportRequest = this.eventPublisher.mergeObjectContext(
      Export.newOne(id, kind, pieces),
    );
    await this.exportRepository.save(exportRequest);

    exportRequest.commit();

    return exportRequest.id;
  }
}
