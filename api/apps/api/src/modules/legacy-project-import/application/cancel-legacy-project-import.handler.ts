import { forbiddenError } from '@marxan-api/modules/access-control';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { isLeft, left, right } from 'fp-ts/lib/Either';
import { Repository } from 'typeorm';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import {
  CancelLegacyProjectImport,
  CancelLegacyProjectImportResponse,
} from './cancel-legacy-project-import.command';

@CommandHandler(CancelLegacyProjectImport)
export class CancelLegacyProjectImportHandler
  implements IInferredCommandHandler<CancelLegacyProjectImport>
{
  constructor(
    private readonly legacyProjectImportRepo: LegacyProjectImportRepository,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async execute({
    projectId,
    userId,
  }: CancelLegacyProjectImport): Promise<CancelLegacyProjectImportResponse> {
    return this.legacyProjectImportRepo.transaction(async (repo) => {
      const legacyProjectImport = await repo.find(projectId);

      if (isLeft(legacyProjectImport)) return legacyProjectImport;

      if (legacyProjectImport.right.toSnapshot().ownerId !== userId.value) {
        return left(forbiddenError);
      }

      const legacyProjectImportAggregate = legacyProjectImport.right;

      const alreadyStarted =
        legacyProjectImportAggregate.importProcessAlreadyStarted();

      if (!alreadyStarted) {
        await this.projectRepo.delete(projectId.value);
      }

      const legacyProjectImportHalted =
        legacyProjectImportAggregate.haltLegacyProjectImport();

      if (isLeft(legacyProjectImportHalted)) return legacyProjectImportHalted;

      const saveResult = await repo.save(legacyProjectImportAggregate);

      if (isLeft(saveResult)) return saveResult;

      return right(true);
    });
  }
}
