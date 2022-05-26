import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { Query } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { forbiddenError } from '../../access-control';
import { LegacyProjectImportComponentSnapshot } from '../domain/legacy-project-import/legacy-project-import-component.snapshot';
import { LegacyProjectImportRepositoryFindErrors } from '../domain/legacy-project-import/legacy-project-import.repository';

export type GetLegacyProjectImportErrorsErrors =
  | LegacyProjectImportRepositoryFindErrors
  | typeof forbiddenError;

export type GetLegacyProjectImportErrorsResult = Omit<
  LegacyProjectImportComponentSnapshot,
  'order'
>[];

export type GetLegacyProjectImportErrorsReturnType = Either<
  GetLegacyProjectImportErrorsErrors,
  GetLegacyProjectImportErrorsResult
>;

export class GetLegacyProjectImportErrors extends Query<GetLegacyProjectImportErrorsReturnType> {
  constructor(
    public readonly projectId: ResourceId,
    public readonly userId: UserId,
  ) {
    super();
  }
}
