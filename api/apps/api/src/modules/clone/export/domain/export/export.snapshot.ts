import { ResourceKind } from './resource.kind';
import { ClonePartSnapshot } from './clone-part.snapshot';

export interface ExportSnapshot {
  id: string;
  resourceId: string;
  resourceKind: ResourceKind;
  archiveLocation?: string;
  exportPieces: ClonePartSnapshot[];
}
