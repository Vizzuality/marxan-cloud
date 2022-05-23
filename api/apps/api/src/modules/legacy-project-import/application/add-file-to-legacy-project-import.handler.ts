import { ArchiveLocation } from '@marxan/cloning/domain';
import {
  LegacyProjectImportFile,
  LegacyProjectImportFilesRepository,
} from '@marxan/legacy-project-import';
import { Logger } from '@nestjs/common';
import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { forbiddenError } from '../../access-control';
import { LegacyProjectImport } from '../domain/legacy-project-import/legacy-project-import';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import {
  AddFileToLegacyProjectImport,
  AddFileToLegacyProjectImportHandlerErrors,
} from './add-file-to-legacy-project-import.command';

@CommandHandler(AddFileToLegacyProjectImport)
export class AddFileToLegacyProjectImportHandler
  implements IInferredCommandHandler<AddFileToLegacyProjectImport> {
  constructor(
    private readonly legacyProjectImportRepo: LegacyProjectImportRepository,
    private readonly legacyProjectImportFilesRepo: LegacyProjectImportFilesRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(AddFileToLegacyProjectImportHandler.name);
  }

  async execute({
    file,
    projectId,
    type,
    userId,
  }: AddFileToLegacyProjectImport): Promise<
    Either<
      AddFileToLegacyProjectImportHandlerErrors | typeof forbiddenError,
      true
    >
  > {
    const result = await this.legacyProjectImportRepo.transaction(
      async (repo) => {
        const legacyProjectImport = await repo.find(projectId);

        if (isLeft(legacyProjectImport)) return legacyProjectImport.left;

        if (legacyProjectImport.right.toSnapshot().ownerId !== userId.value) {
          return forbiddenError;
        }

        const legacyProjectImportAggregate = this.eventPublisher.mergeObjectContext(
          legacyProjectImport.right,
        );

        const pathOrError = await this.legacyProjectImportFilesRepo.saveFile(
          projectId.value,
          Readable.from(file),
          type,
        );

        if (isLeft(pathOrError)) return pathOrError.left;

        const archiveLocation = new ArchiveLocation(pathOrError.right);
        const legacyProjectImportFile = LegacyProjectImportFile.newOne(
          type,
          archiveLocation,
        );

        const addFileResult = legacyProjectImportAggregate.addFile(
          legacyProjectImportFile,
        );

        if (isLeft(addFileResult)) return addFileResult.left;

        const saveResult = await repo.save(legacyProjectImportAggregate);

        if (isLeft(saveResult)) return saveResult.left;

        return legacyProjectImportAggregate;
      },
    );

    if (result instanceof LegacyProjectImport) {
      result.commit();
      return right(true);
    }

    return left(result);
  }
}
