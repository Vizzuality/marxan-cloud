import {
  ArchiveLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ProjectExportConfigContent } from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { ImportComponent } from '../domain';

export abstract class ImportResourcePieces {
  abstract resolveForProject(
    id: ResourceId,
    archiveLocation: ArchiveLocation,
    scenarios: ProjectExportConfigContent['scenarios'],
  ): ImportComponent[];

  abstract resolveForScenario(
    id: ResourceId,
    kind: ResourceKind,
    archiveLocation: ArchiveLocation,
  ): ImportComponent[];
}
