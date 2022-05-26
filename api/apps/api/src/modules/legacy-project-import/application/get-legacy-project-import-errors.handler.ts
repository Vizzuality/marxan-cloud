import { QueryHandler, IInferredQueryHandler } from '@nestjs/cqrs';
import { isLeft, left, right } from 'fp-ts/lib/Either';
import { forbiddenError } from '../../access-control';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import {
  GetLegacyProjectImportErrors,
  GetLegacyProjectImportErrorsReturnType,
} from './get-legacy-project-import-errors.query';

@QueryHandler(GetLegacyProjectImportErrors)
export class GetLegacyProjectImportErrorsHandler
  implements IInferredQueryHandler<GetLegacyProjectImportErrors> {
  constructor(
    private readonly legacyProjectImportRepo: LegacyProjectImportRepository,
  ) {}

  async execute({
    projectId,
    userId,
  }: GetLegacyProjectImportErrors): Promise<GetLegacyProjectImportErrorsReturnType> {
    const legacyProjectImport = await this.legacyProjectImportRepo.find(
      projectId,
    );

    if (isLeft(legacyProjectImport)) return legacyProjectImport;

    const { ownerId } = legacyProjectImport.right.toSnapshot();

    if (ownerId !== userId.value) return left(forbiddenError);

    const piecesWithErrorsOrWarnings = legacyProjectImport.right.getPiecesWithErrorsOrWarnings();

    return right(
      piecesWithErrorsOrWarnings
        .map((piece) => piece.toSnapshot())
        .map(({ order, id, ...piece }) => ({ ...piece, componentId: id })),
    );
  }
}
