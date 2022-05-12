import { LegacyProjectImportFileSnapshot } from '@marxan/legacy-project-import';
import { LegacyProjectImportComponentSnapshot } from './legacy-project-import-component.snapshot';

export interface LegacyProjectImportSnapshot {
  readonly id: string;
  readonly projectId: string;
  readonly scenarioId: string;
  readonly ownerId: string;
  readonly isAcceptingFiles: boolean;
  readonly pieces: LegacyProjectImportComponentSnapshot[];
  readonly files: LegacyProjectImportFileSnapshot[];
}
