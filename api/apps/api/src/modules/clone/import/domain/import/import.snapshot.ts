import { ArchiveLocation, ResourceKind } from '@marxan/cloning/domain';
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
