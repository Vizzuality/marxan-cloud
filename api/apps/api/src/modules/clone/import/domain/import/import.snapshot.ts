import { ResourceKind } from '@marxan/cloning/domain';
import { ImportComponentSnapshot } from './import-component.snapshot';

export type ImportComponents = ImportComponentSnapshot[];

export interface ImportSnapshot {
  id: string;
  resourceId: string;
  resourceKind: ResourceKind;
  archiveLocation: string;
  importPieces: ImportComponents;
}
