import { ResourceId } from '@marxan/cloning/domain';
import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { isLeft, right } from 'fp-ts/Either';
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
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    projectId,
  }: RunLegacyProjectImport): Promise<RunLegacyProjectImportResponse> {
    const legacyProjectImportOrError = await this.legacyProjectImportRepository.find(
      new ResourceId(projectId),
    );

    if (isLeft(legacyProjectImportOrError)) return legacyProjectImportOrError;

    const legacyProjectImport = this.eventPublisher.mergeObjectContext(
      legacyProjectImportOrError.right,
    );

    const result = legacyProjectImport.start();

    if (isLeft(result)) return result;

    // TODO start transaction for saving the and adding permissions
    const legacyProjectImportSaveError = await this.legacyProjectImportRepository.save(
      legacyProjectImport,
    );

    if (isLeft(legacyProjectImportSaveError))
      return legacyProjectImportSaveError;

    // TODO add permissions

    legacyProjectImport.commit();

    return right(true);
  }
}
