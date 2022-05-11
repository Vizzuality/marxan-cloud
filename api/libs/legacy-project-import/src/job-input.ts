import { LegacyProjectImportPiece } from './domain/legacy-project-import-piece';

export interface LegacyProjectImportJobInput {
  readonly legacyProjectImportId: string;
  readonly pieceId: string;
  readonly resourceId: string;
  readonly projectId: string;
  readonly piece: LegacyProjectImportPiece;
}
