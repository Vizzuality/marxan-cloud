import { LegacyProjectImportPiece } from './domain';

export interface LegacyProjectImportJobInput {
  readonly legacyProjectImportId: string;
  readonly pieceId: string;
  readonly resourceId: string;
  readonly projectId: string;
  readonly piece: LegacyProjectImportPiece;
}
