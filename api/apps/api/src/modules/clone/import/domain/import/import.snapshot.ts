import {
  ArchiveLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ImportComponentSnapshot } from './import-component.snapshot';

export type ImportComponents = ImportComponentSnapshot[];

export interface ImportSnapshot {
  id: string;
  resourceId: ResourceId;
  resourceKind: ResourceKind;
  archiveLocation: ArchiveLocation;
  importPieces: ImportComponents;
}
