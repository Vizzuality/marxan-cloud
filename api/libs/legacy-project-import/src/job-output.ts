import { LegacyProjectImportPiece } from './domain/legacy-project-import-piece';

export interface LegacyProjectImportJobOutput {
  readonly legacyProjectImportId: string;
  readonly projectId: string;
  readonly resourceId: string;
  readonly pieceId: string;
  readonly piece: LegacyProjectImportPiece;
}
