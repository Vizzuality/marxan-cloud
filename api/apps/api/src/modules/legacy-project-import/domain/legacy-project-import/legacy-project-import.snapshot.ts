import { LegacyProjectImportFileSnapshot } from '@marxan/legacy-project-import';
import { LegacyProjectImportComponentSnapshot } from './legacy-project-import-component.snapshot';
import { LegacyProjectImportStatuses } from './legacy-project-import-status';

export interface LegacyProjectImportSnapshot {
  readonly id: string;
  readonly projectId: string;
  readonly scenarioId: string;
  readonly ownerId: string;
  readonly status: LegacyProjectImportStatuses;
  readonly pieces: LegacyProjectImportComponentSnapshot[];
  readonly files: LegacyProjectImportFileSnapshot[];
  readonly toBeRemoved: boolean;
}
