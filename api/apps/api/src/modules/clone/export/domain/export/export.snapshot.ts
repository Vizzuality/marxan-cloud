import { ResourceKind } from './resource.kind';
import { ExportComponentSnapshot } from './export-component.snapshot';

export interface ExportSnapshot {
  id: string;
  resourceId: string;
  resourceKind: ResourceKind;
  archiveLocation?: string;
  exportPieces: ExportComponentSnapshot[];
}
