import { ResourceId } from '@marxan/cloning/domain';
import { ExportComponentSnapshot } from '../../export/domain';
import { ImportComponent } from '../domain';

export abstract class ImportResourcePieces {
  abstract resolveForProject(
    id: ResourceId,
    pieces: ExportComponentSnapshot[],
    oldProjectId: ResourceId,
  ): ImportComponent[];

  abstract resolveForScenario(
    id: ResourceId,
    pieces: ExportComponentSnapshot[],
  ): ImportComponent[];
}
