import { ResourceKind } from '@marxan/cloning/domain';
import { ExportComponentSnapshot } from './export-component.snapshot';

export interface ExportSnapshot {
  id: string;
  resourceId: string;
  resourceKind: ResourceKind;
  ownerId: string;
  importResourceId?: string;
  archiveLocation?: string;
  exportPieces: ExportComponentSnapshot[];
}
