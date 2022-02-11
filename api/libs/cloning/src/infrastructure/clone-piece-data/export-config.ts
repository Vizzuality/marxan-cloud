import { ClonePiece } from '../../domain/clone-piece';
import { ResourceKind } from '../../domain/resource.kind';

interface CommonFields {
  version: string;
  resourceKind: ResourceKind;
  resourceId: string;
  pieces: ClonePiece[];
  name: string;
  description: string;
}

export interface ProjectExportConfigContent extends CommonFields {
  scenarios: { id: string; name: string }[];
}

export interface ScenarioExportConfigContent extends CommonFields {
  projectId: string;
}

export type ExportConfigContent =
  | ProjectExportConfigContent
  | ScenarioExportConfigContent;

export const ExportConfigRelativePath = 'config.json';
