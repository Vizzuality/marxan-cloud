import { LegacyProjectImportPiece } from '@marxan/legacy-project-import';
import { LegacyProjectImportComponentStatuses } from './legacy-project-import-component-status';

export interface LegacyProjectImportComponentSnapshot {
  readonly id: string;
  readonly kind: LegacyProjectImportPiece;
  readonly resourceId: string;
  readonly order: number;
  readonly archiveLocation?: string;
  readonly status: LegacyProjectImportComponentStatuses;
}
