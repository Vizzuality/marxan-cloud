import { LegacyProjectImportPiece } from '@marxan/legacy-project-import';
import { LegacyProjectImportComponentStatuses } from './legacy-project-import-component-status';

export interface LegacyProjectImportComponentSnapshot {
  readonly id: string;
  readonly kind: LegacyProjectImportPiece;
  readonly order: number;
  readonly status: LegacyProjectImportComponentStatuses;
  readonly errors: string[];
  readonly warnings: string[];
}
