import {
  CommandHandler,
  IInferredCommandHandler,
} from '@nestjs-architects/typed-cqrs';
import { Either, isLeft, right } from 'fp-ts/lib/Either';
import { SimpleJobStatus } from '../../scenarios/scenario.api.entity';
import { SpecificationService } from '../../scenarios/specification';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import {
  LaunchLegacyProjectImportSpecification,
  LaunchLegacyProjectImportSpecificationHandlerErrors,
} from './launch-legacy-project-import-specification.command';

@CommandHandler(LaunchLegacyProjectImportSpecification)
export class LaunchLegacyProjectImportSpecificationHandler
  implements IInferredCommandHandler<LaunchLegacyProjectImportSpecification>
{
  constructor(
    private readonly legacyProjectImportRepo: LegacyProjectImportRepository,
    private readonly specificationService: SpecificationService,
  ) {}

  async execute({
    features,
    projectId,
  }: LaunchLegacyProjectImportSpecification): Promise<
    Either<LaunchLegacyProjectImportSpecificationHandlerErrors, boolean>
  > {
    const legacyProjectImportOrError =
      await this.legacyProjectImportRepo.find(projectId);

    if (isLeft(legacyProjectImportOrError)) return legacyProjectImportOrError;

    const { scenarioId } = legacyProjectImportOrError.right.toSnapshot();

    const result = await this.specificationService.submit(
      scenarioId,
      projectId.value,
      {
        status: SimpleJobStatus.created,
        features,
      },
    );

    if (isLeft(result)) return result;

    return right(true);
  }
}
