import {
  ArchiveLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import { ExportRepository } from '../../export/application/export-repository.port';
import {
  exportNotFound,
  unfinishedExport,
} from '../../export/application/get-archive.query';
import { Import } from '../domain/import/import';
import {
  ImportProject,
  ImportProjectCommandResult,
  ImportProjectError,
  invalidProjectExport,
} from './import-project.command';
import { ImportResourcePieces } from './import-resource-pieces.port';
import { ImportRepository } from './import.repository.port';

@CommandHandler(ImportProject)
export class ImportProjectHandler
  implements IInferredCommandHandler<ImportProject> {
  constructor(
    private readonly exportRepo: ExportRepository,
    private readonly importRepo: ImportRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly importResourcePieces: ImportResourcePieces,
  ) {}

  async execute({
    exportId,
    ownerId,
    projectName,
  }: ImportProject): Promise<
    Either<ImportProjectError, ImportProjectCommandResult>
  > {
    const exportInstance = await this.exportRepo.find(exportId);

    if (!exportInstance) {
      return left(exportNotFound);
    }

    if (!exportInstance.hasFinished()) {
      return left(unfinishedExport);
    }

    if (!exportInstance.isForProject()) {
      return left(invalidProjectExport);
    }

    const resourceId = exportInstance.importResourceId ?? ResourceId.create();
    const isCloning = exportInstance.isCloning();

    const projectId = resourceId;
    const oldProjectId = exportInstance.resourceId;

    const pieces = this.importResourcePieces.resolveForProject(
      projectId,
      exportInstance.toSnapshot().exportPieces,
      oldProjectId,
    );

    const archiveLocation = new ArchiveLocation(
      exportInstance.toSnapshot().archiveLocation!,
    );

    const importRequest = this.eventPublisher.mergeObjectContext(
      Import.newOne(
        resourceId,
        ResourceKind.Project,
        projectId,
        ownerId,
        archiveLocation,
        pieces,
        isCloning,
        exportId,
        projectName,
      ),
    );

    importRequest.run();

    const result = await this.importRepo.save(importRequest);

    if (isLeft(result)) return result;

    importRequest.commit();

    return right({
      importId: importRequest.importId.value,
      projectId: projectId.value,
    });
  }
}
