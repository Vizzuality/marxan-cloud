import { ResourceId } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { SpecForPlainGeoFeature } from '../../geo-features/dto/geo-feature-set-specification.dto';
import { internalError } from '../../specification/application/submit-specification.command';
import { LegacyProjectImportRepositoryFindErrors } from '../domain/legacy-project-import/legacy-project-import.repository';

export type LaunchLegacyProjectImportSpecificationHandlerErrors =
  | LegacyProjectImportRepositoryFindErrors
  | typeof internalError;

export class LaunchLegacyProjectImportSpecification extends Command<
  Either<LaunchLegacyProjectImportSpecificationHandlerErrors, boolean>
> {
  constructor(
    public readonly projectId: ResourceId,
    public readonly features: SpecForPlainGeoFeature[],
  ) {
    super();
  }
}
