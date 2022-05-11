import { LegacyProjectImportComponentSnapshot } from './legacy-project-import-component.snapshot';

export interface LegacyProjectImportSnapshot {
  readonly id: string;
  readonly projectId: string;
  readonly ownerId: string;
  readonly pieces: LegacyProjectImportComponentSnapshot[];
}
