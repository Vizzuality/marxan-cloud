import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { isLeft, right, left } from 'fp-ts/Either';
import { Repository } from 'typeorm';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import {
  UpdateSolutionsAreLocked,
  UpdateSolutionsAreLockedResponse,
  updateSolutionsAreLockFailed,
} from './update-solutions-are-locked-to-legacy-project-import.command';

@CommandHandler(UpdateSolutionsAreLocked)
export class UpdateSolutionsAreLockedHandler
  implements IInferredCommandHandler<UpdateSolutionsAreLocked>
{
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Scenario)
    private readonly scenarioRepo: Repository<Scenario>,
    private readonly legacyProjectImportRepository: LegacyProjectImportRepository,
  ) {}

  async execute({
    projectId,
    solutionsAreLocked,
  }: UpdateSolutionsAreLocked): Promise<UpdateSolutionsAreLockedResponse> {
    if (!solutionsAreLocked) return right(true);

    const legacyProjectImportOrError =
      await this.legacyProjectImportRepository.find(projectId);

    if (isLeft(legacyProjectImportOrError)) return legacyProjectImportOrError;

    const { scenarioId } = legacyProjectImportOrError.right.toSnapshot();

    try {
      await this.scenarioRepo.save({
        id: scenarioId,
        solutionsAreLocked,
      });
    } catch (error) {
      return left(updateSolutionsAreLockFailed);
    }

    return right(true);
  }
}
