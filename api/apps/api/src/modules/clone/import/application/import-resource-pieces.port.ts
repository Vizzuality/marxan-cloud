import {
  ArchiveLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import {
  ProjectExportConfigContent,
  ScenarioExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { ImportComponent } from '../domain';

export abstract class ImportResourcePieces {
  abstract resolveForProject(
    id: ResourceId,
    archiveLocation: ArchiveLocation,
    pieces: ProjectExportConfigContent['pieces'],
  ): ImportComponent[];

  abstract resolveForScenario(
    id: ResourceId,
    archiveLocation: ArchiveLocation,
    pieces: ScenarioExportConfigContent['pieces'],
    kind: ResourceKind,
    oldScenarioId: string,
  ): ImportComponent[];
}
