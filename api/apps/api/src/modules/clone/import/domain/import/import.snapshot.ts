import {
  ArchiveLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ImportComponentSnapshot } from './import-component.snapshot';
import { ImportId } from '@marxan-api/modules/clone/import';

export type ImportComponents = ImportComponentSnapshot[];

export interface ImportSnapshot {
  id: ImportId;
  resourceId: ResourceId;
  resourceKind: ResourceKind;
  archiveLocation: ArchiveLocation;
  importPieces: ImportComponents;
}
