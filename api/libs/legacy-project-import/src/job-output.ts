import { LegacyProjectImportFileSnapshot } from './domain/legacy-project-import-file.snapshot';
import { LegacyProjectImportPiece } from './domain/legacy-project-import-piece';

export interface LegacyProjectImportJobOutput {
  readonly legacyProjectImportId: string;
  readonly pieceId: string;
  readonly files: LegacyProjectImportFileSnapshot[];
  readonly projectId: string;
  readonly scenarioId: string;
  readonly piece: LegacyProjectImportPiece;
  readonly warnings?: string[];
}

export interface FailedLegacyProjectImportDbCleanupJobOutput {
  readonly projectId: string;
}
