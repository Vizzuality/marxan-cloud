import { forbiddenError } from '@marxan-api/modules/access-control';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { isLeft, right, left } from 'fp-ts/Either';
import { Repository } from 'typeorm';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import {
  RunLegacyProjectImport,
  RunLegacyProjectImportResponse,
} from './run-legacy-project-import.command';

@CommandHandler(RunLegacyProjectImport)
export class RunLegacyProjectImportHandler
  implements IInferredCommandHandler<RunLegacyProjectImport> {
  constructor(
    private readonly legacyProjectImportRepository: LegacyProjectImportRepository,
    @InjectRepository(UsersProjectsApiEntity)
    private readonly usersRepo: Repository<UsersProjectsApiEntity>,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    projectId,
    userId,
  }: RunLegacyProjectImport): Promise<RunLegacyProjectImportResponse> {
    const legacyProjectImportOrError = await this.legacyProjectImportRepository.find(
      projectId,
    );

    if (isLeft(legacyProjectImportOrError)) return legacyProjectImportOrError;

    const legacyProjectImport = this.eventPublisher.mergeObjectContext(
      legacyProjectImportOrError.right,
    );

    const { ownerId } = legacyProjectImport.toSnapshot();

    if (userId.value !== ownerId) return left(forbiddenError);

    const result = legacyProjectImport.run();

    if (isLeft(result)) return result;

    const legacyProjectImportSaveError = await this.legacyProjectImportRepository.save(
      legacyProjectImport,
    );

    if (isLeft(legacyProjectImportSaveError))
      return legacyProjectImportSaveError;

    legacyProjectImport.commit();

    return right(true);
  }
}
