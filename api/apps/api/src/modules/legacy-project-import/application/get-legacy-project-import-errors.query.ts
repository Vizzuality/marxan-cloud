import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { LegacyProjectImportPiece } from '@marxan/legacy-project-import';
import { Query } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { forbiddenError } from '../../access-control';
import { LegacyProjectImportComponentStatuses } from '../domain/legacy-project-import/legacy-project-import-component-status';
import { LegacyProjectImportRepositoryFindErrors } from '../domain/legacy-project-import/legacy-project-import.repository';

export type GetLegacyProjectImportErrorsErrors =
  | LegacyProjectImportRepositoryFindErrors
  | typeof forbiddenError;

export type LegacyProjectImportComponentReport = {
  readonly componentId: string;
  readonly kind: LegacyProjectImportPiece;
  readonly status: LegacyProjectImportComponentStatuses;
  readonly errors: string[];
  readonly warnings: string[];
};

export type GetLegacyProjectImportErrorsResult = LegacyProjectImportComponentReport[];

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
