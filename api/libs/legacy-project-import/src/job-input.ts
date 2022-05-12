import { LegacyProjectImportFileSnapshot } from './domain';
import { LegacyProjectImportPiece } from './domain/legacy-project-import-piece';

export interface LegacyProjectImportJobInput {
  readonly legacyProjectImportId: string;
  readonly pieceId: string;
  readonly files: LegacyProjectImportFileSnapshot[];
  readonly projectId: string;
  readonly scenarioId: string;
  readonly piece: LegacyProjectImportPiece;
}
