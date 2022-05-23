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
  DeleteFileFromLegacyProjectImport,
  DeleteFileFromLegacyProjectImportHandlerErrors,
} from './delete-file-from-legacy-project-import.command';

@CommandHandler(DeleteFileFromLegacyProjectImport)
export class DeleteFileFromLegacyProjectImportHandler
  implements IInferredCommandHandler<DeleteFileFromLegacyProjectImport> {
  constructor(
    private readonly legacyProjectImportRepo: LegacyProjectImportRepository,
    private readonly legacyProjectImportFilesRepo: LegacyProjectImportFilesRepository,
  ) {}

  async execute({
    projectId,
    fileId,
    userId,
  }: DeleteFileFromLegacyProjectImport): Promise<
    Either<DeleteFileFromLegacyProjectImportHandlerErrors, true>
  > {
    return this.legacyProjectImportRepo.transaction(async (repo) => {
      const legacyProjectImport = await repo.find(projectId);

      if (isLeft(legacyProjectImport)) return legacyProjectImport;

      if (legacyProjectImport.right.toSnapshot().ownerId !== userId.value) {
        return left(forbiddenError);
      }

      const legacyProjectImportAggregate = legacyProjectImport.right;

      const deletedFile = legacyProjectImportAggregate.deleteFile(fileId);

      if (deletedFile) {
        await this.legacyProjectImportFilesRepo.deleteFile(
          deletedFile.toSnapshot().location,
        );
      }

      const saveResult = await repo.save(legacyProjectImportAggregate);

      if (isLeft(saveResult)) return saveResult;

      return right(true);
    });
  }
}
