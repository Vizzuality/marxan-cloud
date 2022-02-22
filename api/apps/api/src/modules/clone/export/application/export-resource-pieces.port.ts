import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { ExportComponent } from '../domain';

export abstract class ExportResourcePieces {
  abstract resolveFor(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponent[]>;
}
