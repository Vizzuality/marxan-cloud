import { ResourceId, ResourceKind, ExportComponentSnapshot } from '../domain';

export abstract class ResourcePieces {
  abstract resolveFor(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponentSnapshot[]>;
}
