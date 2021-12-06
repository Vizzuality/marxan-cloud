import { ArchiveLocation } from '@marxan-api/modules/clone/shared-kernel/archive-location';
import { ResourceKind } from '@marxan-api/modules/clone/shared-kernel/resource.kind';
import { ImportComponentSnapshot } from './import.component.snapshot';

export type ImportComponents = Array<
  ImportComponentSnapshot & { order: number }
>;

export interface ImportSnapshot {
  id: string;
  resourceId: string;
  resourceKind: ResourceKind;
  archiveLocation: ArchiveLocation;
  importPieces: ImportComponents;
}
