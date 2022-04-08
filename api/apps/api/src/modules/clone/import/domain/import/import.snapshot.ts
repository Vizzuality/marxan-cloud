import { ResourceKind } from '@marxan/cloning/domain';
import { ImportComponentSnapshot } from './import-component.snapshot';

export interface ImportSnapshot {
  id: string;
  resourceId: string;
  resourceKind: ResourceKind;
  archiveLocation: string;
  importPieces: ImportComponentSnapshot[];
  projectId: string;
  ownerId: string;
}
