import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { ExportComponent } from '../domain';

export abstract class ExportResourcePieces {
  abstract resolveForProject(
    id: ResourceId,
    scenarioIds: string[],
  ): Promise<ExportComponent[]>;

  abstract resolveForScenario(
    id: ResourceId,
    kind: ResourceKind,
  ): ExportComponent[];
}
